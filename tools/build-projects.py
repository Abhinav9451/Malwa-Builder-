"""Generate web assets for the projects gallery.

Source renders are 4K PNGs (10-28 MB each) kept outside the repo. This writes
two WebP sizes per image: one for the gallery grid, one for the lightbox.
Re-run after adding renders to SOURCE.
"""
import os
from PIL import Image, ImageDraw, ImageFont

SOURCE = r"C:\Users\Abhey\Downloads\Malwa Builders"
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "projects")

GRID_W, GRID_Q = 1400, 78
FULL_W, FULL_Q = 2400, 82

# Site page background — sky in exteriors is tinted toward this before export
PAGE_BG = (246, 243, 236)

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

INTERIOR_SLUGS = frozenset({
    "office-reception", "office-waiting", "office-cabin", "office-conference",
})


def resize(im, width):
    if im.width <= width:
        return im.copy()
    return im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)


def sky_blend(im: Image.Image) -> None:
    """Soft top band: sky reads as the same cream as the page (--bg)."""
    w, h = im.size
    band = max(1, int(h * 0.22))
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    px = overlay.load()
    for y in range(band):
        t = 1.0 - (y / band) ** 1.55
        alpha = int(255 * t * 0.72)
        for x in range(w):
            px[x, y] = (*PAGE_BG, alpha)
    im.paste(overlay, (0, 0), overlay)


def _wm_font(size: int):
    for name in ("georgia.ttf", "times.ttf", "arial.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def watermark(im: Image.Image, *, full: bool) -> None:
    """Diagonal tile + center mark — survives casual screenshot saves."""
    w, h = im.size
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    tile_size = max(14, w // (48 if full else 58))
    font = _wm_font(tile_size)
    text = "MALWA BUILDERS"
    step = int(tile_size * 7.2)
    angle = -24

    tile = Image.new("RGBA", (step * 2, step * 2), (0, 0, 0, 0))
    tdraw = ImageDraw.Draw(tile)
    for ty in range(-step, step * 2, step):
        for tx in range(-step, step * 2, step):
            tdraw.text((tx + step // 3, ty + step // 3), text, fill=(255, 255, 255, 38), font=font)
    tile = tile.rotate(angle, expand=True, resample=Image.BICUBIC)
    for oy in range(-tile.height, h + tile.height, max(1, tile.height // 2)):
        for ox in range(-tile.width, w + tile.width, max(1, tile.width // 2)):
            layer.paste(tile, (ox, oy), tile)

    center_size = max(18, w // (22 if full else 28))
    cf = _wm_font(center_size)
    bbox = draw.textbbox((0, 0), text, font=cf)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    mark = Image.new("RGBA", (tw + 40, th + 40), (0, 0, 0, 0))
    md = ImageDraw.Draw(mark)
    md.text((20, 20), text, fill=(255, 255, 255, 72 if full else 58), font=cf)
    mark = mark.rotate(-14, expand=True, resample=Image.BICUBIC)
    layer.paste(mark, ((w - mark.width) // 2, (h - mark.height) // 2 - h // 28), mark)

    im.paste(layer, (0, 0), layer)


def process(im: Image.Image, slug: str, full: bool) -> Image.Image:
    out = im.copy()
    if slug not in INTERIOR_SLUGS:
        sky_blend(out)
    watermark(out, full=full)
    return out


def main():
    os.makedirs(OUT, exist_ok=True)
    total = 0
    for name, slug in IMAGES:
        src = os.path.join(SOURCE, name)
        if not os.path.exists(src):
            print(f"MISSING  {name}")
            continue
        im = Image.open(src).convert("RGB")
        for width, quality, suffix, full in (
            (GRID_W, GRID_Q, "", False),
            (FULL_W, FULL_Q, "-full", True),
        ):
            path = os.path.join(OUT, f"{slug}{suffix}.webp")
            sized = resize(im, width)
            processed = process(sized, slug, full)
            processed.save(path, "WEBP", quality=quality, method=6)
            total += os.path.getsize(path)
        im.close()
        grid = os.path.getsize(os.path.join(OUT, slug + ".webp")) / 1024
        full = os.path.getsize(os.path.join(OUT, slug + "-full.webp")) / 1024
        print(f"{slug:<22} grid {grid:6.0f} KB   full {full:6.0f} KB")
    print(f"\ntotal {total / 1024 / 1024:.1f} MB in {OUT}")


if __name__ == "__main__":
    main()
