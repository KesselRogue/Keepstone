import type { Character, CharacterStats } from "../types/Character";
import type { ItemInstance } from "../types/Item";

const STAT_KEYS: (keyof CharacterStats)[] = [
  "maxHp",
  "attackPower",
  "defense",
  "moveSpeed",
  "critChance",
];

/** Single source of truth for base stats + gear -> combat-ready stats. */
export function getEffectiveStats(character: Character): CharacterStats {
  const effective: CharacterStats = { ...character.baseStats };
  for (const item of Object.values(character.equipped)) {
    if (!item) continue;
    for (const key of STAT_KEYS) {
      const bonus = item.rolledStats[key];
      if (bonus) effective[key] += bonus;
    }
  }
  effective.hp = Math.min(character.baseStats.hp, effective.maxHp);
  return effective;
}

export function addItem(character: Character, item: ItemInstance): void {
  character.inventory.push(item);
}

/** Equips an item from the inventory, returning the previously equipped item (if any) to the inventory. */
export function equipItem(character: Character, instanceId: string): void {
  const idx = character.inventory.findIndex((i) => i.instanceId === instanceId);
  if (idx === -1) return;
  const [item] = character.inventory.splice(idx, 1);
  const previous = character.equipped[item.slot];
  character.equipped[item.slot] = item;
  if (previous) character.inventory.push(previous);
}
