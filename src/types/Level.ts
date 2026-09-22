/**
 * Levels are authored as a simple text grid rather than Tiled JSON — far less
 * error-prone to hand-write and verify without a tilemap editor GUI.
 * Legend: '#' wall, '.' floor, '~' floor (alt tone, purely visual variety).
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
