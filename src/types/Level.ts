/**
 * Levels are authored as a simple text grid rather than Tiled JSON — far less
 * error-prone to hand-write and verify without a tilemap editor GUI.
 * Legend: '#' wall, '.' floor, '~' floor (alt tone, purely visual variety),
 * '@' impassable landmark — solid like a wall for collision, but the 3D
 * builder skips its default wall visual so a custom structure (e.g. the
 * town's keep) can occupy that footprint instead.
 */
export interface RoomSpawn {
  enemyDefId: string;
  col: number;
  row: number;
}

export interface LevelExit {
  col: number;
  row: number;
  toScene: string;
  toSpawn: { col: number; row: number };
}

export interface LevelDefinition {
  id: string;
  tileSize: number;
  grid: string[];
  spawns: RoomSpawn[];
  exits: LevelExit[];
  playerStart: { col: number; row: number };
}
