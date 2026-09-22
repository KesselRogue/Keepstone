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
      { itemDefId: "rusty_blade", weight: 16 },
      { itemDefId: "heavy_cleaver", weight: 6 },
      { itemDefId: "scrap_buckler", weight: 10 },
      { itemDefId: "leather_cap", weight: 12 },
      { itemDefId: "worn_pauldrons", weight: 12 },
      { itemDefId: "scrap_plate", weight: 12 },
      { itemDefId: "scrap_gloves", weight: 12 },
      { itemDefId: "scrap_greaves", weight: 12 },
      { itemDefId: "worn_boots", weight: 12 },
      { itemDefId: "leather_belt", weight: 10 },
      { itemDefId: "bone_charm", weight: 6 },
      { itemDefId: "lucky_ring", weight: 6 },
      { itemDefId: "signet_ring", weight: 6 },
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
    // Boss kills force epic rarity (see handleVictory in DungeonScene) so every
    // entry here already reads as "special" regardless of which one is picked.
    lootTable: [
      { itemDefId: "keeper_blade", weight: 25 },
      { itemDefId: "aegis_wall", weight: 20 },
      { itemDefId: "sentinel_mail", weight: 20 },
      { itemDefId: "warden_helm", weight: 15 },
      { itemDefId: "reinforced_greaves", weight: 15 },
      { itemDefId: "keeper_amulet", weight: 15 },
    ],
    aiProfile: {
      detectRadius: 240,
      attackRadius: 52,
      attackCooldownMs: 1600,
      windupMs: 500,
    },
  },
};
