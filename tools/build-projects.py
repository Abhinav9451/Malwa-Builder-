"""Generate web assets for the projects gallery.

Source renders are 4K PNGs (10-28 MB each) kept outside the repo. This writes
two WebP sizes per image: one for the gallery grid, one for the lightbox.
Re-run after adding renders to SOURCE.
"""
import os
from PIL import Image

SOURCE = r"C:\Users\Abhey\Downloads\Malwa Builders"
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "projects")

GRID_W, GRID_Q = 1400, 78
FULL_W, FULL_Q = 2400, 82

# source file -> output slug
IMAGES = [
    ("Malwa Builders Villa (1).png", "villa-front"),
    ("Malwa Builders Villa (2).png", "villa-portico"),
    ("Malwa Builders Villa (3).png", "villa-pavilion"),
    ("Malwa Builders Villa (4).png", "villa-lawn"),
    ("Malwa Builders Villa (5).png", "villa-arched"),
    ("Malwa Builders Single Story (1).png", "courtyard-dusk"),
    ("Malwa Builders Single Story (2).png", "courtyard-aerial"),
    ("Malwa Builders Single Story (3).png", "farmhouse-arcade"),
    ("Malwa Builders Single Story (4).png", "farmhouse-porch"),
    ("Malwa Builders Single Story (5).png", "farmhouse-wing"),
    ("Malwa Builders (1).png", "heritage-street"),
    ("Malwa Builders (2).png", "stone-arcade-front"),
    ("Malwa Builders (4).png", "stone-arcade-veranda"),
    ("Malwa Builders (5).png", "modern-split"),
    ("Reception Area.png", "office-reception"),
    ("Waiting Area (3).png", "office-waiting"),
    ("Office Area.png", "office-cabin"),
    ("Conference Room.png", "office-conference"),
]


def resize(im, width):
    if im.width <= width:
        return im.copy()
    return im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)


def main():
    os.makedirs(OUT, exist_ok=True)
    total = 0
    for name, slug in IMAGES:
        src = os.path.join(SOURCE, name)
        if not os.path.exists(src):
            print(f"MISSING  {name}")
            continue
        im = Image.open(src).convert("RGB")
        for width, quality, suffix in ((GRID_W, GRID_Q, ""), (FULL_W, FULL_Q, "-full")):
            path = os.path.join(OUT, f"{slug}{suffix}.webp")
            resize(im, width).save(path, "WEBP", quality=quality, method=6)
            total += os.path.getsize(path)
        im.close()
        grid = os.path.getsize(os.path.join(OUT, slug + ".webp")) / 1024
        full = os.path.getsize(os.path.join(OUT, slug + "-full.webp")) / 1024
        print(f"{slug:<22} grid {grid:6.0f} KB   full {full:6.0f} KB")
    print(f"\ntotal {total / 1024 / 1024:.1f} MB in {OUT}")


if __name__ == "__main__":
    main()
