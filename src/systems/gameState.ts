import type { Character } from "../types/Character";
import { STARTING_STATS, xpForLevel } from "../data/xpTable";
import { loadInto, saveGame } from "./persistence";

/** Single persistent character shared across scene transitions (Town <-> Dungeon). */
export const playerCharacter: Character = {
  name: "Wanderer",
  level: 1,
  xp: 0,
  xpToNextLevel: xpForLevel(1),
  gold: 0,
  baseStats: { ...STARTING_STATS },
  equipped: {},
  inventory: [],
};

loadInto(playerCharacter);

export function persistCharacter(): void {
  saveGame(playerCharacter);
}
