import type { ItemInstance } from "./Item";

export interface CharacterStats {
  maxHp: number;
  hp: number;
  attackPower: number;
  defense: number;
  moveSpeed: number;
  critChance: number;
}

export type EquipSlot = "weapon" | "armor" | "trinket";

export interface Character {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  baseStats: CharacterStats;
  equipped: Partial<Record<EquipSlot, ItemInstance>>;
  inventory: ItemInstance[];
}
