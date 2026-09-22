import Phaser from "phaser";
import * as THREE from "three";
import { TOWN_LEVEL } from "../data/levels";
import type { LevelDefinition } from "../types/Level";
import { Player } from "../entities/Player";
import { InputController } from "../systems/InputController";
import { playerCharacter } from "../systems/gameState";
import { buildLevelGeometry, createExitZones, tileToWorld, wireCharacterSheetOpener, TOWN_THEME, type ExitZone } from "./levelUtils";
import type { VendorId } from "../data/vendor";
import { threeLayer } from "../three/threeLayer";
import { buildLevel3D } from "../three/LevelBuilder";
import { Billboard } from "../three/Billboard";
import { TOWN_THEME_3D } from "../three/themes3D";
import { isClickNearWorldPoint } from "../three/Nameplates";
import { toThreeX, toThreeZ, LOGICAL_WIDTH, LOGICAL_HEIGHT } from "../three/coords";

interface SceneEntryData {
  spawnCol?: number;
  spawnRow?: number;
}

// Vendor NPC character portraits (Kenney Tiny Dungeon, CC0 — see ASSETS.md).
const VENDOR_BILLBOARD_TEXTURE: Record<VendorId, string> = {
  weapons: "assets/sprites/vendor-weaponsmith.png",
  armor: "assets/sprites/vendor-armorer.png",
  jewelry: "assets/sprites/vendor-jeweler.png",
};

interface VendorNpc {
  vendorId: VendorId;
  worldPos: THREE.Vector3; // fixed — vendors never move
  billboard: Billboard | null;
}

export class TownScene extends Phaser.Scene {
  private player!: Player;
  private inputController!: InputController;
  private exitZones: ExitZone[] = [];
  private transitioning = false;
  private vendorNpcs: VendorNpc[] = [];

  constructor() {
    super("Town");
  }

  create(data: SceneEntryData): void {
    this.transitioning = false;
    this.vendorNpcs = [];
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

    // Vendor clicks can't use Phaser's setInteractive() hit testing — same
    // reason as the player avatar click in wireCharacterSheetOpener (see
    // levelUtils.ts): it's based on Phaser's own 2D camera, which no
    // longer matches where the billboards actually appear on screen.
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const camera = threeLayer.context?.camera;
      if (!camera) return;
      for (const npc of this.vendorNpcs) {
        if (isClickNearWorldPoint(pointer.x, pointer.y, npc.worldPos, camera, LOGICAL_WIDTH, LOGICAL_HEIGHT)) {
          this.scene.pause();
          this.scene.launch("Vendor", { returnScene: this.scene.key, vendorId: npc.vendorId });
          return;
        }
      }
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      for (const npc of this.vendorNpcs) if (npc.billboard) threeLayer.context?.scene.remove(npc.billboard.sprite);
      this.vendorNpcs = [];
    });
  }

  private spawnVendorNpc(level: LevelDefinition, vendorId: VendorId, col: number, row: number): void {
    const pos = tileToWorld(level, col, row);
    const worldPos = new THREE.Vector3(toThreeX(pos.x), 0.45, toThreeZ(pos.y));

    let billboard: Billboard | null = null;
    if (threeLayer.context) {
      billboard = new Billboard(pos, VENDOR_BILLBOARD_TEXTURE[vendorId], 0.9, 0.9);
      billboard.update();
      threeLayer.context.scene.add(billboard.sprite);
    }

    this.vendorNpcs.push({ vendorId, worldPos, billboard });
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
