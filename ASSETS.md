# Third-party assets

## Tiny Dungeon (Kenney)

- Source: https://kenney.nl/assets/tiny-dungeon
- License: CC0 1.0 (public domain) — https://creativecommons.org/publicdomain/zero/1.0/
- Used for: `public/assets/sprites/player.png`, `skulker.png`, `brute.png`,
  `icon-weapon.png`, `icon-shield.png`, and `public/assets/tiles/wall.png`,
  `floor.png`, `floor-alt.png` — each cropped from the pack's tilemap and
  resized to this project's target pixel dimensions.

## Tiny Town (Kenney)

- Source: https://kenney.nl/assets/tiny-town
- License: CC0 1.0 (public domain) — https://creativecommons.org/publicdomain/zero/1.0/
- Used for the town hub's outdoor look: `public/assets/tiles/grass.png`,
  `grass-alt.png`, `tree-green.png`, `tree-gold.png` (floor + border), and
  `public/assets/sprites/bush.png`, `mushroom.png` (scattered decoration),
  `roof-gray.png`, `roof-red.png`, `door-tan-double.png`, `door-gray.png`,
  `window-tan.png` (simple roof+door "shop" facades behind each vendor NPC).

Not required by either license, but Kenney appreciates a credit: "Tiny
Dungeon" and "Tiny Town" assets by Kenney (kenney.nl).

The original downloaded packs and extraction scripts live in `assets-src/`
(gitignored except for the `.py` scripts) in case more of either pack's
130+ tiles are useful later. `make_contact_sheet.py <tilemap_packed.png>
<out.png>` builds an index-labeled contact sheet for picking new tiles.

## Retro Fantasy Kit (Kenney)

- Source: https://kenney.nl/assets/retro-fantasy-kit
- License: CC0 1.0 (public domain) — https://creativecommons.org/publicdomain/zero/1.0/
- This is a 3D model pack (`.glb`/`.obj`/`.fbx`), which is what the user
  originally asked to use for "the surroundings" — it didn't fit the
  project's original flat-sprite-only Phaser setup, which prompted the
  Phaser+Three.js hybrid rendering migration (see the plan file / git log)
  so real 3D models could actually be used.
- Used for the dungeon's walls and floor: `public/assets/models/
  dungeon-wall.glb` (from the pack's `wall-fortified.glb`) and
  `dungeon-floor.glb` (from `floor.glb`), loaded via Three's GLTFLoader.
  `public/assets/models/Textures/` holds the texture files those two
  models reference (copied from the pack's `Models/GLB format/Textures/`
  — GLB files can embed textures but these ship as external references).
- The town hub still uses the Tiny Town 2D theme (grass/trees) — this kit
  is stone-castle themed and fits the dungeon better; town's vendor
  facades/decorations from Tiny Town are a separate, not-yet-done pass
  (see the plan file).
- Not required by the license, but Kenney appreciates a credit: "Retro
  Fantasy Kit" assets by Kenney (kenney.nl).
