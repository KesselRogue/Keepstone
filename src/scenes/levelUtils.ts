import Phaser from "phaser";
import * as THREE from "three";
import type { LevelDefinition, LevelExit } from "../types/Level";
import { threeLayer } from "../three/threeLayer";
import { isClickNearWorldPoint } from "../three/Nameplates";
import { toThreeX, toThreeZ, LOGICAL_WIDTH, LOGICAL_HEIGHT } from "../three/coords";
import { PLAYER_BILLBOARD } from "../three/themes3D";

export interface BuiltLevel {
  walls: Phaser.Physics.Arcade.StaticGroup;
  widthPx: number;
  heightPx: number;
}

export function tileToWorld(level: LevelDefinition, col: number, row: number): { x: number; y: number } {
  return {
    x: col * level.tileSize + level.tileSize / 2,
    y: row * level.tileSize + level.tileSize / 2,
  };
}

export interface LevelTheme {
  wall: string;
  wallAlt?: string;
  floor: string;
  floorAlt: string;
}

export const DUNGEON_THEME: LevelTheme = { wall: "tex-wall", floor: "tex-floor", floorAlt: "tex-floor-alt" };
export const TOWN_THEME: LevelTheme = {
  wall: "tex-tree-green",
  wallAlt: "tex-tree-gold",
  floor: "tex-grass",
  floorAlt: "tex-grass-alt",
};
// The wilds reuse Town's tree/grass art (same outdoor pack) — the danger
// gradient is conveyed through enemy tiering, not different tiles.
export const WILDS_THEME: LevelTheme = TOWN_THEME;

/**
 * Builds the Arcade Physics wall bodies for collision only — the real
 * visual is now the Three.js LevelBuilder-generated geometry, so the
 * Phaser wall sprites (still needed for their physics bodies) are hidden,
 * and floor tiles need no Phaser GameObject at all anymore (purely
 * visual, no physics role).
 */
export function buildLevelGeometry(
  scene: Phaser.Scene,
  level: LevelDefinition,
  theme: LevelTheme = DUNGEON_THEME,
): BuiltLevel {
  const { tileSize, grid } = level;
  const walls = scene.physics.add.staticGroup();

  for (let row = 0; row < grid.length; row++) {
    const line = grid[row];
    for (let col = 0; col < line.length; col++) {
      if (line[col] !== "#" && line[col] !== "@") continue;
      const worldX = col * tileSize + tileSize / 2;
      const worldY = row * tileSize + tileSize / 2;
      const wallTex = theme.wallAlt && (row + col) % 2 === 0 ? theme.wallAlt : theme.wall;
      const wall = walls.create(worldX, worldY, wallTex) as Phaser.Physics.Arcade.Sprite;
      wall.setVisible(false);
    }
  }

  return {
    walls,
    widthPx: (grid[0]?.length ?? 0) * tileSize,
    heightPx: grid.length * tileSize,
  };
}

export interface ExitZone {
  zone: Phaser.GameObjects.Zone;
  exit: LevelExit;
}

export function createExitZones(scene: Phaser.Scene, level: LevelDefinition): ExitZone[] {
  return level.exits.map((exit) => {
    const pos = tileToWorld(level, exit.col, exit.row);
    const zone = scene.add.zone(pos.x, pos.y, level.tileSize, level.tileSize);
    scene.physics.add.existing(zone, true);
    return { zone, exit };
  });
}

/** Wires the "C" key and a click on the player avatar to open the character sheet,
 * pausing this scene underneath it (shared by Town and Dungeon).
 *
 * The player's clickable area can't use Phaser's own setInteractive() hit
 * testing anymore — that's based on Phaser's own 2D camera, which no
 * longer matches where the player's billboard actually appears under the
 * 3D perspective camera. Instead this checks click proximity to the
 * billboard's projected screen position each time, same technique as the
 * enemy HP bar projection. */
export function wireCharacterSheetOpener(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite): void {
  const open = () => {
    scene.scene.pause();
    scene.scene.launch("Character", { returnScene: scene.scene.key });
  };
  scene.input.keyboard?.on("keydown-C", open);

  const worldPos = new THREE.Vector3();
  scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
    const camera = threeLayer.context?.camera;
    if (!camera) return;
    worldPos.set(toThreeX(player.x), PLAYER_BILLBOARD.size / 2, toThreeZ(player.y));
    if (isClickNearWorldPoint(pointer.x, pointer.y, worldPos, camera, LOGICAL_WIDTH, LOGICAL_HEIGHT)) open();
  });
}

/** Wires the "J" key to open the quest journal, pausing this scene underneath it. */
export function wireQuestLogOpener(scene: Phaser.Scene): void {
  scene.input.keyboard?.on("keydown-J", () => {
    scene.scene.pause();
    scene.scene.launch("QuestLog", { returnScene: scene.scene.key });
  });
}
