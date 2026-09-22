import Phaser from "phaser";

/** A labeled bar (health or XP) fixed to the camera. */
export class HealthBar {
  private fill: Phaser.GameObjects.Rectangle;
  private label: Phaser.GameObjects.Text;
  private width: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    fillColor: number,
    labelText: string,
  ) {
    this.width = width;
    scene.add
      .rectangle(x, y, width, height, 0x000000, 0.5)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(1000)
      .setStrokeStyle(1, 0xffffff, 0.6);
    this.fill = scene.add
      .rectangle(x + 2, y + 2, width - 4, height - 4, fillColor, 1)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(1001);
    this.label = scene.add
      .text(x + width / 2, y + height / 2, labelText, { fontSize: "12px", color: "#ffffff" })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1002);
  }

  setValue(current: number, max: number, labelOverride?: string): void {
    const ratio = max > 0 ? Phaser.Math.Clamp(current / max, 0, 1) : 0;
    this.fill.width = (this.width - 4) * ratio;
    this.label.setText(labelOverride ?? `${Math.ceil(current)} / ${Math.ceil(max)}`);
  }
}
