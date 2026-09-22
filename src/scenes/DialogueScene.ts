import Phaser from "phaser";
import { playerCharacter, persistCharacter } from "../systems/gameState";
import { ELDER_DIALOGUE, ELDER_NPC_ID } from "../data/quests";
import { acceptQuest, getAcceptedQuestsFor, getOfferableQuest, turnInQuest } from "../systems/QuestSystem";

interface DialogueEntryData {
  returnScene: string;
  npcId: string;
}

interface DialogueChoice {
  label: string;
  onClick: () => void;
}

type DialogueMode = "offer" | "turnIn" | "idle";

interface DialogueState {
  lines: string[];
  mode: DialogueMode;
  questId?: string;
}

// Only Elder Maren has real dialogue right now — this map exists so adding
// a second talkable NPC later is a one-line addition, not a new scene.
const NPC_NAMES: Record<string, string> = { [ELDER_NPC_ID]: "Elder Maren" };
const NPC_PORTRAITS: Record<string, string> = { [ELDER_NPC_ID]: "tex-npc-elder" };

const BOX_X = 60;
const BOX_Y = 380;
const BOX_W = 680;
const BOX_H = 180;

export class DialogueScene extends Phaser.Scene {
  private returnSceneKey = "Town";
  private npcId = ELDER_NPC_ID;
  private lines: string[] = [];
  private pageIndex = 0;
  private mode: DialogueMode = "idle";
  private questId?: string;
  private bodyText!: Phaser.GameObjects.Text;
  private continueHint!: Phaser.GameObjects.Text;
  private advanceZone!: Phaser.GameObjects.Zone;
  private choiceObjects: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super("Dialogue");
  }

  create(data: DialogueEntryData): void {
    this.returnSceneKey = data?.returnScene ?? "Town";
    this.npcId = data?.npcId ?? ELDER_NPC_ID;

    this.add.rectangle(0, 0, 800, 600, 0x000000, 0.25).setOrigin(0, 0).setDepth(0);

    this.add
      .rectangle(BOX_X + BOX_W / 2, BOX_Y + BOX_H / 2, BOX_W, BOX_H, 0x14141c, 0.96)
      .setStrokeStyle(3, 0xfff0a0)
      .setDepth(1);

    const portraitKey = NPC_PORTRAITS[this.npcId];
    this.add
      .rectangle(BOX_X + 66, BOX_Y + 66, 88, 88, 0x1a1a22, 1)
      .setStrokeStyle(3, 0xfff0a0)
      .setDepth(2);
    if (portraitKey) {
      this.add.image(BOX_X + 66, BOX_Y + 66, portraitKey).setDisplaySize(64, 64).setDepth(3);
    }

    this.add
      .text(BOX_X + 128, BOX_Y + 18, NPC_NAMES[this.npcId] ?? "???", {
        fontSize: "16px",
        color: "#fff0a0",
        fontStyle: "bold",
      })
      .setDepth(2);

    this.bodyText = this.add
      .text(BOX_X + 128, BOX_Y + 46, "", {
        fontSize: "14px",
        color: "#eeeeee",
        wordWrap: { width: BOX_W - 150 },
        lineSpacing: 6,
      })
      .setDepth(2);

    this.continueHint = this.add
      .text(BOX_X + BOX_W - 16, BOX_Y + BOX_H - 14, "click / space to continue ▼", {
        fontSize: "11px",
        color: "#999999",
      })
      .setOrigin(1, 1)
      .setDepth(2);

    // Only covers the text area (not the button row) so it never overlaps
    // the choice buttons shown on the last page — no click ever needs to
    // resolve "was this an advance or a choice?" ambiguity.
    this.advanceZone = this.add
      .zone(BOX_X, BOX_Y, BOX_W, BOX_H - 50)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(2);
    this.advanceZone.on("pointerdown", () => this.advance());

    this.input.keyboard?.on("keydown-SPACE", () => this.advance());
    this.input.keyboard?.on("keydown-ENTER", () => this.advance());
    this.input.keyboard?.on("keydown-ESC", () => this.close());

    this.beginState(this.buildDialogueState());
  }

  private buildDialogueState(): DialogueState {
    const accepted = getAcceptedQuestsFor(playerCharacter, this.npcId);

    const ready = accepted.find((def) => playerCharacter.quests[def.id]?.status === "readyToTurnIn");
    if (ready) return { lines: ready.dialogue.readyToTurnIn, mode: "turnIn", questId: ready.id };

    const offerable = getOfferableQuest(playerCharacter, this.npcId);
    if (offerable) {
      const intro = accepted.length === 0 ? ELDER_DIALOGUE.prologue : [];
      return { lines: [...intro, ...offerable.dialogue.offer], mode: "offer", questId: offerable.id };
    }

    const active = accepted.find((def) => playerCharacter.quests[def.id]?.status === "active");
    if (active) {
      const progress = playerCharacter.quests[active.id];
      const line = `${active.dialogue.inProgress[0]} (${progress.killCount}/${active.objective.count})`;
      return { lines: [line], mode: "idle" };
    }

    if (accepted.length > 0) return { lines: ELDER_DIALOGUE.allComplete, mode: "idle" };
    return { lines: ELDER_DIALOGUE.prologue, mode: "idle" };
  }

  private beginState(state: DialogueState): void {
    this.lines = state.lines;
    this.mode = state.mode;
    this.questId = state.questId;
    this.pageIndex = 0;
    this.renderPage();
  }

  private renderPage(): void {
    this.bodyText.setText(this.lines[this.pageIndex] ?? "");
    const isLastPage = this.pageIndex >= this.lines.length - 1;
    this.continueHint.setVisible(!isLastPage);
    this.advanceZone.input!.enabled = !isLastPage;
    this.clearChoices();
    if (isLastPage) this.showChoices(this.choicesForMode());
  }

  private advance(): void {
    if (this.pageIndex < this.lines.length - 1) {
      this.pageIndex += 1;
      this.renderPage();
    }
  }

  private choicesForMode(): DialogueChoice[] {
    if (this.mode === "turnIn" && this.questId) {
      return [
        {
          label: "Turn In",
          onClick: () => {
            const questDef = this.questId;
            if (!questDef) return;
            const newLevel = turnInQuest(playerCharacter, questDef);
            persistCharacter();
            if (newLevel !== null) this.game.events.emit("level-up", newLevel);
            this.beginState(this.buildDialogueState());
          },
        },
      ];
    }
    if (this.mode === "offer" && this.questId) {
      const questDef = this.questId;
      return [
        {
          label: "Accept",
          onClick: () => {
            acceptQuest(playerCharacter, questDef);
            persistCharacter();
            this.beginState(this.buildDialogueState());
          },
        },
        { label: "Maybe later", onClick: () => this.close() },
      ];
    }
    return [{ label: "Farewell", onClick: () => this.close() }];
  }

  private clearChoices(): void {
    for (const obj of this.choiceObjects) obj.destroy();
    this.choiceObjects = [];
  }

  private showChoices(choices: DialogueChoice[]): void {
    const btnW = (BOX_W - 150 - 12 * (choices.length - 1)) / choices.length;
    choices.forEach((choice, i) => {
      const bx = BOX_X + 128 + i * (btnW + 12) + btnW / 2;
      const by = BOX_Y + BOX_H - 40;
      const btn = this.add
        .rectangle(bx, by, btnW, 30, 0x2a2a3a, 0.9)
        .setStrokeStyle(2, 0xfff0a0, 0.6)
        .setInteractive({ useHandCursor: true })
        .setDepth(3);
      const label = this.add
        .text(bx, by, choice.label, { fontSize: "13px", color: "#ffffff", fontStyle: "bold" })
        .setOrigin(0.5)
        .setDepth(4);
      btn.on("pointerdown", () => choice.onClick());
      this.choiceObjects.push(btn, label);
    });
  }

  private close(): void {
    this.scene.stop();
    this.scene.resume(this.returnSceneKey);
  }
}
