import Phaser from "phaser";
import type { Character, EquipSlot } from "../types/Character";
import { RARITY_CONFIG } from "../data/rarity";
import { equipItem } from "../systems/InventorySystem";

const SLOT_ORDER: EquipSlot[] = ["weapon", "armor", "trinket"];
const ROW_HEIGHT = 26;

/** Equipped-gear row (always visible) + a toggleable inventory list (tap/press I). */
export class InventoryPanel {
  private scene: Phaser.Scene;
  private getCharacter: () => Character;
  private slotIcons: Phaser.GameObjects.Rectangle[] = [];
  private panel: Phaser.GameObjects.Container;
  private panelOpen = false;

  constructor(scene: Phaser.Scene, getCharacter: () => Character) {
    this.scene = scene;
    this.getCharacter = getCharacter;
    const { width } = scene.scale;

    SLOT_ORDER.forEach((_slot, i) => {
      const icon = scene.add
        .rectangle(width - 40 - i * 44, 20, 32, 32, 0x222222, 0.8)
        .setScrollFactor(0)
        .setDepth(1000)
        .setStrokeStyle(2, 0x888888);
      this.slotIcons.push(icon);
    });

    scene.add
      .text(width - 40 - SLOT_ORDER.length * 44, 20, "BAG", {
        fontSize: "13px",
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: { x: 8, y: 6 },
      })
      .setOrigin(1, 0.5)
      .setScrollFactor(0)
      .setDepth(1000)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.toggle());

    this.panel = scene.add.container(width - 260, 60).setScrollFactor(0).setDepth(1500).setVisible(false);

    scene.input.keyboard?.on("keydown-I", () => this.toggle());
  }

  private toggle(): void {
    this.panelOpen = !this.panelOpen;
    this.panel.setVisible(this.panelOpen);
    if (this.panelOpen) this.rebuildPanel();
  }

  private rebuildPanel(): void {
    this.panel.removeAll(true);
    const character = this.getCharacter();
    const bg = this.scene.add.rectangle(0, 0, 240, 40 + character.inventory.length * ROW_HEIGHT, 0x111111, 0.85).setOrigin(0, 0);
    this.panel.add(bg);

    const title = this.scene.add.text(10, 8, "Inventory (tap to equip)", { fontSize: "12px", color: "#cccccc" });
    this.panel.add(title);

    character.inventory.forEach((item, i) => {
      const y = 34 + i * ROW_HEIGHT;
      const rarity = RARITY_CONFIG[item.rarity];
      const dot = this.scene.add.circle(16, y + 10, 5, rarity.color);
      const statEntries = Object.entries(item.rolledStats);
      const statText = statEntries.map(([k, v]) => `${k} +${v}`).join(" ");
      const label = this.scene.add
        .text(30, y, `${item.name} [${item.slot}] ${statText}`, { fontSize: "11px", color: "#ffffff" })
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => {
          equipItem(character, item.instanceId);
          this.rebuildPanel();
          this.refreshSlots();
        });
      this.panel.add([dot, label]);
    });
  }

  refreshSlots(): void {
    const character = this.getCharacter();
    SLOT_ORDER.forEach((slot, i) => {
      const item = character.equipped[slot];
      const icon = this.slotIcons[i];
      icon.setFillStyle(item ? RARITY_CONFIG[item.rarity].color : 0x222222, item ? 0.9 : 0.8);
    });
  }
}
