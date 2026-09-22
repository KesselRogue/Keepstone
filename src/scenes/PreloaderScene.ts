import Phaser from "phaser";
import { VENDOR_DEFS } from "../data/vendor";

/**
 * World/character/icon art comes from Kenney's "Tiny Dungeon" pack (CC0,
 * kenney.nl/assets/tiny-dungeon), pre-cropped and resized in assets-src/ to
 * our target pixel dimensions. Anything that pack doesn't cover (loot
 * pickups, the jeweler's gem icon) still falls back to a Graphics shape.
 */
export class PreloaderScene extends Phaser.Scene {
  constructor() {
    super("Preloader");
  }

  preload(): void {
    this.load.image("tex-player", "assets/sprites/player.png");
    this.load.image("tex-skulker", "assets/sprites/skulker.png");
    this.load.image("tex-brute", "assets/sprites/brute.png");
    this.load.image("tex-wall", "assets/tiles/wall.png");
    this.load.image("tex-floor", "assets/tiles/floor.png");
    this.load.image("tex-floor-alt", "assets/tiles/floor-alt.png");
    this.load.image(VENDOR_DEFS.weapons.textureKey, "assets/sprites/icon-weapon.png");
    this.load.image(VENDOR_DEFS.armor.textureKey, "assets/sprites/icon-shield.png");
  }

  create(): void {
    const g = this.make.graphics({ x: 0, y: 0 });

    g.clear();
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 16, 16);
    g.generateTexture("tex-pickup", 16, 16);

    // Jeweler: no matching icon in the pack, keep the procedural gem.
    const gemPoints = [
      new Phaser.Math.Vector2(16, 2),
      new Phaser.Math.Vector2(28, 14),
      new Phaser.Math.Vector2(16, 30),
      new Phaser.Math.Vector2(4, 14),
    ];
    g.fillStyle(VENDOR_DEFS.jewelry.color, 1);
    g.fillPoints(gemPoints, true);
    g.generateTexture(VENDOR_DEFS.jewelry.textureKey, 32, 32);

    g.destroy();

    this.scene.start("Town");
    this.scene.launch("UI");
  }
}
