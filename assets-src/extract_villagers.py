from PIL import Image
import os

SRC = "tiny-dungeon/Tilemap/tilemap_packed.png"
COLS, TILE = 12, 16
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

# Ambient town villagers — a mix of ages for a "bustling town" feel.
save(85, OUT_SPRITES, "villager-1.png", 28)
save(86, OUT_SPRITES, "villager-2.png", 28)
save(89, OUT_SPRITES, "villager-3.png", 28)
save(100, OUT_SPRITES, "villager-elder.png", 28)
