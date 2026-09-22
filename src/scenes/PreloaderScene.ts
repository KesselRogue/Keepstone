import Phaser from "phaser";
import { ENEMY_DEFS } from "../data/enemies";
import { TOWN_LEVEL } from "../data/levels";

/**
 * No art budget yet, so every texture is generated at runtime from
 * Phaser.Graphics instead of loading image files — this keeps development
 * unblocked by asset sourcing and is swapped for real sprites later.
 */
export class PreloaderScene extends Phaser.Scene {
  constructor() {
    super("Preloader");
  }

  create(): void {
    const tileSize = TOWN_LEVEL.tileSize;
    const g = this.make.graphics({ x: 0, y: 0 });

    g.clear();
    g.fillStyle(0x4a90ff, 1);
    g.fillCircle(14, 14, 14);
    g.generateTexture("tex-player", 28, 28);

    g.clear();
    g.fillStyle(ENEMY_DEFS.skulker.color, 1);
    g.fillRect(0, 0, ENEMY_DEFS.skulker.size, ENEMY_DEFS.skulker.size);
    g.generateTexture("tex-skulker", ENEMY_DEFS.skulker.size, ENEMY_DEFS.skulker.size);

    g.clear();
    g.fillStyle(ENEMY_DEFS.brute.color, 1);
    g.fillRect(0, 0, ENEMY_DEFS.brute.size, ENEMY_DEFS.brute.size);
    g.generateTexture("tex-brute", ENEMY_DEFS.brute.size, ENEMY_DEFS.brute.size);

    g.clear();
    g.fillStyle(0x4a4a58, 1);
    g.fillRect(0, 0, tileSize, tileSize);
    g.lineStyle(2, 0x33333f, 1);
    g.strokeRect(1, 1, tileSize - 2, tileSize - 2);
    g.generateTexture("tex-wall", tileSize, tileSize);

    g.clear();
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 16, 16);
    g.generateTexture("tex-pickup", 16, 16);

    g.destroy();

    this.scene.start("Town");
    this.scene.launch("UI");
  }
}
