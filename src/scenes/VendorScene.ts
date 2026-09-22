import Phaser from "phaser";
import { playerCharacter, persistCharacter } from "../systems/gameState";
import { sellItem, addItem } from "../systems/InventorySystem";
import { cloneItemInstance } from "../systems/LootSystem";
import { RARITY_CONFIG } from "../data/rarity";
import { VENDOR_DEFS, VENDOR_STOCK, type VendorId, type VendorListing } from "../data/vendor";
import type { ItemInstance } from "../types/Item";
import { CATEGORY_ICON } from "../ui/itemIcons";
import { ItemCard } from "../ui/ItemCard";

const STOCK_X = 70;
const STOCK_Y = 128;
const STOCK_COLS = 3;
const STOCK_CELL = 92;

const INV_X = 470;
const INV_Y = 128;
const INV_COLS = 3;
const INV_CELL = 92;

interface VendorEntryData {
  returnScene: string;
  vendorId: VendorId;
}

export class VendorScene extends Phaser.Scene {
  private returnSceneKey = "Town";
  private vendorId: VendorId = "weapons";
  private iconObjects: Phaser.GameObjects.GameObject[] = [];
  private goldText!: Phaser.GameObjects.Text;
  private itemCard!: ItemCard;

  constructor() {
    super("Vendor");
  }

  create(data: VendorEntryData): void {
    this.returnSceneKey = data?.returnScene ?? "Town";
    this.vendorId = data?.vendorId ?? "weapons";
    this.iconObjects = [];
    this.itemCard = new ItemCard(this);
    const def = VENDOR_DEFS[this.vendorId];

    this.add.rectangle(0, 0, 800, 600, 0x000000, 0.82).setOrigin(0, 0).setDepth(0);
    this.add
      .text(400, 24, def.name, { fontSize: "22px", color: "#ffffff", fontStyle: "bold" })
      .setOrigin(0.5)
      .setDepth(1);
    this.add
      .text(400, 48, `"${def.greeting}"`, {
        fontSize: "12px",
        fontStyle: "italic",
        color: "#aaaaaa",
        wordWrap: { width: 560 },
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(1);
    this.add
      .text(400, 82, "[ESC] to close   •   click an item for details", {
        fontSize: "11px",
        color: "#777777",
      })
      .setOrigin(0.5)
      .setDepth(1);
    this.goldText = this.add.text(400, 100, "", { fontSize: "14px", color: "#ffe66d" }).setOrigin(0.5).setDepth(1);

    this.add.text(STOCK_X, STOCK_Y - 24, "For Sale", { fontSize: "14px", color: "#cccccc" }).setDepth(1);
    this.add.text(INV_X, INV_Y - 24, "Your Items", { fontSize: "14px", color: "#cccccc" }).setDepth(1);

    this.input.keyboard?.on("keydown-ESC", () => this.close());

    this.render();
  }

  private render(): void {
    for (const obj of this.iconObjects) obj.destroy();
    this.iconObjects = [];

    this.goldText.setText(`Gold: ${playerCharacter.gold}g`);

    const stock = VENDOR_STOCK[this.vendorId];
    stock.forEach((listing, i) => {
      const col = i % STOCK_COLS;
      const row = Math.floor(i / STOCK_COLS);
      const x = STOCK_X + col * STOCK_CELL + 28;
      const y = STOCK_Y + row * STOCK_CELL + 28;
      const canAfford = playerCharacter.gold >= listing.price;

      const bg = this.add
        .rectangle(x, y, 50, 50, 0x1a1a22, canAfford ? 0.9 : 0.5)
        .setStrokeStyle(3, RARITY_CONFIG[listing.item.rarity].color)
        .setDepth(2);
      const icon = this.add
        .image(x, y, CATEGORY_ICON[listing.item.category])
        .setDisplaySize(36, 36)
        .setTint(listing.item.color)
        .setAlpha(canAfford ? 1 : 0.4)
        .setDepth(2)
        .setInteractive({ useHandCursor: true });
      const priceLabel = this.add
        .text(x, y + 34, `${listing.price}g`, { fontSize: "12px", color: canAfford ? "#ffe66d" : "#888888" })
        .setOrigin(0.5)
        .setDepth(2);

      icon.on("pointerdown", () => this.openStockCard(listing));
      this.iconObjects.push(bg, icon, priceLabel);
    });

    playerCharacter.inventory.forEach((item, i) => {
      const col = i % INV_COLS;
      const row = Math.floor(i / INV_COLS);
      const x = INV_X + col * INV_CELL + 26;
      const y = INV_Y + row * INV_CELL + 26;
      const value = RARITY_CONFIG[item.rarity].sellValue;

      const bg = this.add
        .rectangle(x, y, 50, 50, 0x1a1a22, 0.9)
        .setStrokeStyle(3, RARITY_CONFIG[item.rarity].color)
        .setDepth(2);
      const icon = this.add
        .image(x, y, CATEGORY_ICON[item.category])
        .setDisplaySize(36, 36)
        .setTint(item.color)
        .setDepth(2)
        .setInteractive({ useHandCursor: true });
      const valueLabel = this.add
        .text(x, y + 32, `${value}g`, { fontSize: "11px", color: "#8fe0a0" })
        .setOrigin(0.5)
        .setDepth(2);

      icon.on("pointerdown", () => this.openInventoryCard(item));
      this.iconObjects.push(bg, icon, valueLabel);
    });
  }

  private openStockCard(listing: VendorListing): void {
    const canAfford = playerCharacter.gold >= listing.price;
    this.itemCard.show(listing.item, [
      {
        label: canAfford ? `Buy ${listing.price}g` : `Need ${listing.price}g`,
        color: canAfford ? 0x2a6b3a : 0x444444,
        onClick: () => {
          if (!canAfford) return;
          this.buy(listing);
        },
      },
    ]);
  }

  private openInventoryCard(item: ItemInstance): void {
    const value = RARITY_CONFIG[item.rarity].sellValue;
    this.itemCard.show(item, [
      {
        label: `Sell ${value}g`,
        color: 0x2a6b3a,
        onClick: () => this.sell(item.instanceId),
      },
    ]);
  }

  private buy(listing: VendorListing): void {
    if (playerCharacter.gold < listing.price) return;
    playerCharacter.gold -= listing.price;
    addItem(playerCharacter, cloneItemInstance(listing.item));
    persistCharacter();
    this.render();
  }

  private sell(instanceId: string): void {
    const gold = sellItem(playerCharacter, instanceId);
    if (gold > 0) persistCharacter();
    this.render();
  }

  private close(): void {
    this.scene.stop();
    this.scene.resume(this.returnSceneKey);
  }
}
