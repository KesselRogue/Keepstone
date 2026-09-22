import type { ItemDefinition } from "../types/Item";

export const ITEM_DEFS: Record<string, ItemDefinition> = {
  rusty_blade: {
    id: "rusty_blade",
    name: "Rusty Blade",
    slot: "weapon",
    color: 0xb0b0c0,
    baseStatRanges: {
      attackPower: [2, 4],
    },
  },
  heavy_cleaver: {
    id: "heavy_cleaver",
    name: "Heavy Cleaver",
    slot: "weapon",
    color: 0xd0d0e0,
    baseStatRanges: {
      attackPower: [5, 8],
      moveSpeed: [-10, -4],
    },
  },
  keeper_blade: {
    id: "keeper_blade",
    name: "Keeper's Blade",
    slot: "weapon",
    color: 0xfff0a0,
    baseStatRanges: {
      attackPower: [8, 12],
      critChance: [0.02, 0.05],
    },
  },
  scrap_plate: {
    id: "scrap_plate",
    name: "Scrap Plate",
    slot: "armor",
    color: 0x8a8a70,
    baseStatRanges: {
      defense: [1, 3],
      maxHp: [3, 6],
    },
  },
  sentinel_mail: {
    id: "sentinel_mail",
    name: "Sentinel Mail",
    slot: "armor",
    color: 0x6ab0ff,
    baseStatRanges: {
      defense: [4, 7],
      maxHp: [8, 14],
    },
  },
  lucky_charm: {
    id: "lucky_charm",
    name: "Lucky Charm",
    slot: "trinket",
    color: 0xff9ad0,
    baseStatRanges: {
      critChance: [0.03, 0.06],
      moveSpeed: [4, 10],
    },
  },
};
