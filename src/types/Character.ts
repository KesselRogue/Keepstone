import type { ItemInstance } from "./Item";
import type { QuestProgress } from "./Quest";

export interface CharacterStats {
  maxHp: number;
  hp: number;
  attackPower: number;
  defense: number;
  moveSpeed: number;
  critChance: number;
}

export type EquipSlot =
  | "head"
  | "shoulders"
  | "chest"
  | "gauntlets"
  | "greaves"
  | "boots"
  | "belt"
  | "necklace"
  | "ring1"
  | "ring2"
  | "mainHand"
  | "offHand";

/** The category an item belongs to. Most map 1:1 to an EquipSlot, except
 * "ring" which can go in either ring slot — the UI picks which one. */
export type ItemCategory = Exclude<EquipSlot, "ring1" | "ring2"> | "ring";

export interface Character {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  gold: number;
  baseStats: CharacterStats;
  equipped: Partial<Record<EquipSlot, ItemInstance>>;
  inventory: ItemInstance[];
  quests: Record<string, QuestProgress>;
}
