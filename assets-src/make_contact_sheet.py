"""Builds an upscaled, index-labeled contact sheet from a Kenney packed
tilemap, so individual tile indices can be identified visually before
extracting them with extract_sprites.py / extract_town_sprites.py.

Usage: python make_contact_sheet.py <path-to-tilemap_packed.png> <out.png>
Defaults to the Tiny Dungeon sheet if no args are given.
"""

import sys
from PIL import Image, ImageDraw

SRC = sys.argv[1] if len(sys.argv) > 1 else "tiny-dungeon/Tilemap/tilemap_packed.png"
OUT = sys.argv[2] if len(sys.argv) > 2 else "contact_sheet.png"
COLS, ROWS, TILE = 12, 11, 16
SCALE = 5
PAD = 20  # space for row/col labels

img = Image.open(SRC).convert("RGBA")
assert img.size == (COLS * TILE, ROWS * TILE), img.size

out_w = PAD + COLS * TILE * SCALE
out_h = PAD + ROWS * TILE * SCALE
out = Image.new("RGBA", (out_w, out_h), (30, 30, 30, 255))
draw = ImageDraw.Draw(out)

for row in range(ROWS):
    for col in range(COLS):
        tile = img.crop((col * TILE, row * TILE, (col + 1) * TILE, (row + 1) * TILE))
        tile = tile.resize((TILE * SCALE, TILE * SCALE), Image.NEAREST)
        x = PAD + col * TILE * SCALE
        y = PAD + row * TILE * SCALE
        out.paste(tile, (x, y), tile)
        draw.rectangle([x, y, x + TILE * SCALE, y + TILE * SCALE], outline=(80, 80, 80, 255))

for col in range(COLS):
    draw.text((PAD + col * TILE * SCALE + 2, 2), str(col), fill=(255, 255, 0, 255))
for row in range(ROWS):
    idx_start = row * COLS
    draw.text((2, PAD + row * TILE * SCALE + 2), f"{row}({idx_start})", fill=(255, 255, 0, 255))

out.save(OUT)
print("saved", OUT, out.size)
