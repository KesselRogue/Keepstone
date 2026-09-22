import type { Character } from "../types/Character";
import type { QuestDefinition } from "../types/Quest";
import { QUEST_DEFS } from "../data/quests";
import { addItem } from "./InventorySystem";
import { rollItemInstance } from "./LootSystem";
import { grantXp } from "./LevelingSystem";
import { defaultRng } from "../utils/rng";

/** The next not-yet-accepted quest this NPC can offer, or null if none is
 * available yet (prerequisite unmet, or everything from them is done). */
export function getOfferableQuest(character: Character, npcId: string): QuestDefinition | null {
  for (const def of Object.values(QUEST_DEFS)) {
    if (def.giverNpcId !== npcId) continue;
    if (character.quests[def.id]) continue;
    if (def.requiresQuestId && character.quests[def.requiresQuestId]?.status !== "completed") continue;
    return def;
  }
  return null;
}

/** Every quest from this NPC the player has already accepted (active, ready
 * to turn in, or completed) — for picking which dialogue branch to show. */
export function getAcceptedQuestsFor(character: Character, npcId: string): QuestDefinition[] {
  return Object.values(QUEST_DEFS).filter((def) => def.giverNpcId === npcId && character.quests[def.id]);
}

export function acceptQuest(character: Character, questId: string): void {
  if (character.quests[questId]) return;
  character.quests[questId] = { status: "active", killCount: 0 };
}

/** Called on every enemy death — advances any active quest whose objective
 * matches, flipping it to "ready to turn in" once the count is met. */
export function recordKill(character: Character, enemyDefId: string): void {
  for (const def of Object.values(QUEST_DEFS)) {
    const progress = character.quests[def.id];
    if (!progress || progress.status !== "active") continue;
    if (def.objective.enemyDefId !== enemyDefId) continue;

    progress.killCount = Math.min(progress.killCount + 1, def.objective.count);
    if (progress.killCount >= def.objective.count) progress.status = "readyToTurnIn";
  }
}

/** Returns the new level if the reward XP triggered a level-up, else null. */
export function turnInQuest(character: Character, questId: string): number | null {
  const def = QUEST_DEFS[questId];
  const progress = character.quests[questId];
  if (!def || !progress || progress.status !== "readyToTurnIn") return null;

  progress.status = "completed";
  const result = grantXp(character, def.rewardXp);
  character.gold += def.rewardGold;
  if (def.rewardItemDefId) {
    const item = rollItemInstance(def.rewardItemDefId, def.rewardRarity ?? "common", defaultRng);
    if (item) addItem(character, item);
  }
  return result.leveledUp ? result.newLevel : null;
}
