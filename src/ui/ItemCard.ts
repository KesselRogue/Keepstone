import Phaser from "phaser";
import type { ItemInstance } from "../types/Item";
import { RARITY_CONFIG } from "../data/rarity";
import { CATEGORY_ICON, CATEGORY_LABEL } from "./itemIcons";

export interface ItemCardAction {
  label: string;
  color: number;
  onClick: () => void;
}

function toHex(color: number): string {
  return `#${color.toString(16).padStart(6, "0")}`;
}

const PANEL_W = 300;
const PANEL_H = 260;
const DEPTH = 5000;

/** A click-to-open detail popup showing everything about an item: icon,
 * name, rarity, category, full stat list, and optional context actions
 * (Buy/Sell/etc). Reusable across CharacterScene and VendorScene. */
export class ItemCard {
  private scene: Phaser.Scene;
  private objects: Phaser.GameObjects.GameObject[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  get isOpen(): boolean {
    return this.objects.length > 0;
  }

  show(item: ItemInstance, actions: ItemCardAction[] = []): void {
    this.hide();
    const { width, height } = this.scene.scale;
    const cx = width / 2;
    const cy = height / 2;
    const rarity = RARITY_CONFIG[item.rarity];
    const left = cx - PANEL_W / 2;
    const top = cy - PANEL_H / 2;

    const backdrop = this.scene.add
      .rectangle(0, 0, width, height, 0x000000, 0.6)
      .setOrigin(0, 0)
      .setDepth(DEPTH)
      .setInteractive();
    backdrop.on("pointerdown", () => this.hide());

    const panel = this.scene.add
      .rectangle(cx, cy, PANEL_W, PANEL_H, 0x14141c, 0.97)
      .setStrokeStyle(3, rarity.color)
      .setDepth(DEPTH + 1)
      .setInteractive(); // swallow clicks so the backdrop doesn't close the card

    const iconX = left + 46;
    const iconY = top + 50;
    const iconBorder = this.scene.add
      .rectangle(iconX, iconY, 62, 62, 0x1a1a22, 1)
      .setStrokeStyle(3, rarity.color)
      .setDepth(DEPTH + 2);
    const icon = this.scene.add
      .image(iconX, iconY, CATEGORY_ICON[item.category])
      .setDisplaySize(46, 46)
      .setTint(item.color)
      .setDepth(DEPTH + 3);

    const nameText = this.scene.add
      .text(left + 86, top + 24, item.name, { fontSize: "16px", color: toHex(rarity.color), fontStyle: "bold" })
      .setDepth(DEPTH + 2);
    const metaText = this.scene.add
      .text(left + 86, top + 48, `${rarity.label} • ${CATEGORY_LABEL[item.category]}`, {
        fontSize: "12px",
        color: "#999999",
      })
      .setDepth(DEPTH + 2);

    const statLines = Object.entries(item.rolledStats)
      .filter(([, v]) => v)
      .map(([key, value]) => `${key}  +${value}`);
    const statsText = this.scene.add
      .text(left + 20, top + 96, statLines.length ? statLines.join("\n") : "No stat bonuses.", {
        fontSize: "13px",
        color: "#dddddd",
        lineSpacing: 8,
      })
      .setDepth(DEPTH + 2);

    const closeBtn = this.scene.add
      .text(left + PANEL_W - 12, top + 10, "✕", { fontSize: "16px", color: "#ffffff" })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(DEPTH + 2);
    closeBtn.on("pointerdown", () => this.hide());

    this.objects.push(backdrop, panel, iconBorder, icon, nameText, metaText, statsText, closeBtn);

    const btnW = (PANEL_W - 20 * (actions.length + 1)) / Math.max(actions.length, 1);
    actions.forEach((action, i) => {
      const bx = left + 20 + i * (btnW + 20) + btnW / 2;
      const by = top + PANEL_H - 26;
      const btn = this.scene.add
        .rectangle(bx, by, btnW, 34, action.color, 0.85)
        .setStrokeStyle(2, 0xffffff, 0.4)
        .setInteractive({ useHandCursor: true })
        .setDepth(DEPTH + 2);
      const label = this.scene.add
        .text(bx, by, action.label, { fontSize: "13px", color: "#ffffff", fontStyle: "bold" })
        .setOrigin(0.5)
        .setDepth(DEPTH + 3);
      btn.on("pointerdown", () => {
        action.onClick();
        this.hide();
      });
      this.objects.push(btn, label);
    });
  }

  hide(): void {
    for (const obj of this.objects) obj.destroy();
    this.objects = [];
  }
}
