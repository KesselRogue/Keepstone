import Phaser from "phaser";
import type { EquipSlot } from "../types/Character";
import type { ItemInstance } from "../types/Item";
import { playerCharacter, persistCharacter } from "../systems/gameState";
import { getEffectiveStats, equipItem, unequipItem, sellItem, destroyItem } from "../systems/InventorySystem";
import { RARITY_CONFIG } from "../data/rarity";
import { CATEGORY_ICON } from "../ui/itemIcons";
import { ItemCard } from "../ui/ItemCard";

interface SlotLayoutEntry {
  slot: EquipSlot;
  x: number;
  y: number;
  label: string;
}

const SLOT_LAYOUT: SlotLayoutEntry[] = [
  { slot: "head", x: 230, y: 110, label: "Head" },
  { slot: "necklace", x: 320, y: 140, label: "Neck" },
  { slot: "shoulders", x: 140, y: 160, label: "Shldr" },
  { slot: "chest", x: 230, y: 190, label: "Chest" },
  { slot: "gauntlets", x: 140, y: 260, label: "Hands" },
  { slot: "offHand", x: 320, y: 260, label: "Off" },
  { slot: "belt", x: 230, y: 260, label: "Belt" },
  { slot: "mainHand", x: 140, y: 330, label: "Main" },
  { slot: "greaves", x: 230, y: 330, label: "Legs" },
  { slot: "ring1", x: 320, y: 330, label: "Ring" },
  { slot: "boots", x: 230, y: 400, label: "Boots" },
  { slot: "ring2", x: 320, y: 400, label: "Ring" },
];

const SLOT_BOX_SIZE = 44;
const INV_GRID_X = 470;
const INV_GRID_Y = 110;
const INV_COLS = 5;
const INV_CELL = 62;
const SELL_ZONE = { x: 545, y: 560, w: 150, h: 46 };
const DESTROY_ZONE = { x: 705, y: 560, w: 150, h: 46 };

export class CharacterScene extends Phaser.Scene {
  private returnSceneKey = "Town";
  private iconObjects: Phaser.GameObjects.GameObject[] = [];
  private statsText!: Phaser.GameObjects.Text;
  private itemCard!: ItemCard;

  constructor() {
    super("Character");
  }

