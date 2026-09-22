import type { Rarity } from "./Item";

export interface QuestObjective {
  enemyDefId: string;
  count: number;
}

export interface QuestDialogue {
  offer: string[];
  inProgress: string[];
  readyToTurnIn: string[];
  turnedIn: string[];
}

export interface QuestDefinition {
  id: string;
  name: string;
  giverNpcId: string;
  objective: QuestObjective;
  rewardXp: number;
  rewardGold: number;
  rewardItemDefId?: string;
  rewardRarity?: Rarity;
  requiresQuestId?: string;
  dialogue: QuestDialogue;
}

export type QuestStatus = "active" | "readyToTurnIn" | "completed";

export interface QuestProgress {
  status: QuestStatus;
  killCount: number;
}
