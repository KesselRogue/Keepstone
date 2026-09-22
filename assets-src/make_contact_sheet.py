from PIL import Image, ImageDraw

SRC = "tiny-dungeon/Tilemap/tilemap_packed.png"
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

out.save("contact_sheet.png")
print("saved", out.size)