  create(data: { returnScene: string }): void {
    this.returnSceneKey = data?.returnScene ?? "Town";
    this.iconObjects = [];
    this.itemCard = new ItemCard(this);
    // Phaser's default drag threshold is 0px, so any sub-pixel jitter
    // during a plain click gets misread as a drag — give clicks a little
    // room so click-for-details and drag-to-equip don't fight each other.
    this.input.dragDistanceThreshold = 6;

    this.add.rectangle(0, 0, 800, 600, 0x000000, 0.78).setOrigin(0, 0).setDepth(0);
    this.add
      .text(400, 24, "Character", { fontSize: "22px", color: "#ffffff", fontStyle: "bold" })
      .setOrigin(0.5)
      .setDepth(1);
    this.add
      .text(400, 50, "[C] or [ESC] to close   •   click for details, drag to equip / unequip / sell / destroy", {
        fontSize: "12px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5)
      .setDepth(1);

    this.statsText = this.add.text(470, 478, "", { fontSize: "13px", color: "#dddddd", lineSpacing: 4 }).setDepth(1);

    this.drawDoll();
    this.drawSlotBoxes();
    this.drawInventoryArea();
    this.drawSellDestroyZones();

    this.input.on("dragstart", (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.GameObject) =>
      obj.setData("wasDragged", true),
    );
    this.input.on(
      "drag",
      (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Image, dragX: number, dragY: number) => {
        obj.x = dragX;
        obj.y = dragY;
        const bg = obj.getData("bg") as Phaser.GameObjects.Rectangle | undefined;
        if (bg) bg.setPosition(dragX, dragY);
      },
    );
    this.input.on(
      "drop",
      (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Image, zone: Phaser.GameObjects.Zone) => {
        this.handleDrop(obj, zone);
      },
    );
    this.input.on("dragend", () => this.renderIcons());

    this.input.keyboard?.on("keydown-C", () => this.close());
    this.input.keyboard?.on("keydown-ESC", () => this.close());

    this.renderIcons();
  }

  private drawDoll(): void {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x2a3550, 1);
    g.fillCircle(230, 150, 26); // head
    g.fillRoundedRect(190, 180, 80, 120, 10); // torso
    g.fillRect(200, 300, 26, 90); // left leg
    g.fillRect(244, 300, 26, 90); // right leg
    g.lineStyle(2, 0x4a5a80, 1);
    g.strokeCircle(230, 150, 26);
    g.strokeRoundedRect(190, 180, 80, 120, 10);
  }

  private drawSlotBoxes(): void {
    for (const entry of SLOT_LAYOUT) {
      this.add
        .rectangle(entry.x, entry.y, SLOT_BOX_SIZE, SLOT_BOX_SIZE, 0x1a1a22, 0.7)
        .setStrokeStyle(2, 0x666677)
        .setDepth(1);
      this.add
        .text(entry.x, entry.y + SLOT_BOX_SIZE / 2 + 8, entry.label, { fontSize: "10px", color: "#999999" })
        .setOrigin(0.5, 0)
        .setDepth(1);

      const zone = this.add.zone(entry.x, entry.y, SLOT_BOX_SIZE, SLOT_BOX_SIZE).setRectangleDropZone(SLOT_BOX_SIZE, SLOT_BOX_SIZE);
      zone.setData("kind", "slot");
      zone.setData("slot", entry.slot);
    }
  }

  private drawInventoryArea(): void {
    this.add
      .text(INV_GRID_X, INV_GRID_Y - 24, "Inventory", { fontSize: "14px", color: "#cccccc" })
      .setDepth(1);
    const cols = INV_COLS;
    const rows = 6;
    const w = cols * INV_CELL;
    const h = rows * INV_CELL;
    this.add.rectangle(INV_GRID_X - 10, INV_GRID_Y - 10, w, h, 0x14141a, 0.6).setOrigin(0, 0).setDepth(0);

    const zone = this.add.zone(INV_GRID_X - 10 + w / 2, INV_GRID_Y - 10 + h / 2, w, h).setRectangleDropZone(w, h);
    zone.setData("kind", "inventory-area");
  }

  private drawSellDestroyZones(): void {
    this.add
      .rectangle(SELL_ZONE.x, SELL_ZONE.y, SELL_ZONE.w, SELL_ZONE.h, 0x1a3320, 0.8)
      .setStrokeStyle(2, 0x3fd15e)
      .setDepth(1);
    this.add
      .text(SELL_ZONE.x, SELL_ZONE.y, "SELL\ndrag item here for gold", { fontSize: "11px", color: "#8fe0a0", align: "center" })
      .setOrigin(0.5)
      .setDepth(2);
    const sellZone = this.add.zone(SELL_ZONE.x, SELL_ZONE.y, SELL_ZONE.w, SELL_ZONE.h).setRectangleDropZone(SELL_ZONE.w, SELL_ZONE.h);
    sellZone.setData("kind", "sell");

    this.add
      .rectangle(DESTROY_ZONE.x, DESTROY_ZONE.y, DESTROY_ZONE.w, DESTROY_ZONE.h, 0x331a1a, 0.8)
      .setStrokeStyle(2, 0xd23c3c)
      .setDepth(1);
    this.add
      .text(DESTROY_ZONE.x, DESTROY_ZONE.y, "DESTROY\ndrag item here to discard", { fontSize: "11px", color: "#e08f8f", align: "center" })
      .setOrigin(0.5)
      .setDepth(2);
    const destroyZone = this.add
      .zone(DESTROY_ZONE.x, DESTROY_ZONE.y, DESTROY_ZONE.w, DESTROY_ZONE.h)
      .setRectangleDropZone(DESTROY_ZONE.w, DESTROY_ZONE.h);
    destroyZone.setData("kind", "destroy");
  }

  private createItemIcon(item: ItemInstance, x: number, y: number, size: number, sourceSlot?: EquipSlot): void {
    const rarity = RARITY_CONFIG[item.rarity];
    const bg = this.add.rectangle(x, y, size, size, 0x1a1a22, 0.9).setStrokeStyle(3, rarity.color).setDepth(2);
    const icon = this.add
      .image(x, y, CATEGORY_ICON[item.category])
      .setDisplaySize(size - 14, size - 14)
      .setTint(item.color)
      .setDepth(3)
      .setInteractive({ useHandCursor: true });

    icon.setData("instanceId", item.instanceId);
    icon.setData("bg", bg);
    if (sourceSlot) icon.setData("sourceSlot", sourceSlot);
    this.input.setDraggable(icon);

    icon.on("pointerover", () => this.showTooltip(item.name, item.rarity, item.rolledStats));
    icon.on("pointerout", () => this.statsText.setText(this.summaryText()));
    icon.on("pointerdown", () => icon.setData("wasDragged", false));
    icon.on("pointerup", () => {
      if (!icon.getData("wasDragged")) this.openCard(item, sourceSlot);
    });

    this.iconObjects.push(bg, icon);
  }

  private openCard(item: ItemInstance, sourceSlot?: EquipSlot): void {
    const actions = sourceSlot
      ? [
          {
            label: "Unequip",
            color: 0x444a66,
            onClick: () => {
              unequipItem(playerCharacter, sourceSlot);
              persistCharacter();
              this.renderIcons();
            },
          },
        ]
      : [
          {
            label: `Sell ${RARITY_CONFIG[item.rarity].sellValue}g`,
            color: 0x2a6b3a,
            onClick: () => {
              const gold = sellItem(playerCharacter, item.instanceId);
              if (gold > 0) this.floatingText(SELL_ZONE.x, SELL_ZONE.y, `+${gold}g`, "#8fe0a0");
              persistCharacter();
              this.renderIcons();
            },
          },
          {
            label: "Destroy",
            color: 0x6b2a2a,
            onClick: () => {
              destroyItem(playerCharacter, item.instanceId);
              persistCharacter();
              this.renderIcons();
            },
          },
        ];
    this.itemCard.show(item, actions);
  }

  private renderIcons(): void {
    for (const obj of this.iconObjects) obj.destroy();
    this.iconObjects = [];

    const character = playerCharacter;

    for (const entry of SLOT_LAYOUT) {
      const item = character.equipped[entry.slot];
      if (!item) continue;
      this.createItemIcon(item, entry.x, entry.y, SLOT_BOX_SIZE - 8, entry.slot);
    }

    character.inventory.forEach((item, i) => {
      const col = i % INV_COLS;
      const row = Math.floor(i / INV_COLS);
      const x = INV_GRID_X + col * INV_CELL + INV_CELL / 2 - 10;
      const y = INV_GRID_Y + row * INV_CELL + INV_CELL / 2 - 10;
      this.createItemIcon(item, x, y, INV_CELL - 16);
    });

    this.statsText.setText(this.summaryText());
  }

  private showTooltip(name: string, rarity: string, stats: Record<string, number | undefined>): void {
    const statLine = Object.entries(stats)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k} +${v}`)
      .join("  ");
    const sellValue = RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG].sellValue;
    this.statsText.setText(`${name} (${rarity})\n${statLine}   •   sells for ${sellValue}g   •   click for details`);
  }

  private summaryText(): string {
    const s = getEffectiveStats(playerCharacter);
    return [
      `Lv ${playerCharacter.level}`,
      `HP ${Math.ceil(s.hp)}/${Math.ceil(s.maxHp)}`,
      `ATK ${s.attackPower}`,
      `DEF ${s.defense}`,
      `SPD ${Math.round(s.moveSpeed)}`,
      `CRIT ${Math.round(s.critChance * 100)}%`,
      `Gold ${playerCharacter.gold}`,
    ].join("   ");
  }

  private floatingText(x: number, y: number, text: string, color: string): void {
    const t = this.add.text(x, y, text, { fontSize: "14px", color, fontStyle: "bold" }).setOrigin(0.5).setDepth(3000);
    this.tweens.add({ targets: t, y: y - 30, alpha: 0, duration: 800, onComplete: () => t.destroy() });
  }

  private handleDrop(icon: Phaser.GameObjects.Image, zone: Phaser.GameObjects.Zone): void {
    const character = playerCharacter;
    const instanceId = icon.getData("instanceId") as string;
    const sourceSlot = icon.getData("sourceSlot") as EquipSlot | undefined;
    const zoneKind = zone.getData("kind") as string;

    if (sourceSlot) unequipItem(character, sourceSlot);

    if (zoneKind === "slot") {
      const targetSlot = zone.getData("slot") as EquipSlot;
      equipItem(character, instanceId, targetSlot);
    } else if (zoneKind === "sell") {
      const gold = sellItem(character, instanceId);
      if (gold > 0) this.floatingText(SELL_ZONE.x, SELL_ZONE.y, `+${gold}g`, "#8fe0a0");
    } else if (zoneKind === "destroy") {
      destroyItem(character, instanceId);
    }
    // zoneKind === "inventory-area": unequip above already handled it, nothing more to do.

    persistCharacter();
  }

  private close(): void {
    this.scene.stop();
    this.scene.resume(this.returnSceneKey);
  }
}
