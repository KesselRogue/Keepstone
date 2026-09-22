import type { CharacterStats, ItemCategory } from "./Character";

export type Rarity = "common" | "uncommon" | "rare" | "epic";

export interface ItemDefinition {
  id: string;
  name: string;
  category: ItemCategory;
  color: number;
  baseStatRanges: Partial<Record<keyof CharacterStats, [min: number, max: number]>>;
  lore: string;
}

export interface ItemInstance {
  instanceId: string;
  defId: string;
  name: string;
  category: ItemCategory;
  color: number;
  rarity: Rarity;
  rolledStats: Partial<Record<keyof CharacterStats, number>>;
  lore: string;
}
