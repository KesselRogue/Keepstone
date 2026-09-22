import Phaser from "phaser";
import type { LevelDefinition, LevelExit } from "../types/Level";
import type { ItemInstance } from "../types/Item";
import { RARITY_CONFIG } from "../data/rarity";

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

export function buildLevelGeometry(scene: Phaser.Scene, level: LevelDefinition): BuiltLevel {
  const { tileSize, grid } = level;
  const walls = scene.physics.add.staticGroup();

  for (let row = 0; row < grid.length; row++) {
    const line = grid[row];
    for (let col = 0; col < line.length; col++) {
      const worldX = col * tileSize + tileSize / 2;
      const worldY = row * tileSize + tileSize / 2;
      if (line[col] === "#") {
        walls.create(worldX, worldY, "tex-wall");
      } else {
        const tint = (row + col) % 2 === 0 ? 0x2a2a2a : 0x242424;
        scene.add.rectangle(worldX, worldY, tileSize, tileSize, tint).setDepth(-10);
      }
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
 * pausing this scene underneath it (shared by Town and Dungeon). */
export function wireCharacterSheetOpener(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite): void {
  const open = () => {
    scene.scene.pause();
    scene.scene.launch("Character", { returnScene: scene.scene.key });
  };
  scene.input.keyboard?.on("keydown-C", open);
  player.setInteractive({ useHandCursor: true });
  player.on("pointerdown", open);
}

export function spawnPickupSprite(
  scene: Phaser.Scene,
  x: number,
  y: number,
  item: ItemInstance,
): Phaser.Physics.Arcade.Sprite {
  const sprite = scene.physics.add.sprite(x, y, "tex-pickup");
  sprite.setTint(RARITY_CONFIG[item.rarity].color);
  sprite.setData("item", item);
  const body = sprite.body as Phaser.Physics.Arcade.Body;
  body.setAllowGravity(false);
  body.setCircle(20, -12, -12); // generous pickup radius — no need to walk pixel-perfect onto loot
  scene.tweens.add({
    targets: sprite,
    y: y - 6,
    duration: 550,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
  return sprite;
}
