import type { CharacterStats } from "../types/Character";

export interface AttackResult {
  damage: number;
  isCrit: boolean;
}

/** Shared damage formula for both player and enemy attacks. */
export function resolveAttack(
  attacker: CharacterStats,
  defender: CharacterStats,
  rng: () => number,
): AttackResult {
  const isCrit = rng() < attacker.critChance;
  const rawDamage = attacker.attackPower - defender.defense * 0.5;
  const mitigated = Math.max(1, Math.round(rawDamage));
  const damage = isCrit ? Math.round(mitigated * 1.5) : mitigated;
  return { damage, isCrit };
}
