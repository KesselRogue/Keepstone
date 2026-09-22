import type { ItemDefinition } from "../types/Item";

export const ITEM_DEFS: Record<string, ItemDefinition> = {
  // -- mainHand --
  rusty_blade: {
    id: "rusty_blade",
    name: "Rusty Blade",
    category: "mainHand",
    color: 0xb0b0c0,
    baseStatRanges: { attackPower: [2, 4] },
    lore: "Pulled from a skeleton just inside the keep's entrance. Whoever it was never made it further than the first room.",
  },
  heavy_cleaver: {
    id: "heavy_cleaver",
    name: "Heavy Cleaver",
    category: "mainHand",
    color: 0xd0d0e0,
    baseStatRanges: { attackPower: [5, 8], moveSpeed: [-10, -4] },
    lore: "Too heavy to swing twice in a hurry, but the skulkers don't usually need a second swing to notice.",
  },
  keeper_blade: {
    id: "keeper_blade",
    name: "Keeper's Blade",
    category: "mainHand",
    color: 0xfff0a0,
    baseStatRanges: { attackPower: [8, 12], critChance: [0.02, 0.05] },
    lore: "Forged for the Order that first sealed the Keepstone. The edge still hums faintly when the corruption is near.",
  },

  // -- offHand --
  scrap_buckler: {
    id: "scrap_buckler",
    name: "Scrap Buckler",
    category: "offHand",
    color: 0x8a8a70,
    baseStatRanges: { defense: [1, 3] },
    lore: "Hammered together from whatever plate could still hold an edge together. It'll stop a blade, once.",
  },
  aegis_wall: {
    id: "aegis_wall",
    name: "Aegis Wall",
    category: "offHand",
    color: 0x6ab0ff,
    baseStatRanges: { defense: [4, 6], maxHp: [4, 8] },
    lore: "Warded steel from the Order's old armory. The ward glyphs are worn smooth, but they still catch the light strangely.",
  },

  // -- head --
  leather_cap: {
    id: "leather_cap",
    name: "Leather Cap",
    category: "head",
    color: 0x8a6a4a,
    baseStatRanges: { defense: [1, 2] },
    lore: "A traveler's cap, stitched and re-stitched. Better than nothing, which is what most wanderers start with.",
  },
  warden_helm: {
    id: "warden_helm",
    name: "Warden Helm",
    category: "head",
    color: 0x9fb0c8,
    baseStatRanges: { defense: [3, 5], maxHp: [3, 6] },
    lore: "Issued to the wardens who once patrolled the Keepstone's outer halls, before the halls stopped needing patrols.",
  },

  // -- shoulders --
  worn_pauldrons: {
    id: "worn_pauldrons",
    name: "Worn Pauldrons",
    category: "shoulders",
    color: 0x8a8a70,
    baseStatRanges: { defense: [1, 3] },
    lore: "Dented in a dozen places. Someone got a lot of use out of these before they were left behind.",
  },
  sentinel_spaulders: {
    id: "sentinel_spaulders",
    name: "Sentinel Spaulders",
    category: "shoulders",
    color: 0x6ab0ff,
    baseStatRanges: { defense: [3, 5], maxHp: [3, 6] },
    lore: "Marked with the Order's sentinel crest — a closed eye over a locked door. Fitting, for what they were guarding.",
  },

  // -- chest --
  scrap_plate: {
    id: "scrap_plate",
    name: "Scrap Plate",
    category: "chest",
    color: 0x8a8a70,
    baseStatRanges: { defense: [1, 3], maxHp: [3, 6] },
    lore: "Salvaged plate, patched with whatever scrap fit the gap. It rattles, but it holds.",
  },
  sentinel_mail: {
    id: "sentinel_mail",
    name: "Sentinel Mail",
    category: "chest",
    color: 0x6ab0ff,
    baseStatRanges: { defense: [4, 7], maxHp: [8, 14] },
    lore: "Full warden's mail, remarkably intact. Whoever wore it last didn't fall to a blade.",
  },

  // -- gauntlets --
  scrap_gloves: {
    id: "scrap_gloves",
    name: "Scrap Gloves",
    category: "gauntlets",
    color: 0x8a8a70,
    baseStatRanges: { attackPower: [1, 2], defense: [1, 2] },
    lore: "Thick enough to keep your knuckles intact when a fist fight turns into something worse.",
  },
  iron_gauntlets: {
    id: "iron_gauntlets",
    name: "Iron Gauntlets",
    category: "gauntlets",
    color: 0x9fb0c8,
    baseStatRanges: { attackPower: [2, 4], defense: [2, 3] },
    lore: "Standard-issue for the Order's rank and file. Plain, sturdy, and built to outlast the men wearing them.",
  },

  // -- greaves --
  scrap_greaves: {
    id: "scrap_greaves",
    name: "Scrap Greaves",
    category: "greaves",
    color: 0x8a8a70,
    baseStatRanges: { defense: [1, 3], moveSpeed: [2, 5] },
    lore: "Mismatched shin guards, one slightly too big. You get used to the limp.",
  },
  reinforced_greaves: {
    id: "reinforced_greaves",
    name: "Reinforced Greaves",
    category: "greaves",
    color: 0x9fb0c8,
    baseStatRanges: { defense: [3, 5], maxHp: [4, 8] },
    lore: "Built for standing your ground in a corridor a skulker pack is trying to push through.",
  },

  // -- boots --
  worn_boots: {
    id: "worn_boots",
    name: "Worn Boots",
    category: "boots",
    color: 0x8a6a4a,
    baseStatRanges: { moveSpeed: [4, 8] },
    lore: "The soles are nearly gone, but they've clearly carried someone a very long way.",
  },
  swift_boots: {
    id: "swift_boots",
    name: "Swift Boots",
    category: "boots",
    color: 0x6affd0,
    baseStatRanges: { moveSpeed: [8, 14], critChance: [0.01, 0.03] },
    lore: "Light enough to run the old escape routes the wardens cut through the keep — assuming you can still find them.",
  },

  // -- belt --
  leather_belt: {
    id: "leather_belt",
    name: "Leather Belt",
    category: "belt",
    color: 0x8a6a4a,
    baseStatRanges: { maxHp: [3, 6] },
    lore: "Cracked with age but still holds. Cinch it tight before you go any deeper.",
  },
  reinforced_belt: {
    id: "reinforced_belt",
    name: "Reinforced Belt",
    category: "belt",
    color: 0x9fb0c8,
    baseStatRanges: { maxHp: [6, 10], defense: [1, 2] },
    lore: "Double-stitched over a steel core. Whoever made this expected the wearer to take a hit or two.",
  },

  // -- necklace --
  bone_charm: {
    id: "bone_charm",
    name: "Bone Charm",
    category: "necklace",
    color: 0xe0e0c0,
    baseStatRanges: { critChance: [0.02, 0.04] },
    lore: "Strung from something that used to have teeth. The old dungeon-runners swore it made their aim truer.",
  },
  keeper_amulet: {
    id: "keeper_amulet",
    name: "Keeper's Amulet",
    category: "necklace",
    color: 0xfff0a0,
    baseStatRanges: { critChance: [0.03, 0.06], attackPower: [2, 4] },
    lore: "Worn by the Order's line of Keepers, generation after generation, until the last of them didn't come back up.",
  },

  // -- ring (fits either ring slot) --
  lucky_ring: {
    id: "lucky_ring",
    name: "Lucky Ring",
    category: "ring",
    color: 0xff9ad0,
    baseStatRanges: { critChance: [0.02, 0.04], moveSpeed: [2, 5] },
    lore: "No two stories agree on who it belonged to, only that everyone who wore it walked out again.",
  },
  signet_ring: {
    id: "signet_ring",
    name: "Signet Ring",
    category: "ring",
    color: 0xffcf6a,
    baseStatRanges: { attackPower: [1, 3] },
    lore: "Stamped with a house crest nobody in town recognizes anymore. Old money, or an old grave.",
  },
};
