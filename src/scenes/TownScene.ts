import Phaser from "phaser";
import { TOWN_LEVEL } from "../data/levels";
import type { LevelDefinition } from "../types/Level";
import { Player } from "../entities/Player";
import { InputController } from "../systems/InputController";
import { playerCharacter } from "../systems/gameState";
import {
  buildLevelGeometry,
  createExitZones,
  tileToWorld,
  wireCharacterSheetOpener,
  TOWN_THEME,
  type ExitZone,
} from "./levelUtils";
import { VENDOR_DEFS, type VendorId } from "../data/vendor";

interface SceneEntryData {
  spawnCol?: number;
  spawnRow?: number;
}

interface Facade {
  roof: string;
  door: string;
}

const FACADES: Record<VendorId, Facade> = {
  weapons: { roof: "tex-roof-red", door: "tex-door-tan-double" },
  armor: { roof: "tex-roof-gray", door: "tex-door-gray" },
  jewelry: { roof: "tex-roof-gray", door: "tex-window-tan" },
};

const DECORATIONS: { col: number; row: number; tex: string }[] = [
  { col: 3, row: 6, tex: "tex-bush" },
  { col: 15, row: 6, tex: "tex-bush" },
  { col: 6, row: 9, tex: "tex-mushroom" },
  { col: 12, row: 9, tex: "tex-mushroom" },
];

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
    const built = buildLevelGeometry(this, level, TOWN_THEME);
    this.physics.world.setBounds(0, 0, built.widthPx, built.heightPx);
    this.cameras.main.setBounds(0, 0, built.widthPx, built.heightPx);

    for (const deco of DECORATIONS) {
      const pos = tileToWorld(level, deco.col, deco.row);
      this.add.image(pos.x, pos.y, deco.tex).setDepth(-5);
    }

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
      .setOrigin(0.5, 0.5)
      .setDepth(1);

    this.spawnVendorNpc(level, "weapons", level.playerStart.col + 4, level.playerStart.row + 1);
    this.spawnVendorNpc(level, "armor", level.playerStart.col - 4, level.playerStart.row + 1);
    this.spawnVendorNpc(level, "jewelry", level.playerStart.col + 4, level.playerStart.row + 4);
  }

  private spawnVendorNpc(level: LevelDefinition, vendorId: VendorId, col: number, row: number): void {
    const def = VENDOR_DEFS[vendorId];
    const facade = FACADES[vendorId];
    const pos = tileToWorld(level, col, row);
    const doorY = pos.y - level.tileSize * 0.6;
    const roofY = doorY - level.tileSize;

    this.add.image(pos.x, roofY, facade.roof).setDepth(-8);
    this.add.image(pos.x, doorY, facade.door).setDepth(-7);
    this.add.text(pos.x, roofY - 28, def.name, { fontSize: "11px", color: "#dddddd" }).setOrigin(0.5).setDepth(1);

    const npc = this.add
      .sprite(pos.x, pos.y, def.textureKey)
      .setInteractive({ useHandCursor: true })
      .setDepth(1);

    npc.on("pointerdown", () => {
      this.scene.pause();
      this.scene.launch("Vendor", { returnScene: this.scene.key, vendorId });
    });
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
