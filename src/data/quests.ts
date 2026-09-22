import type { QuestDefinition } from "../types/Quest";

export const ELDER_NPC_ID = "elder_maren";

/**
 * A short two-quest main line tying the dungeon crawl to the Keepstone
 * story: the town's ward-relic is cracking, its old Keeper order is long
 * gone, and the Wanderer is asked to buy it time by clearing out what's
 * moved into the keep beneath it.
 */
export const QUEST_DEFS: Record<string, QuestDefinition> = {
  thin_the_ranks: {
    id: "thin_the_ranks",
    name: "Thin the Ranks",
    giverNpcId: ELDER_NPC_ID,
    objective: { enemyDefId: "skulker", count: 6 },
    rewardXp: 40,
    rewardGold: 30,
    dialogue: {
      offer: [
        "The Keepstone sits beneath this town, wanderer — it's the only thing that's kept whatever's down in the old keep from climbing back up.",
        "It's cracking. Slowly, but it's cracking. And the corridors below are thick with things that used to be its wardens.",
        "I can't ask you to mend it — that's beyond either of us. But you can thin what's gathering down there before it presses too hard against the seal.",
        "Six of the skulking things, at least. Will you go?",
      ],
      inProgress: ["Still counting bodies, are we? The keep won't clear itself. Go on."],
      readyToTurnIn: [
        "You've thinned them out well — I can feel the pressure on the seal easing already, if only a little.",
        "Here. It's not much, but it's honestly earned.",
      ],
      turnedIn: ["Rest if you need it. The keep isn't going anywhere — unfortunately."],
    },
  },
  heart_of_corruption: {
    id: "heart_of_corruption",
    name: "Heart of Corruption",
    giverNpcId: ELDER_NPC_ID,
    requiresQuestId: "thin_the_ranks",
    objective: { enemyDefId: "brute", count: 1 },
    rewardXp: 120,
    rewardGold: 80,
    rewardItemDefId: "keeper_blade",
    rewardRarity: "rare",
    dialogue: {
      offer: [
        "There's something else down there, wanderer. Something bigger than the skulking things, holding the deep chamber like it owns it.",
        "I think it's what's been feeding the crack in the Keepstone all along — a warden of the old Order, twisted past recognizing.",
        "Bring it down, and the seal gets the breathing room it needs. I won't pretend it's a small ask.",
      ],
      inProgress: ["It'll be past the guarded doorway, deep in the keep. Be careful — that thing hits like a collapsing wall."],
      readyToTurnIn: [
        "It's done. I felt the Keepstone settle the moment that thing fell — truly settle, for the first time in years.",
        "This was theirs — the Order that built the seal in the first place. It belongs to someone willing to carry it forward. That's you, now.",
      ],
      turnedIn: ["The Keepstone holds. For now, thanks to you, wanderer. Whatever else this town owes you, it owes you that."],
    },
  },
};

export const ELDER_DIALOGUE = {
  prologue: [
    "You're new to town. I'm Maren — I keep an eye on things here, for whatever that's worth these days.",
    "There's an old keep beneath us, and an older relic beneath that. Between you and me, I'd feel a lot better if someone looked in on both.",
  ],
  allComplete: [
    "The Keepstone holds steady, and the keep is quieter than it's been in my lifetime. You did that.",
    "Come by if you ever want to talk — the town doesn't get many visitors worth talking to.",
  ],
};
