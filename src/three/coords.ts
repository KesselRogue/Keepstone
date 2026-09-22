/**
 * Coordinate convention for the whole Three.js layer: 1 Three.js world unit
 * = 1 game tile (tileSize is 48 game-pixels). This keeps the 3D scene
 * human-scale (camera distances, lighting, character sizes) instead of
 * working in hundreds of units, which is what you'd get mapping game pixels
 * 1:1. Game X maps to Three X; game Y (row/"depth" on screen) maps to Three
 * Z; Three Y is reserved for height/up, which the 2D game has no concept of.
 */
export const UNITS_PER_TILE = 48;

export function toThreeX(gameX: number): number {
  return gameX / UNITS_PER_TILE;
}

export function toThreeZ(gameY: number): number {
  return gameY / UNITS_PER_TILE;
}
