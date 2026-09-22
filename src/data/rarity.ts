import type { Rarity } from "../types/Item";

export interface RarityConfig {
  tier: Rarity;
  label: string;
  color: number;
  statMultiplier: [min: number, max: number];
  dropWeight: number;
  sellValue: number;
}

export const RARITY_ORDER: Rarity[] = ["common", "uncommon", "rare", "epic"];

export const RARITY_CONFIG: Record<Rarity, RarityConfig> = {
  common: {
    tier: "common",
    label: "Common",
    color: 0x9d9d9d,
    statMultiplier: [0.9, 1.1],
    dropWeight: 60,
    sellValue: 5,
  },
  uncommon: {
    tier: "uncommon",
    label: "Uncommon",
    color: 0x3fd15e,
    statMultiplier: [1.15, 1.35],
    dropWeight: 28,
    sellValue: 15,
  },
  rare: {
    tier: "rare",
    label: "Rare",
    color: 0x4a90ff,
    statMultiplier: [1.45, 1.75],
    dropWeight: 10,
    sellValue: 40,
  },
  epic: {
    tier: "epic",
    label: "Epic",
    color: 0xb14aff,
    statMultiplier: [1.9, 2.3],
    dropWeight: 2,
    sellValue: 100,
  },
};

export function rollRarity(rng: () => number): Rarity {
  const totalWeight = RARITY_ORDER.reduce((sum, tier) => sum + RARITY_CONFIG[tier].dropWeight, 0);
  let roll = rng() * totalWeight;
  for (const tier of RARITY_ORDER) {
    roll -= RARITY_CONFIG[tier].dropWeight;
    if (roll <= 0) return tier;
  }
  return "common";
}
