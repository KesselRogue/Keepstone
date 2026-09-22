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

### Not used: Retro Fantasy Kit

The user initially asked for Kenney's "Retro Fantasy Kit," but it turned out
to be a 3D model pack (`.obj`/`.fbx`/`.glb`), not 2D sprites — incompatible
with this project's flat-sprite Phaser setup, and there's no 3D-to-2D
rendering tooling available to convert it. Tiny Town was used instead as a
same-style 2D substitute.
