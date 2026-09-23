import type { LevelDefinition, RoomSpawn } from "../types/Level";
import { createGrid, fillRect, setCell, toRows } from "../utils/gridUtils";
import { createRng } from "../utils/rng";

const TOWN_COLS = 34;
const TOWN_ROWS = 30;

// Town gates — one on each border, plus the keep's footprint at the center.
const NORTH_GATE = { col: 17, row: 0 };
const SOUTH_GATE = { col: 17, row: TOWN_ROWS - 1 };
const WEST_GATE = { col: 0, row: 15 };
const EAST_GATE = { col: TOWN_COLS - 1, row: 15 };
export const KEEP_FOOTPRINT = { col: 15, row: 13, width: 5, height: 5 };

// The tile just inside each gate — where a returning player lands, one step
// clear of the gate itself so they don't immediately re-trigger the exit.
const TOWN_ENTRY = {
  north: { col: NORTH_GATE.col, row: NORTH_GATE.row + 1 },
  south: { col: SOUTH_GATE.col, row: SOUTH_GATE.row - 1 },
  west: { col: WEST_GATE.col + 1, row: WEST_GATE.row },
  east: { col: EAST_GATE.col - 1, row: EAST_GATE.row },
};

function buildTownGrid(): string[] {
  const grid = createGrid(TOWN_COLS, TOWN_ROWS);
  setCell(grid, NORTH_GATE.col, NORTH_GATE.row, ".");
  setCell(grid, SOUTH_GATE.col, SOUTH_GATE.row, ".");
  setCell(grid, WEST_GATE.col, WEST_GATE.row, ".");
  setCell(grid, EAST_GATE.col, EAST_GATE.row, ".");
  fillRect(grid, KEEP_FOOTPRINT.col, KEEP_FOOTPRINT.row, KEEP_FOOTPRINT.width, KEEP_FOOTPRINT.height, "@");
  return toRows(grid);
}

export const TOWN_LEVEL: LevelDefinition = {
  id: "town",
  tileSize: 48,
  grid: buildTownGrid(),
  spawns: [],
  playerStart: { col: 17, row: 20 },
  exits: [
    { col: NORTH_GATE.col, row: NORTH_GATE.row, toScene: "NorthWilds", toSpawn: { col: 15, row: 28 } },
    { col: SOUTH_GATE.col, row: SOUTH_GATE.row, toScene: "Dungeon", toSpawn: { col: 11, row: 1 } },
    { col: WEST_GATE.col, row: WEST_GATE.row, toScene: "WestWilds", toSpawn: { col: 28, row: 15 } },
    { col: EAST_GATE.col, row: EAST_GATE.row, toScene: "EastWilds", toSpawn: { col: 1, row: 15 } },
  ],
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
  exits: [{ col: 11, row: 0, toScene: "Town", toSpawn: TOWN_ENTRY.south }],
};

const WILDS_COLS = 30;
const WILDS_ROWS = 30;
const WILDS_SPAWN_COUNT = 16;

interface WildsSpec {
  id: string;
  gateCol: number;
  gateRow: number;
  playerStart: { col: number; row: number };
  toTownSpawn: { col: number; row: number };
  seed: number;
  /** 0 at the entrance gate, 1 at the zone's farthest edge. */
  depthOf: (col: number, row: number) => number;
}

/**
 * Open "wilds" clearing outside Keepstone's walls. A single gate connects
 * back to town; enemy tier escalates with distance from that gate (skulker
 * near it, reaver in the middle third, warlord toward the far edge) so
 * difficulty visibly ramps up the farther out the player pushes.
 */
function buildWildsLevel(spec: WildsSpec): LevelDefinition {
  const grid = createGrid(WILDS_COLS, WILDS_ROWS);
  setCell(grid, spec.gateCol, spec.gateRow, ".");

  const rng = createRng(spec.seed);
  const spawns: RoomSpawn[] = [];
  let attempts = 0;
  while (spawns.length < WILDS_SPAWN_COUNT && attempts < WILDS_SPAWN_COUNT * 25) {
    attempts++;
    const col = 2 + Math.floor(rng() * (WILDS_COLS - 4));
    const row = 2 + Math.floor(rng() * (WILDS_ROWS - 4));

    // Keep the area right around the gate clear so arriving players get a
    // moment before anything's in range.
    if (Math.hypot(col - spec.gateCol, row - spec.gateRow) < 4) continue;

    const depth = Math.max(0, Math.min(1, spec.depthOf(col, row)));
    let enemyDefId: string;
    if (depth < 0.35) enemyDefId = "skulker";
    else if (depth < 0.7) enemyDefId = rng() < 0.6 ? "reaver" : "skulker";
    else enemyDefId = rng() < 0.55 ? "warlord" : "reaver";

    spawns.push({ enemyDefId, col, row });
  }

  return {
    id: spec.id,
    tileSize: 48,
    grid: toRows(grid),
    playerStart: spec.playerStart,
    spawns,
    exits: [{ col: spec.gateCol, row: spec.gateRow, toScene: "Town", toSpawn: spec.toTownSpawn }],
  };
}

// Player arrives from Town's north gate at the south edge of this zone —
// deeper (harder) wilderness lies further north, toward row 0.
export const NORTH_WILDS_LEVEL: LevelDefinition = buildWildsLevel({
  id: "north-wilds",
  gateCol: 15,
  gateRow: WILDS_ROWS - 1,
  playerStart: { col: 15, row: WILDS_ROWS - 2 },
  toTownSpawn: TOWN_ENTRY.north,
  seed: 20260201,
  depthOf: (_col, row) => 1 - row / (WILDS_ROWS - 1),
});

// Arrives from Town's east gate at the west edge — deeper wilderness lies
// further east, toward the far column.
export const EAST_WILDS_LEVEL: LevelDefinition = buildWildsLevel({
  id: "east-wilds",
  gateCol: 0,
  gateRow: 15,
  playerStart: { col: 1, row: 15 },
  toTownSpawn: TOWN_ENTRY.east,
  seed: 20260202,
  depthOf: (col) => col / (WILDS_COLS - 1),
});

// Arrives from Town's west gate at the east edge — deeper wilderness lies
// further west, toward column 0.
export const WEST_WILDS_LEVEL: LevelDefinition = buildWildsLevel({
  id: "west-wilds",
  gateCol: WILDS_COLS - 1,
  gateRow: 15,
  playerStart: { col: WILDS_COLS - 2, row: 15 },
  toTownSpawn: TOWN_ENTRY.west,
  seed: 20260203,
  depthOf: (col) => 1 - col / (WILDS_COLS - 1),
});
