import type { ItemDefinition } from "../types/Item";

export const ITEM_DEFS: Record<string, ItemDefinition> = {
  // -- mainHand --
  rusty_blade: {
    id: "rusty_blade",
    name: "Rusty Blade",
    category: "mainHand",
    color: 0xb0b0c0,
    baseStatRanges: { attackPower: [2, 4] },
  },
  heavy_cleaver: {
    id: "heavy_cleaver",
    name: "Heavy Cleaver",
    category: "mainHand",
    color: 0xd0d0e0,
    baseStatRanges: { attackPower: [5, 8], moveSpeed: [-10, -4] },
  },
  keeper_blade: {
    id: "keeper_blade",
    name: "Keeper's Blade",
    category: "mainHand",
    color: 0xfff0a0,
    baseStatRanges: { attackPower: [8, 12], critChance: [0.02, 0.05] },
  },

  // -- offHand --
  scrap_buckler: {
    id: "scrap_buckler",
    name: "Scrap Buckler",
    category: "offHand",
    color: 0x8a8a70,
    baseStatRanges: { defense: [1, 3] },
  },
  aegis_wall: {
    id: "aegis_wall",
    name: "Aegis Wall",
    category: "offHand",
    color: 0x6ab0ff,
    baseStatRanges: { defense: [4, 6], maxHp: [4, 8] },
  },

  // -- head --
  leather_cap: {
    id: "leather_cap",
    name: "Leather Cap",
    category: "head",
    color: 0x8a6a4a,
    baseStatRanges: { defense: [1, 2] },
  },
  warden_helm: {
    id: "warden_helm",
    name: "Warden Helm",
    category: "head",
    color: 0x9fb0c8,
    baseStatRanges: { defense: [3, 5], maxHp: [3, 6] },
  },

  // -- shoulders --
  worn_pauldrons: {
    id: "worn_pauldrons",
    name: "Worn Pauldrons",
    category: "shoulders",
    color: 0x8a8a70,
    baseStatRanges: { defense: [1, 3] },
  },
  sentinel_spaulders: {
    id: "sentinel_spaulders",
    name: "Sentinel Spaulders",
    category: "shoulders",
    color: 0x6ab0ff,
    baseStatRanges: { defense: [3, 5], maxHp: [3, 6] },
  },

  // -- chest --
  scrap_plate: {
    id: "scrap_plate",
    name: "Scrap Plate",
    category: "chest",
    color: 0x8a8a70,
    baseStatRanges: { defense: [1, 3], maxHp: [3, 6] },
  },
  sentinel_mail: {
    id: "sentinel_mail",
    name: "Sentinel Mail",
    category: "chest",
    color: 0x6ab0ff,
    baseStatRanges: { defense: [4, 7], maxHp: [8, 14] },
  },

  // -- gauntlets --
  scrap_gloves: {
    id: "scrap_gloves",
    name: "Scrap Gloves",
    category: "gauntlets",
    color: 0x8a8a70,
    baseStatRanges: { attackPower: [1, 2], defense: [1, 2] },
  },
  iron_gauntlets: {
    id: "iron_gauntlets",
    name: "Iron Gauntlets",
    category: "gauntlets",
    color: 0x9fb0c8,
    baseStatRanges: { attackPower: [2, 4], defense: [2, 3] },
  },

  // -- greaves --
  scrap_greaves: {
    id: "scrap_greaves",
    name: "Scrap Greaves",
    category: "greaves",
    color: 0x8a8a70,
    baseStatRanges: { defense: [1, 3], moveSpeed: [2, 5] },
  },
  reinforced_greaves: {
    id: "reinforced_greaves",
    name: "Reinforced Greaves",
    category: "greaves",
    color: 0x9fb0c8,
    baseStatRanges: { defense: [3, 5], maxHp: [4, 8] },
  },

  // -- boots --
  worn_boots: {
    id: "worn_boots",
    name: "Worn Boots",
    category: "boots",
    color: 0x8a6a4a,
    baseStatRanges: { moveSpeed: [4, 8] },
  },
  swift_boots: {
    id: "swift_boots",
    name: "Swift Boots",
    category: "boots",
    color: 0x6affd0,
    baseStatRanges: { moveSpeed: [8, 14], critChance: [0.01, 0.03] },
  },

  // -- belt --
  leather_belt: {
    id: "leather_belt",
    name: "Leather Belt",
    category: "belt",
    color: 0x8a6a4a,
    baseStatRanges: { maxHp: [3, 6] },
  },
  reinforced_belt: {
    id: "reinforced_belt",
    name: "Reinforced Belt",
    category: "belt",
    color: 0x9fb0c8,
    baseStatRanges: { maxHp: [6, 10], defense: [1, 2] },
  },

  // -- necklace --
  bone_charm: {
    id: "bone_charm",
    name: "Bone Charm",
    category: "necklace",
    color: 0xe0e0c0,
    baseStatRanges: { critChance: [0.02, 0.04] },
  },
  keeper_amulet: {
    id: "keeper_amulet",
    name: "Keeper's Amulet",
    category: "necklace",
    color: 0xfff0a0,
    baseStatRanges: { critChance: [0.03, 0.06], attackPower: [2, 4] },
  },

  // -- ring (fits either ring slot) --
  lucky_ring: {
    id: "lucky_ring",
    name: "Lucky Ring",
    category: "ring",
    color: 0xff9ad0,
    baseStatRanges: { critChance: [0.02, 0.04], moveSpeed: [2, 5] },
  },
  signet_ring: {
    id: "signet_ring",
    name: "Signet Ring",
    category: "ring",
    color: 0xffcf6a,
    baseStatRanges: { attackPower: [1, 3] },
  },
};
