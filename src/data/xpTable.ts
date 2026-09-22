import type { CharacterStats } from "../types/Character";

export const STARTING_STATS: CharacterStats = {
  maxHp: 40,
  hp: 40,
  attackPower: 6,
  defense: 2,
  moveSpeed: 160,
  critChance: 0.05,
};

/** XP required to go from `level` to `level + 1`. */
export function xpForLevel(level: number): number {
  return Math.round(20 * Math.pow(level, 1.5));
}

/** Flat per-level stat growth applied on level-up. */
export const STAT_GROWTH: Omit<CharacterStats, "hp"> = {
  maxHp: 12,
  attackPower: 2,
  defense: 1,
  moveSpeed: 0,
  critChance: 0.01,
};
