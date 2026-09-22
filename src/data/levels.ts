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

const DUNGEON_COLS = 22;
const DUNGEON_ROWS = 18;

function buildDungeonGrid(): string[] {
  const grid = createGrid(DUNGEON_COLS, DUNGEON_ROWS);
  setCell(grid, 11, 0, "."); // entrance, lines up with the town's south gate

  // divide the space into three connected rooms: entrance -> mid room -> boss room
  fillRect(grid, 1, 8, DUNGEON_COLS - 2, 1, "#");
  setCell(grid, 7, 8, ".");
  setCell(grid, 15, 8, ".");

  fillRect(grid, 1, 12, DUNGEON_COLS - 2, 1, "#");
  setCell(grid, 11, 12, "."); // single guarded chokepoint before the boss room

  return toRows(grid);
}

export const DUNGEON_LEVEL: LevelDefinition = {
  id: "dungeon01",
  tileSize: 48,
  grid: buildDungeonGrid(),
  playerStart: { col: 11, row: 1 },
  spawns: [
    { enemyDefId: "skulker", col: 7, row: 4 },
    { enemyDefId: "skulker", col: 15, row: 4 },
    { enemyDefId: "skulker", col: 5, row: 10 },
    { enemyDefId: "skulker", col: 9, row: 10 },
    { enemyDefId: "skulker", col: 13, row: 10 },
    { enemyDefId: "skulker", col: 17, row: 10 },
    { enemyDefId: "brute", col: 11, row: 14 },
  ],
  exits: [{ col: 11, row: 0, toScene: "Town", toSpawn: { col: 9, row: 10 } }],
};
