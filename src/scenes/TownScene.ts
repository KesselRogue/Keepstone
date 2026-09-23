import Phaser from "phaser";
import * as THREE from "three";
import { TOWN_LEVEL, KEEP_FOOTPRINT } from "../data/levels";
import type { LevelDefinition } from "../types/Level";
import { Player } from "../entities/Player";
import { Villager } from "../entities/Villager";
import { InputController } from "../systems/InputController";
import { playerCharacter } from "../systems/gameState";
import {
  buildLevelGeometry,
  createExitZones,
  tileToWorld,
  wireCharacterSheetOpener,
  wireQuestLogOpener,
  TOWN_THEME,
  type ExitZone,
} from "./levelUtils";
import { ELDER_NPC_ID } from "../data/quests";
import type { VendorId } from "../data/vendor";
import { threeLayer } from "../three/threeLayer";
import { buildLevel3D } from "../three/LevelBuilder";
import { Billboard } from "../three/Billboard";
import { TOWN_THEME_3D } from "../three/themes3D";
import { isClickNearWorldPoint } from "../three/Nameplates";
import { toThreeX, toThreeZ, LOGICAL_WIDTH, LOGICAL_HEIGHT } from "../three/coords";
import { buildKeepStructure } from "../three/buildKeep";
import { buildShack } from "../three/buildShack";

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

// Fixed town layout, arranged around the keep at the grid's center (see
// KEEP_FOOTPRINT in data/levels.ts). Tile coordinates, not game pixels.
const VENDOR_SPOTS: { vendorId: VendorId; col: number; row: number }[] = [
  { vendorId: "weapons", col: 23, row: 15 },
  { vendorId: "armor", col: 11, row: 15 },
  { vendorId: "jewelry", col: 17, row: 22 },
];
const ELDER_SPOT = { col: 17, row: 10 };
const SHACK_SPOTS: { col: number; row: number }[] = [
  { col: 7, row: 7 },
  { col: 27, row: 7 },
  { col: 7, row: 23 },
  { col: 27, row: 23 },
  { col: 10, row: 26 },
  { col: 24, row: 26 },
];
const VILLAGER_HOMES: { col: number; row: number }[] = [
  { col: 10, row: 10 },
  { col: 24, row: 10 },
  { col: 10, row: 20 },
  { col: 24, row: 20 },
  { col: 14, row: 8 },
  { col: 20, row: 8 },
  { col: 14, row: 24 },
  { col: 20, row: 24 },
];

interface VendorNpc {
  vendorId: VendorId;
  worldPos: THREE.Vector3; // fixed — vendors never move
  billboard: Billboard | null;
}

interface TalkNpc {
  npcId: string;
  worldPos: THREE.Vector3;
  billboard: Billboard | null;
}

export class TownScene extends Phaser.Scene {
  private player!: Player;
  private inputController!: InputController;
  private exitZones: ExitZone[] = [];
  private transitioning = false;
  private vendorNpcs: VendorNpc[] = [];
  private talkNpcs: TalkNpc[] = [];
  private villagers: Villager[] = [];

  constructor() {
    super("Town");
  }

  create(data: SceneEntryData): void {
    this.transitioning = false;
    this.vendorNpcs = [];
    this.talkNpcs = [];
    this.villagers = [];
    const level = TOWN_LEVEL;
    const built = buildLevelGeometry(this, level, TOWN_THEME);
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
    wireQuestLogOpener(this);

    const levelGroup = buildLevel3D(level, TOWN_THEME_3D);
    this.addTownLandmarks(levelGroup, level);
    threeLayer.setLevelGroup(levelGroup);
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

    for (const spot of VENDOR_SPOTS) this.spawnVendorNpc(level, spot.vendorId, spot.col, spot.row);
    this.spawnTalkNpc(level, ELDER_NPC_ID, "assets/sprites/npc-elder.png", ELDER_SPOT.col, ELDER_SPOT.row);
    this.spawnVillagers(level);

    // Vendor/NPC clicks can't use Phaser's setInteractive() hit testing —
    // same reason as the player avatar click in wireCharacterSheetOpener
    // (see levelUtils.ts): it's based on Phaser's own 2D camera, which no
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
      for (const npc of this.talkNpcs) {
        if (isClickNearWorldPoint(pointer.x, pointer.y, npc.worldPos, camera, LOGICAL_WIDTH, LOGICAL_HEIGHT)) {
          this.scene.pause();
          this.scene.launch("Dialogue", { returnScene: this.scene.key, npcId: npc.npcId });
          return;
        }
      }
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      for (const npc of this.vendorNpcs) if (npc.billboard) threeLayer.context?.scene.remove(npc.billboard.sprite);
      for (const npc of this.talkNpcs) if (npc.billboard) threeLayer.context?.scene.remove(npc.billboard.sprite);
      for (const villager of this.villagers) villager.destroy();
      this.vendorNpcs = [];
      this.talkNpcs = [];
      this.villagers = [];
    });
  }

  /** Adds the keep and its surrounding shacks as children of the level's own
   * 3D group, so they get cleaned up automatically on scene swap along with
   * the rest of the level geometry (see threeLayer.setLevelGroup). */
  private addTownLandmarks(group: THREE.Group, level: LevelDefinition): void {
    const keepCenter = tileToWorld(
      level,
      KEEP_FOOTPRINT.col + (KEEP_FOOTPRINT.width - 1) / 2,
      KEEP_FOOTPRINT.row + (KEEP_FOOTPRINT.height - 1) / 2,
    );
    group.add(buildKeepStructure({ centerX: keepCenter.x, centerY: keepCenter.y, footprintTiles: KEEP_FOOTPRINT.width }));

    SHACK_SPOTS.forEach((spot, i) => {
      const pos = tileToWorld(level, spot.col, spot.row);
      for (const obj of buildShack(pos, i)) group.add(obj);
    });
  }

  private spawnVillagers(level: LevelDefinition): void {
    const textures = [
      "assets/sprites/villager-1.png",
      "assets/sprites/villager-2.png",
      "assets/sprites/villager-3.png",
      "assets/sprites/villager-elder.png",
    ];
    VILLAGER_HOMES.forEach((home, i) => {
      const pos = tileToWorld(level, home.col, home.row);
      this.villagers.push(new Villager(this, pos.x, pos.y, textures[i % textures.length]));
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

  private spawnTalkNpc(level: LevelDefinition, npcId: string, textureUrl: string, col: number, row: number): void {
    const pos = tileToWorld(level, col, row);
    const worldPos = new THREE.Vector3(toThreeX(pos.x), 0.45, toThreeZ(pos.y));

    let billboard: Billboard | null = null;
    if (threeLayer.context) {
      billboard = new Billboard(pos, textureUrl, 0.9, 0.9);
      billboard.update();
      threeLayer.context.scene.add(billboard.sprite);
    }

    this.talkNpcs.push({ npcId, worldPos, billboard });
  }

  private handleExit(toScene: string, toSpawn: { col: number; row: number }): void {
    if (this.transitioning) return;
    this.transitioning = true;
    this.scene.start(toScene, { spawnCol: toSpawn.col, spawnRow: toSpawn.row });
  }

  update(time: number, delta: number): void {
    this.player.update(delta, this.inputController);
    for (const villager of this.villagers) villager.update(delta, time);
    threeLayer.chaseCamera?.update(this.player.x, this.player.y);
    threeLayer.render();
  }
}
