import Phaser from "phaser";
import { playerCharacter, persistCharacter } from "../systems/gameState";
import { sellItem, addItem } from "../systems/InventorySystem";
import { cloneItemInstance } from "../systems/LootSystem";
import { RARITY_CONFIG } from "../data/rarity";
import { VENDOR_STOCK, type VendorListing } from "../data/vendor";
import type { CharacterStats } from "../types/Character";

const STOCK_X = 70;
const STOCK_Y = 120;
const STOCK_COLS = 3;
const STOCK_CELL = 100;

const INV_X = 470;
const INV_Y = 120;
const INV_COLS = 4;
const INV_CELL = 90;

export class VendorScene extends Phaser.Scene {
  private returnSceneKey = "Town";
  private iconObjects: Phaser.GameObjects.GameObject[] = [];
  private goldText!: Phaser.GameObjects.Text;
  private infoText!: Phaser.GameObjects.Text;

  constructor() {
    super("Vendor");
  }

  create(data: { returnScene: string }): void {
    this.returnSceneKey = data?.returnScene ?? "Town";
    this.iconObjects = [];

    this.add.rectangle(0, 0, 800, 600, 0x000000, 0.82).setOrigin(0, 0).setDepth(0);
    this.add
      .text(400, 24, "Vendor", { fontSize: "22px", color: "#ffffff", fontStyle: "bold" })
      .setOrigin(0.5)
      .setDepth(1);
    this.add
      .text(400, 50, "[V] or [ESC] to close   •   click an item to buy or sell", {
        fontSize: "12px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5)
      .setDepth(1);
    this.goldText = this.add.text(400, 74, "", { fontSize: "14px", color: "#ffe66d" }).setOrigin(0.5).setDepth(1);

    this.add.text(STOCK_X, STOCK_Y - 24, "For Sale", { fontSize: "14px", color: "#cccccc" }).setDepth(1);
    this.add
      .text(INV_X, INV_Y - 24, "Your Items", { fontSize: "14px", color: "#cccccc" })
      .setDepth(1);

    this.infoText = this.add.text(60, 555, "", { fontSize: "12px", color: "#dddddd" }).setDepth(1);

    this.input.keyboard?.on("keydown-V", () => this.close());
    this.input.keyboard?.on("keydown-ESC", () => this.close());

    this.render();
  }

  private render(): void {
    for (const obj of this.iconObjects) obj.destroy();
    this.iconObjects = [];

    this.goldText.setText(`Gold: ${playerCharacter.gold}g`);

    VENDOR_STOCK.forEach((listing, i) => {
      const col = i % STOCK_COLS;
      const row = Math.floor(i / STOCK_COLS);
      const x = STOCK_X + col * STOCK_CELL + 28;
      const y = STOCK_Y + row * STOCK_CELL + 28;
      const canAfford = playerCharacter.gold >= listing.price;

      const icon = this.add
        .rectangle(x, y, 50, 50, listing.item.color, canAfford ? 1 : 0.35)
        .setStrokeStyle(3, RARITY_CONFIG[listing.item.rarity].color)
        .setDepth(2)
        .setInteractive({ useHandCursor: true });
      const priceLabel = this.add
        .text(x, y + 34, `${listing.price}g`, { fontSize: "12px", color: canAfford ? "#ffe66d" : "#888888" })
        .setOrigin(0.5)
        .setDepth(2);

      icon.on("pointerover", () =>
        this.showInfo(listing.item.name, listing.item.rarity, listing.item.rolledStats, `Price: ${listing.price}g`),
      );
      icon.on("pointerout", () => this.infoText.setText(""));
      icon.on("pointerdown", () => this.buy(listing));
      this.iconObjects.push(icon, priceLabel);
    });

    playerCharacter.inventory.forEach((item, i) => {
      const col = i % INV_COLS;
      const row = Math.floor(i / INV_COLS);
      const x = INV_X + col * INV_CELL + 26;
      const y = INV_Y + row * INV_CELL + 26;
      const value = RARITY_CONFIG[item.rarity].sellValue;

      const icon = this.add
        .rectangle(x, y, 46, 46, item.color)
        .setStrokeStyle(3, RARITY_CONFIG[item.rarity].color)
        .setDepth(2)
        .setInteractive({ useHandCursor: true });
      const valueLabel = this.add
        .text(x, y + 30, `${value}g`, { fontSize: "11px", color: "#8fe0a0" })
        .setOrigin(0.5)
        .setDepth(2);

      icon.on("pointerover", () => this.showInfo(item.name, item.rarity, item.rolledStats, `Sells for: ${value}g`));
      icon.on("pointerout", () => this.infoText.setText(""));
      icon.on("pointerdown", () => this.sell(item.instanceId));
      this.iconObjects.push(icon, valueLabel);
    });
  }

  private showInfo(
    name: string,
    rarity: string,
    stats: Partial<Record<keyof CharacterStats, number>>,
    extra: string,
  ): void {
    const statLine = Object.entries(stats)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k} +${v}`)
      .join("  ");
    this.infoText.setText(`${name} (${rarity})   ${statLine}   •   ${extra}`);
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
