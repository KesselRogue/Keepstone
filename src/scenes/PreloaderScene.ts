import Phaser from "phaser";
import { VENDOR_DEFS } from "../data/vendor";
import { preloadModel } from "../three/AssetLoader";
import { DUNGEON_THEME_3D } from "../three/themes3D";

/**
 * World/character/icon art comes from Kenney's "Tiny Dungeon" and "Tiny
 * Town" packs (both CC0, kenney.nl), pre-cropped and resized in
 * assets-src/ to our target pixel dimensions. Anything neither pack
 * covers (loot pickups, the jeweler's gem icon) falls back to a Graphics
 * shape. Dungeon wall/floor 3D models are Kenney's Retro Fantasy Kit
 * (also CC0) — see ASSETS.md.
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

    this.load.image("tex-grass", "assets/tiles/grass.png");
    this.load.image("tex-grass-alt", "assets/tiles/grass-alt.png");
    this.load.image("tex-tree-green", "assets/tiles/tree-green.png");
    this.load.image("tex-tree-gold", "assets/tiles/tree-gold.png");
    this.load.image("tex-bush", "assets/sprites/bush.png");
    this.load.image("tex-mushroom", "assets/sprites/mushroom.png");
    this.load.image("tex-roof-gray", "assets/sprites/roof-gray.png");
    this.load.image("tex-roof-red", "assets/sprites/roof-red.png");
    this.load.image("tex-door-tan-double", "assets/sprites/door-tan-double.png");
    this.load.image("tex-door-gray", "assets/sprites/door-gray.png");
    this.load.image("tex-window-tan", "assets/sprites/window-tan.png");
  }

  async create(): Promise<void> {
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

    await Promise.all([
      preloadModel(DUNGEON_THEME_3D.wallModelUrl!),
      preloadModel(DUNGEON_THEME_3D.floorModelUrl!),
    ]);

    this.scene.start("Town");
    this.scene.launch("UI");
  }
}
