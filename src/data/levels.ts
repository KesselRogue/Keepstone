import type { LevelDefinition } from "../types/Level";
import { createGrid, fillRect, setCell, toRows } from "../utils/gridUtils";

const TOWN_COLS = 18;
const TOWN_ROWS = 12;

function buildTownGrid(): string[] {
  const grid = createGrid(TOWN_COLS, TOWN_ROWS);
  // gap in the bottom wall — the road down into the dungeon
  setCell(grid, 9, TOWN_ROWS - 1, ".");
  return toRows(grid);
}

export const TOWN_LEVEL: LevelDefinition = {
  id: "town",
  tileSize: 48,
  grid: buildTownGrid(),
  spawns: [],
  playerStart: { col: 9, row: 2 },
  exits: [{ col: 9, row: TOWN_ROWS - 1, toScene: "Dungeon", toSpawn: { col: 11, row: 1 } }],
};

const DUNGEON_COLS = 28;
const DUNGEON_ROWS = 30;

/**
 * Entrance -> a room that splits into a left and right wing (real
 * exploration choice, not just a longer corridor) -> both rejoin into a
 * large central hall -> a single guarded chokepoint -> the boss room.
 */
function buildDungeonGrid(): string[] {
  const grid = createGrid(DUNGEON_COLS, DUNGEON_ROWS);
  setCell(grid, 11, 0, "."); // entrance, lines up with the town's south gate

  // Wall dividing entrance room from the left/right wings, two gaps.
  fillRect(grid, 1, 7, DUNGEON_COLS - 2, 1, "#");
  setCell(grid, 7, 7, ".");
  setCell(grid, 19, 7, ".");

  // Divider between the left and right wings, so they read as separate rooms.
  fillRect(grid, 13, 8, 2, 6, "#");

  // Wall rejoining both wings into the central hall, same two gaps.
  fillRect(grid, 1, 14, DUNGEON_COLS - 2, 1, "#");
  setCell(grid, 7, 14, ".");
  setCell(grid, 19, 14, ".");

  // Single guarded chokepoint before the boss room.
  fillRect(grid, 1, 21, DUNGEON_COLS - 2, 1, "#");
  setCell(grid, 13, 21, ".");

  return toRows(grid);
}

export const DUNGEON_LEVEL: LevelDefinition = {
  id: "dungeon01",
  tileSize: 48,
  grid: buildDungeonGrid(),
  playerStart: { col: 11, row: 1 },
  spawns: [
    // Entrance room
    { enemyDefId: "skulker", col: 7, row: 3 },
    { enemyDefId: "skulker", col: 19, row: 3 },
    // Left wing
    { enemyDefId: "skulker", col: 4, row: 10 },
    { enemyDefId: "skulker", col: 9, row: 10 },
    { enemyDefId: "skulker", col: 6, row: 12 },
    // Right wing
    { enemyDefId: "skulker", col: 18, row: 10 },
    { enemyDefId: "skulker", col: 23, row: 10 },
    { enemyDefId: "skulker", col: 20, row: 12 },
    // Central hall
    { enemyDefId: "skulker", col: 5, row: 17 },
    { enemyDefId: "skulker", col: 13, row: 17 },
    { enemyDefId: "skulker", col: 21, row: 17 },
    { enemyDefId: "skulker", col: 13, row: 19 },
    // Boss room
    { enemyDefId: "skulker", col: 8, row: 25 },
    { enemyDefId: "skulker", col: 18, row: 25 },
    { enemyDefId: "brute", col: 13, row: 25 },
  ],
  exits: [{ col: 11, row: 0, toScene: "Town", toSpawn: { col: 9, row: 10 } }],
};
