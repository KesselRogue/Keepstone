from PIL import Image
import os

SRC = "tiny-town/Tilemap/tilemap_packed.png"
COLS, TILE = 12, 16
OUT_TILES = "../public/assets/tiles"
OUT_SPRITES = "../public/assets/sprites"

img = Image.open(SRC).convert("RGBA")

def crop(index):
    row, col = divmod(index, COLS)
    box = (col * TILE, row * TILE, col * TILE + TILE, row * TILE + TILE)
    return img.crop(box)

def save(index, out_dir, name, size):
    tile = crop(index)
    tile = tile.resize((size, size), Image.NEAREST)
    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(out_dir, name)
    tile.save(path)
    print(f"saved {path} ({size}x{size}) from tile index {index}")

# Ground + border
save(0, OUT_TILES, "grass.png", 48)
save(1, OUT_TILES, "grass-alt.png", 48)
save(4, OUT_TILES, "tree-green.png", 48)
save(3, OUT_TILES, "tree-gold.png", 48)

# Scattered decoration
save(15, OUT_SPRITES, "bush.png", 40)
save(29, OUT_SPRITES, "mushroom.png", 32)

# Vendor shop facades (roof + door/window, stacked)
save(63, OUT_SPRITES, "roof-gray.png", 48)
save(67, OUT_SPRITES, "roof-red.png", 48)
save(86, OUT_SPRITES, "door-tan-double.png", 48)
save(89, OUT_SPRITES, "door-gray.png", 48)
save(84, OUT_SPRITES, "window-tan.png", 48)
