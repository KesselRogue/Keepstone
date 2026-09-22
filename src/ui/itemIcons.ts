import type { ItemCategory } from "../types/Character";

/** Phaser texture key per equipment category, for rendering item icons in
 * the character sheet / vendor screens. mainHand/offHand reuse the sword
 * and shield textures already loaded for the vendor NPC markers; the rest
 * are generated procedurally in PreloaderScene (drawn in white so they can
 * be tinted per-item at render time, matching the tex-pickup pattern). */
export const CATEGORY_ICON: Record<ItemCategory, string> = {
  mainHand: "tex-vendor-weapons",
  offHand: "tex-vendor-armor",
  head: "tex-icon-head",
  shoulders: "tex-icon-shoulders",
  chest: "tex-icon-chest",
  gauntlets: "tex-icon-gauntlets",
  greaves: "tex-icon-greaves",
  boots: "tex-icon-boots",
  belt: "tex-icon-belt",
  necklace: "tex-icon-necklace",
  ring: "tex-icon-ring",
};

export const CATEGORY_LABEL: Record<ItemCategory, string> = {
  mainHand: "Main Hand",
  offHand: "Off Hand",
  head: "Head",
  shoulders: "Shoulders",
  chest: "Chest",
  gauntlets: "Gauntlets",
  greaves: "Greaves",
  boots: "Boots",
  belt: "Belt",
  necklace: "Necklace",
  ring: "Ring",
};
