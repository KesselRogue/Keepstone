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
    this.load.image("tex-npc-elder", "assets/sprites/npc-elder.png");
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

    this.drawItemCategoryIcons(g);

    g.destroy();

    await Promise.all([
      preloadModel(DUNGEON_THEME_3D.wallModelUrl!),
      preloadModel(DUNGEON_THEME_3D.floorModelUrl!),
    ]);

    this.scene.start("Town");
    this.scene.launch("UI");
  }

  /**
   * Procedural per-category equipment icons (armor slots that Tiny Dungeon
   * doesn't cover). Drawn in plain white so they can be tinted with each
   * item's own color at render time, same trick as tex-pickup.
   */
  private drawItemCategoryIcons(g: Phaser.GameObjects.Graphics): void {
    const V2 = Phaser.Math.Vector2;
    const WHITE = 0xffffff;

    // Head: domed helmet with a visor slit.
    g.clear();
    g.fillStyle(WHITE, 1);
    g.fillCircle(16, 15, 10);
    g.fillRect(4, 15, 24, 6);
    g.fillStyle(0x000000, 0.45);
    g.fillRect(9, 15, 14, 3);
    g.generateTexture("tex-icon-head", 32, 32);

    // Shoulders: a pair of pauldrons.
    g.clear();
    g.fillStyle(WHITE, 1);
    g.fillCircle(10, 16, 8);
    g.fillCircle(22, 16, 8);
    g.fillRect(8, 16, 16, 8);
    g.generateTexture("tex-icon-shoulders", 32, 32);

    // Chest: a breastplate silhouette (wide at shoulders, narrower at waist).
    g.clear();
    g.fillStyle(WHITE, 1);
    g.fillPoints([new V2(8, 5), new V2(24, 5), new V2(22, 27), new V2(10, 27)], true);
    g.generateTexture("tex-icon-chest", 32, 32);

    // Gauntlets: a fist with a wrist cuff.
    g.clear();
    g.fillStyle(WHITE, 1);
    g.fillRoundedRect(9, 5, 14, 16, 4);
    g.fillRect(11, 19, 10, 7);
    g.generateTexture("tex-icon-gauntlets", 32, 32);

    // Greaves: a tapered shin guard.
    g.clear();
    g.fillStyle(WHITE, 1);
    g.fillPoints([new V2(11, 3), new V2(21, 3), new V2(23, 27), new V2(9, 27)], true);
    g.generateTexture("tex-icon-greaves", 32, 32);

    // Boots: a simple L-shaped boot.
    g.clear();
    g.fillStyle(WHITE, 1);
    g.fillPoints(
      [new V2(10, 4), new V2(20, 4), new V2(20, 19), new V2(27, 19), new V2(27, 27), new V2(10, 27)],
      true,
    );
    g.generateTexture("tex-icon-boots", 32, 32);

    // Belt: a strap with a buckle.
    g.clear();
    g.fillStyle(WHITE, 1);
    g.fillRect(3, 13, 26, 7);
    g.fillStyle(0x000000, 0.35);
    g.fillRect(13, 12, 6, 9);
    g.generateTexture("tex-icon-belt", 32, 32);

    // Necklace: a chain loop with a hanging pendant.
    g.clear();
    g.lineStyle(3, WHITE, 1);
    g.strokeCircle(16, 12, 8);
    g.fillStyle(WHITE, 1);
    g.fillPoints([new V2(16, 18), new V2(21, 24), new V2(16, 30), new V2(11, 24)], true);
    g.generateTexture("tex-icon-necklace", 32, 32);

    // Ring: a thick band with a small gem.
    g.clear();
    g.lineStyle(5, WHITE, 1);
    g.strokeCircle(16, 19, 8);
    g.fillStyle(WHITE, 1);
    g.fillCircle(16, 8, 4);
    g.generateTexture("tex-icon-ring", 32, 32);
  }
}
