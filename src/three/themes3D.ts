import type { LevelTheme3D } from "./LevelBuilder";

export const TOWN_THEME_3D: LevelTheme3D = {
  wallColor: 0x2f6b3a,
  floorColor: 0x3a5a3a,
  floorColorAlt: 0x355536,
};

export const DUNGEON_THEME_3D: LevelTheme3D = {
  wallColor: 0x4a4a58,
  floorColor: 0x6b3a35,
  floorColorAlt: 0x5f322c,
  // Kenney's Retro Fantasy Kit (CC0) — see ASSETS.md.
  wallModelUrl: "assets/models/dungeon-wall.glb",
  floorModelUrl: "assets/models/dungeon-floor.glb",
};

export interface BillboardSpec {
  textureUrl: string | null;
  size: number; // billboard is square: width == height, in Three units
}

export const PLAYER_BILLBOARD: BillboardSpec = { textureUrl: "assets/sprites/player.png", size: 1.0 };
export const SKULKER_BILLBOARD: BillboardSpec = { textureUrl: "assets/sprites/skulker.png", size: 0.7 };
export const BRUTE_BILLBOARD: BillboardSpec = { textureUrl: "assets/sprites/brute.png", size: 1.3 };
// tex-pickup is a plain procedurally-generated white square (see
// PreloaderScene) — no image file to load, just a tintable flat sprite.
export const PICKUP_BILLBOARD: BillboardSpec = { textureUrl: null, size: 0.45 };
