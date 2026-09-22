import Phaser from "phaser";

export class LevelUpToast {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  show(level: number): void {
    const { width, height } = this.scene.scale;
    const text = this.scene.add
      .text(width / 2, height / 2 - 60, `LEVEL UP!\nLevel ${level}`, {
        fontSize: "28px",
        color: "#ffe66d",
        align: "center",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2000)
      .setAlpha(0);

    this.scene.tweens.add({
      targets: text,
      alpha: 1,
      y: height / 2 - 90,
      duration: 300,
      yoyo: true,
      hold: 900,
      onComplete: () => text.destroy(),
    });
  }
}
