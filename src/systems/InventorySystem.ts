import type { Character, CharacterStats, EquipSlot, ItemCategory } from "../types/Character";
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

/** Which equip slot(s) a given item category may be placed in. */
export function validSlotsForCategory(category: ItemCategory): EquipSlot[] {
  if (category === "ring") return ["ring1", "ring2"];
  return [category];
}

/** Default target slot for a quick "tap to equip" action (first valid slot). */
export function defaultSlotForCategory(category: ItemCategory): EquipSlot {
  return validSlotsForCategory(category)[0];
}

/** Equips an item from the inventory into a specific slot, returning any
 * previously equipped item there to the inventory. */
export function equipItem(character: Character, instanceId: string, targetSlot: EquipSlot): boolean {
  const idx = character.inventory.findIndex((i) => i.instanceId === instanceId);
  if (idx === -1) return false;
  const item = character.inventory[idx];
  if (!validSlotsForCategory(item.category).includes(targetSlot)) return false;

  character.inventory.splice(idx, 1);
  const previous = character.equipped[targetSlot];
  character.equipped[targetSlot] = item;
  if (previous) character.inventory.push(previous);
  return true;
}

/** Moves an equipped item back into the inventory. */
export function unequipItem(character: Character, slot: EquipSlot): void {
  const item = character.equipped[slot];
  if (!item) return;
  delete character.equipped[slot];
  character.inventory.push(item);
}
