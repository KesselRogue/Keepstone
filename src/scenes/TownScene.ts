import Phaser from "phaser";
import { TOWN_LEVEL } from "../data/levels";
import type { LevelDefinition } from "../types/Level";
import { Player } from "../entities/Player";
import { InputController } from "../systems/InputController";
import { playerCharacter } from "../systems/gameState";
import { buildLevelGeometry, createExitZones, tileToWorld, wireCharacterSheetOpener, TOWN_THEME, type ExitZone } from "./levelUtils";
import { VENDOR_DEFS, type VendorId } from "../data/vendor";
import { threeLayer } from "../three/threeLayer";
import { buildLevel3D } from "../three/LevelBuilder";
import { Billboard } from "../three/Billboard";
import { TOWN_THEME_3D } from "../three/themes3D";

interface SceneEntryData {
  spawnCol?: number;
  spawnRow?: number;
}

// Vendor icon textures (weapons/armor are real PNGs; jewelry's gem is
// procedural in Phaser with no image file — falls back to a tinted plain
// billboard, same trick used for loot pickups).
const VENDOR_BILLBOARD_TEXTURE: Record<VendorId, string | null> = {
  weapons: "assets/sprites/icon-weapon.png",
  armor: "assets/sprites/icon-shield.png",
  jewelry: null,
};

export class TownScene extends Phaser.Scene {
  private player!: Player;
  private inputController!: InputController;
  private exitZones: ExitZone[] = [];
  private transitioning = false;
  private vendorBillboards: Billboard[] = [];

  constructor() {
    super("Town");
  }

  create(data: SceneEntryData): void {
    this.transitioning = false;
    this.vendorBillboards = [];
    const level = TOWN_LEVEL;
    const built = buildLevelGeometry(this, level, TOWN_THEME);
    this.physics.world.setBounds(0, 0, built.widthPx, built.heightPx);
    this.cameras.main.setBounds(0, 0, built.widthPx, built.heightPx);

    // Decorative bushes/mushrooms and vendor shop facades are deferred —
    // they were flat 2D-world sprites that won't align with the Three
    // perspective camera's projection (Phaser's own 2D camera follow
    // computes screen position differently). Proper 3D versions come with
    // the Retro Fantasy Kit integration pass.

    const spawnCol = data?.spawnCol ?? level.playerStart.col;
    const spawnRow = data?.spawnRow ?? level.playerStart.row;
    const spawnPos = tileToWorld(level, spawnCol, spawnRow);

    this.player = new Player(this, spawnPos.x, spawnPos.y, playerCharacter);
    this.physics.add.collider(this.player, built.walls);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    this.inputController = new InputController(this);
    wireCharacterSheetOpener(this, this.player);

    threeLayer.setLevelGroup(buildLevel3D(level, TOWN_THEME_3D));
    threeLayer.chaseCamera?.setBounds({
      minX: 1,
      maxX: level.grid[0].length - 2,
      minZ: 1,
      maxZ: level.grid.length - 2,
    });
    threeLayer.chaseCamera?.snapTo(spawnPos.x, spawnPos.y);

    this.exitZones = createExitZones(this, level);
    for (const { zone, exit } of this.exitZones) {
      this.physics.add.overlap(this.player, zone, () => this.handleExit(exit.toScene, exit.toSpawn));
    }

    this.spawnVendorNpc(level, "weapons", level.playerStart.col + 4, level.playerStart.row + 1);
    this.spawnVendorNpc(level, "armor", level.playerStart.col - 4, level.playerStart.row + 1);
    this.spawnVendorNpc(level, "jewelry", level.playerStart.col + 4, level.playerStart.row + 4);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      for (const billboard of this.vendorBillboards) threeLayer.context?.scene.remove(billboard.sprite);
      this.vendorBillboards = [];
    });
  }

  private spawnVendorNpc(level: LevelDefinition, vendorId: VendorId, col: number, row: number): void {
    const def = VENDOR_DEFS[vendorId];
    const pos = tileToWorld(level, col, row);

    const npc = this.add
      .sprite(pos.x, pos.y, def.textureKey)
      .setInteractive({ useHandCursor: true })
      .setVisible(false); // the real visual is the Three billboard below

    npc.on("pointerdown", () => {
      this.scene.pause();
      this.scene.launch("Vendor", { returnScene: this.scene.key, vendorId });
    });

    if (threeLayer.context) {
      const billboard = new Billboard({ x: pos.x, y: pos.y }, VENDOR_BILLBOARD_TEXTURE[vendorId], 0.8, 0.8);
      billboard.setTint(def.color);
      billboard.update();
      threeLayer.context.scene.add(billboard.sprite);
      this.vendorBillboards.push(billboard);
    }
  }

  private handleExit(toScene: string, toSpawn: { col: number; row: number }): void {
    if (this.transitioning) return;
    this.transitioning = true;
    this.scene.start(toScene, { spawnCol: toSpawn.col, spawnRow: toSpawn.row });
  }

  update(_time: number, delta: number): void {
    this.player.update(delta, this.inputController);
    threeLayer.chaseCamera?.update(this.player.x, this.player.y);
    threeLayer.render();
  }
}
