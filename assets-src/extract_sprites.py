from PIL import Image
import os

SRC = "tiny-dungeon/Tilemap/tilemap_packed.png"
COLS, TILE = 12, 16
OUT_SPRITES = "../public/assets/sprites"
OUT_TILES = "../public/assets/tiles"

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

save(96, OUT_SPRITES, "player.png", 28)
save(110, OUT_SPRITES, "skulker.png", 24)
save(121, OUT_SPRITES, "brute.png", 44)
save(104, OUT_SPRITES, "icon-weapon.png", 32)
save(102, OUT_SPRITES, "icon-shield.png", 32)

save(36, OUT_TILES, "wall.png", 48)
save(0, OUT_TILES, "floor.png", 48)
save(12, OUT_TILES, "floor-alt.png", 48)
