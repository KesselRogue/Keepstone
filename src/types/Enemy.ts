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
  /** Which billboard art this tier reuses (see themes3D.BILLBOARD_BY_SPRITE_KIND). */
  spriteKind: "skulker" | "brute";
  /** Persistent billboard tint distinguishing reskinned tiers (e.g. Reaver
   * from Skulker) that share the same base art. Unset = no tint. */
  tint?: number;
}
