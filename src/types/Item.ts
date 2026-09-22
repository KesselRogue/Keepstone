import type { CharacterStats, EquipSlot } from "./Character";

export type Rarity = "common" | "uncommon" | "rare" | "epic";

export interface ItemDefinition {
  id: string;
  name: string;
  slot: EquipSlot;
  color: number;
  baseStatRanges: Partial<Record<keyof CharacterStats, [min: number, max: number]>>;
}

export interface ItemInstance {
  instanceId: string;
  defId: string;
  name: string;
  slot: EquipSlot;
  color: number;
  rarity: Rarity;
  rolledStats: Partial<Record<keyof CharacterStats, number>>;
}
