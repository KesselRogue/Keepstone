import type { ItemInstance, Rarity } from "../types/Item";
import { rollItemInstance } from "../systems/LootSystem";
import { RARITY_CONFIG } from "./rarity";
import { createRng } from "../utils/rng";

export const BUY_MARKUP = 4;

export type VendorId = "weapons" | "armor" | "jewelry";

export interface VendorListing {
  item: ItemInstance;
  price: number;
}

interface StockEntry {
  defId: string;
  rarity: Rarity;
}

interface VendorDef {
  id: VendorId;
  name: string;
  color: number;
  textureKey: string;
  greeting: string;
  stock: StockEntry[];
  seed: number;
}

export const VENDOR_DEFS: Record<VendorId, VendorDef> = {
  weapons: {
    id: "weapons",
    name: "Weaponsmith",
    color: 0xcc5544,
    textureKey: "tex-vendor-weapons",
    greeting: "Half of what's on this rack came up out of the keep with someone still holding it. I clean them up, no questions asked.",
    seed: 20260101,
    stock: [
      { defId: "rusty_blade", rarity: "common" },
      { defId: "heavy_cleaver", rarity: "uncommon" },
      { defId: "keeper_blade", rarity: "rare" },
      { defId: "scrap_buckler", rarity: "common" },
      { defId: "aegis_wall", rarity: "uncommon" },
    ],
  },
  armor: {
    id: "armor",
    name: "Armorer",
    color: 0x6ab0ff,
    textureKey: "tex-vendor-armor",
    greeting: "The old Order's plate turns up in the strangest condition. Some of it barely scratched, some of it barely holding together.",
    seed: 20260102,
    stock: [
      { defId: "leather_cap", rarity: "common" },
      { defId: "warden_helm", rarity: "uncommon" },
      { defId: "worn_pauldrons", rarity: "common" },
      { defId: "sentinel_spaulders", rarity: "uncommon" },
      { defId: "scrap_plate", rarity: "common" },
      { defId: "sentinel_mail", rarity: "rare" },
      { defId: "scrap_gloves", rarity: "common" },
      { defId: "iron_gauntlets", rarity: "uncommon" },
      { defId: "scrap_greaves", rarity: "common" },
      { defId: "reinforced_greaves", rarity: "uncommon" },
      { defId: "worn_boots", rarity: "common" },
      { defId: "swift_boots", rarity: "uncommon" },
      { defId: "leather_belt", rarity: "common" },
      { defId: "reinforced_belt", rarity: "uncommon" },
    ],
  },
  jewelry: {
    id: "jewelry",
    name: "Jeweler",
    color: 0xd06ad0,
    textureKey: "tex-vendor-jewelry",
    greeting: "Rings, charms, old Keeper amulets — trinkets like these outlast whoever wore them. I try not to think too hard about that.",
    seed: 20260103,
    stock: [
      { defId: "signet_ring", rarity: "common" },
      { defId: "bone_charm", rarity: "uncommon" },
      { defId: "lucky_ring", rarity: "uncommon" },
      { defId: "keeper_amulet", rarity: "rare" },
    ],
  },
};

/** Generated once per vendor with a fixed seed so stock and stat rolls stay
 * stable across a play session instead of re-rolling on every visit. */
function buildStock(def: VendorDef): VendorListing[] {
  const rng = createRng(def.seed);
  const listings: VendorListing[] = [];
  for (const entry of def.stock) {
    const item: ItemInstance | null = rollItemInstance(entry.defId, entry.rarity, rng);
    if (!item) continue;
    const price = Math.round(RARITY_CONFIG[item.rarity].sellValue * BUY_MARKUP);
    listings.push({ item, price });
  }
  return listings;
}

export const VENDOR_STOCK: Record<VendorId, VendorListing[]> = {
  weapons: buildStock(VENDOR_DEFS.weapons),
  armor: buildStock(VENDOR_DEFS.armor),
  jewelry: buildStock(VENDOR_DEFS.jewelry),
};
