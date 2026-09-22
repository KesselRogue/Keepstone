import type { Character } from "../types/Character";
import { STAT_GROWTH, xpForLevel } from "../data/xpTable";

export interface LevelUpResult {
  leveledUp: boolean;
  newLevel: number;
}

export function grantXp(character: Character, amount: number): LevelUpResult {
  character.xp += amount;
  let leveledUp = false;

  while (character.xp >= character.xpToNextLevel) {
    character.xp -= character.xpToNextLevel;
    character.level += 1;
    character.xpToNextLevel = xpForLevel(character.level);

    character.baseStats.maxHp += STAT_GROWTH.maxHp;
    character.baseStats.attackPower += STAT_GROWTH.attackPower;
    character.baseStats.defense += STAT_GROWTH.defense;
    character.baseStats.critChance += STAT_GROWTH.critChance;
    character.baseStats.hp = character.baseStats.maxHp;

    leveledUp = true;
  }

  return { leveledUp, newLevel: character.level };
}
