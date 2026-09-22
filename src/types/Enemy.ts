import type { CharacterStats } from "./Character";

export interface LootTableEntry {
  itemDefId: string;
  weight: number;
}

export interface AiProfile {
  detectRadius: number;
  attackRadius: number;
  attackCooldownMs: number;
  windupMs?: number;
}

export interface EnemyDefinition {
  id: string;
  name: string;
  color: number;
  size: number;
  stats: CharacterStats;
  xpReward: number;
  lootTable: LootTableEntry[];
  aiProfile: AiProfile;
}
