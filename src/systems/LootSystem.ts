import type { EnemyDefinition } from "../types/Enemy";
import type { CharacterStats } from "../types/Character";
import type { ItemInstance } from "../types/Item";
import { ITEM_DEFS } from "../data/items";
import { RARITY_CONFIG, rollRarity } from "../data/rarity";
import { randRange } from "../utils/rng";

let nextInstanceId = 1;

export function rollDrop(enemyDef: EnemyDefinition, rng: () => number): ItemInstance | null {
  const table = enemyDef.lootTable;
  if (table.length === 0) return null;

  const totalWeight = table.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = rng() * totalWeight;
  let chosenDefId = table[0].itemDefId;
  for (const entry of table) {
    roll -= entry.weight;
    if (roll <= 0) {
      chosenDefId = entry.itemDefId;
      break;
    }
  }

  const def = ITEM_DEFS[chosenDefId];
  if (!def) return null;

  const rarity = rollRarity(rng);
  const multiplierRange = RARITY_CONFIG[rarity].statMultiplier;
  const multiplier = randRange(rng, multiplierRange[0], multiplierRange[1]);

  const rolledStats: Partial<Record<keyof CharacterStats, number>> = {};
  for (const [key, range] of Object.entries(def.baseStatRanges) as [
    keyof CharacterStats,
    [number, number],
  ][]) {
    const base = randRange(rng, range[0], range[1]);
    const scaled = base * multiplier;
    rolledStats[key] = key === "critChance" ? Math.round(scaled * 100) / 100 : Math.round(scaled);
  }

  return {
    instanceId: `item-${nextInstanceId++}`,
    defId: def.id,
    name: def.name,
    slot: def.slot,
    color: def.color,
    rarity,
    rolledStats,
  };
}
