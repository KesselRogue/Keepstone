import Phaser from "phaser";
import { TOWN_LEVEL } from "../data/levels";
import { Player } from "../entities/Player";
import { InputController } from "../systems/InputController";
import { playerCharacter } from "../systems/gameState";
import {
  buildLevelGeometry,
  createExitZones,
  tileToWorld,
  wireCharacterSheetOpener,
  type ExitZone,
} from "./levelUtils";

interface SceneEntryData {
  spawnCol?: number;
  spawnRow?: number;
}

export class TownScene extends Phaser.Scene {
  private player!: Player;
  private inputController!: InputController;
  private exitZones: ExitZone[] = [];
  private transitioning = false;

  constructor() {
    super("Town");
  }

  create(data: SceneEntryData): void {
    this.transitioning = false;
    const level = TOWN_LEVEL;
    const built = buildLevelGeometry(this, level);
    this.physics.world.setBounds(0, 0, built.widthPx, built.heightPx);
    this.cameras.main.setBounds(0, 0, built.widthPx, built.heightPx);

    const spawnCol = data?.spawnCol ?? level.playerStart.col;
    const spawnRow = data?.spawnRow ?? level.playerStart.row;
    const spawnPos = tileToWorld(level, spawnCol, spawnRow);

    this.player = new Player(this, spawnPos.x, spawnPos.y, playerCharacter);
    this.physics.add.collider(this.player, built.walls);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    this.inputController = new InputController(this);
    wireCharacterSheetOpener(this, this.player);

    this.exitZones = createExitZones(this, level);
    for (const { zone, exit } of this.exitZones) {
      this.physics.add.overlap(this.player, zone, () => this.handleExit(exit.toScene, exit.toSpawn));
    }

    this.add
      .text(built.widthPx / 2, spawnPos.y - 90, "Keepstone", { fontSize: "24px", color: "#e0e0e0" })
      .setOrigin(0.5, 0.5);
  }

  private handleExit(toScene: string, toSpawn: { col: number; row: number }): void {
    if (this.transitioning) return;
    this.transitioning = true;
    this.scene.start(toScene, { spawnCol: toSpawn.col, spawnRow: toSpawn.row });
  }

  update(_time: number, delta: number): void {
    this.player.update(delta, this.inputController);
  }
}
