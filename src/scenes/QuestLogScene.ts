import Phaser from "phaser";
import { playerCharacter } from "../systems/gameState";
import { QUEST_DEFS } from "../data/quests";
import type { QuestStatus } from "../types/Quest";

interface QuestLogEntryData {
  returnScene: string;
}

const STATUS_LABEL: Record<QuestStatus, string> = {
  active: "Active",
  readyToTurnIn: "Ready to turn in",
  completed: "Completed",
};

const STATUS_COLOR: Record<QuestStatus, string> = {
  active: "#cccccc",
  readyToTurnIn: "#ffe66d",
  completed: "#7fe08a",
};

export class QuestLogScene extends Phaser.Scene {
  private returnSceneKey = "Town";

  constructor() {
    super("QuestLog");
  }

  create(data: QuestLogEntryData): void {
    this.returnSceneKey = data?.returnScene ?? "Town";

    this.add.rectangle(0, 0, 800, 600, 0x000000, 0.82).setOrigin(0, 0).setDepth(0);
    this.add.text(400, 24, "Quest Journal", { fontSize: "22px", color: "#ffffff", fontStyle: "bold" }).setOrigin(0.5).setDepth(1);
    this.add
      .text(400, 50, "[ESC] to close", { fontSize: "12px", color: "#aaaaaa" })
      .setOrigin(0.5)
      .setDepth(1);

    this.input.keyboard?.on("keydown-ESC", () => this.close());
    this.input.keyboard?.on("keydown-J", () => this.close());

    const accepted = Object.values(QUEST_DEFS).filter((def) => playerCharacter.quests[def.id]);

    if (accepted.length === 0) {
      this.add
        .text(400, 200, "No quests yet — talk to someone in town.", { fontSize: "14px", color: "#999999" })
        .setOrigin(0.5)
        .setDepth(1);
      return;
    }

    accepted.forEach((def, i) => {
      const progress = playerCharacter.quests[def.id];
      const y = 100 + i * 90;

      this.add
        .rectangle(400, y + 32, 680, 76, 0x1a1a22, 0.9)
        .setStrokeStyle(2, 0x444444)
        .setDepth(1);
      this.add
        .text(80, y, def.name, { fontSize: "16px", color: "#fff0a0", fontStyle: "bold" })
        .setDepth(2);
      this.add
        .text(720, y, STATUS_LABEL[progress.status], { fontSize: "13px", color: STATUS_COLOR[progress.status] })
        .setOrigin(1, 0)
        .setDepth(2);

      const objectiveLabel = `${def.objective.enemyDefId} slain: ${progress.killCount}/${def.objective.count}`;
      this.add.text(80, y + 26, objectiveLabel, { fontSize: "13px", color: "#dddddd" }).setDepth(2);
      this.add
        .text(80, y + 48, `Reward: ${def.rewardXp} XP, ${def.rewardGold}g${def.rewardItemDefId ? ", a rare item" : ""}`, {
          fontSize: "12px",
          color: "#999999",
        })
        .setDepth(2);
    });
  }

  private close(): void {
    this.scene.stop();
    this.scene.resume(this.returnSceneKey);
  }
}
