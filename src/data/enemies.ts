import type { EnemyDefinition } from "../types/Enemy";

export const ENEMY_DEFS: Record<string, EnemyDefinition> = {
  skulker: {
    id: "skulker",
    name: "Skulker",
    color: 0xaa3333,
    size: 24,
    stats: {
      maxHp: 18,
      hp: 18,
      attackPower: 4,
      defense: 0,
      moveSpeed: 90,
      critChance: 0,
    },
    xpReward: 14,
    lootTable: [
      { itemDefId: "rusty_blade", weight: 30 },
      { itemDefId: "scrap_plate", weight: 30 },
      { itemDefId: "lucky_charm", weight: 15 },
      { itemDefId: "heavy_cleaver", weight: 10 },
      { itemDefId: "sentinel_mail", weight: 8 },
    ],
    aiProfile: {
      detectRadius: 180,
      attackRadius: 34,
      attackCooldownMs: 900,
    },
  },
  brute: {
    id: "brute",
    name: "Brute",
    color: 0x5a1a1a,
    size: 44,
    stats: {
      maxHp: 120,
      hp: 120,
      attackPower: 16,
      defense: 4,
      moveSpeed: 70,
      critChance: 0,
    },
    xpReward: 100,
    lootTable: [
      { itemDefId: "keeper_blade", weight: 40 },
      { itemDefId: "sentinel_mail", weight: 40 },
      { itemDefId: "lucky_charm", weight: 20 },
    ],
    aiProfile: {
      detectRadius: 240,
      attackRadius: 52,
      attackCooldownMs: 1600,
      windupMs: 500,
    },
  },
};
