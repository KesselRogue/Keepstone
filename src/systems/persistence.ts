import type { Character } from "../types/Character";
import type { ItemInstance } from "../types/Item";
import { ITEM_DEFS } from "../data/items";

const SAVE_KEY = "keepstone-save-v1";

/** Saves made before an item field existed (e.g. lore) won't have it in
 * localStorage — backfill from the current item definition rather than
 * showing a blank. */
function backfillItem(item: ItemInstance): ItemInstance {
  return item.lore ? item : { ...item, lore: ITEM_DEFS[item.defId]?.lore ?? "" };
}

/** Only progression persists — current HP is always restored to full so a
 * reload never strands the player at whatever HP they happened to close at. */
export function saveGame(character: Character): void {
  try {
    const { name, level, xp, xpToNextLevel, gold, baseStats, equipped, inventory, quests } = character;
    const payload = { name, level, xp, xpToNextLevel, gold, baseStats, equipped, inventory, quests };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage can throw (private browsing, quota) — saving is best-effort.
  }
}

/** Mutates `character` in place so existing references stay valid. Returns
 * whether a save was found and applied. */
export function loadInto(character: Character): boolean {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw) as Partial<Character>;

    if (typeof saved.name === "string") character.name = saved.name;
    if (typeof saved.level === "number") character.level = saved.level;
    if (typeof saved.xp === "number") character.xp = saved.xp;
    if (typeof saved.xpToNextLevel === "number") character.xpToNextLevel = saved.xpToNextLevel;
    if (typeof saved.gold === "number") character.gold = saved.gold;
    if (saved.baseStats) character.baseStats = { ...saved.baseStats, hp: saved.baseStats.maxHp };
    if (saved.equipped) {
      character.equipped = Object.fromEntries(
        Object.entries(saved.equipped).map(([slot, item]) => [slot, backfillItem(item as ItemInstance)]),
      );
    }
    if (saved.inventory) character.inventory = saved.inventory.map(backfillItem);
    if (saved.quests) character.quests = saved.quests;
    return true;
  } catch {
    return false;
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // ignore
  }
}
