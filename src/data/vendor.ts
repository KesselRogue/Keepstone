import type { ItemInstance } from "../types/Item";
import { rollItemInstance } from "../systems/LootSystem";
import { RARITY_CONFIG } from "./rarity";
import { createRng } from "../utils/rng";

export const BUY_MARKUP = 4;

export interface VendorListing {
  item: ItemInstance;
  price: number;
}

const STOCK_DEF_IDS = [
  "heavy_cleaver",
  "aegis_wall",
  "warden_helm",
  "sentinel_spaulders",
  "sentinel_mail",
  "iron_gauntlets",
  "reinforced_greaves",
  "swift_boots",
  "reinforced_belt",
  "bone_charm",
  "lucky_ring",
];

/** Generated once with a fixed seed so the vendor's stock and stat rolls
 * stay stable across a play session instead of re-rolling on every visit. */
function buildStock(): VendorListing[] {
  const rng = createRng(20260101);
  const listings: VendorListing[] = [];
  for (const defId of STOCK_DEF_IDS) {
    const item = rollItemInstance(defId, "uncommon", rng);
    if (!item) continue;
    const price = Math.round(RARITY_CONFIG[item.rarity].sellValue * BUY_MARKUP);
    listings.push({ item, price });
  }
  return listings;
}

export const VENDOR_STOCK: VendorListing[] = buildStock();
