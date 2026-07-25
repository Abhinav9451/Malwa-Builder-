"""Logo assets: loader (9434) processed; header/footer (9432) copied HD as-is."""
import os
import shutil
from PIL import Image

SRC_DARK = r"C:\Users\Abhey\Downloads\IMG_9434.PNG"
SRC_CHROME = r"C:\Users\Abhey\Downloads\IMG_9432.PNG"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "assets")


def rgba_from_white(im: Image.Image, white_cutoff: int = 238) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r >= white_cutoff and g >= white_cutoff and b >= white_cutoff:
                px[x, y] = (r, g, b, 0)
            else:
                px[x, y] = (18, 16, 14, 255)
    return im



def trim(im: Image.Image, pad: int = 12) -> Image.Image:
    bbox = im.getbbox()
    if not bbox:
        return im
    x0, y0, x1, y1 = bbox
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(im.width, x1 + pad)
    y1 = min(im.height, y1 + pad)
    return im.crop((x0, y0, x1, y1))


def export_wordmark(logo: Image.Image, base_name: str) -> None:
    full = logo.copy()
    full.thumbnail((900, 128), Image.LANCZOS)
    full.save(os.path.join(ASSETS, f"{base_name}.png"), optimize=True)
    full.save(os.path.join(ASSETS, f"{base_name}.webp"), "WEBP", quality=92, method=6)


def main():
    os.makedirs(ASSETS, exist_ok=True)

    # Loader splash — full HD black logo on cream (IMG_9434, unchanged)
    if os.path.isfile(SRC_DARK):
        shutil.copy2(SRC_DARK, os.path.join(ASSETS, "logo-light.png"))
    else:
        print(f"MISSING loader logo: {SRC_DARK}")

    # Optional small favicon sources from trimmed transparent mark
    logo_dark = trim(rgba_from_white(Image.open(SRC_DARK)))
    export_wordmark(logo_dark, "logo")

    # Header & footer: full-resolution file unchanged (white on black)
    if os.path.isfile(SRC_CHROME):
        shutil.copy2(SRC_CHROME, os.path.join(ASSETS, "logo-chrome.png"))
    else:
        print(f"MISSING chrome logo: {SRC_CHROME}")

    # Favicon from dark emblem (IMG_9434)
    w, h = logo_dark.size
    emblem = logo_dark.crop((0, 0, int(w * 0.58), int(h * 0.72)))
    emblem = trim(emblem, pad=8)
    side = max(emblem.size)
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    ex, ey = emblem.size
    square.paste(emblem, ((side - ex) // 2, (side - ey) // 2), emblem)
    for size, name in ((512, "favicon.png"), (192, "apple-touch-icon.png"), (32, "favicon-32.png")):
        square.resize((size, size), Image.LANCZOS).save(os.path.join(ASSETS, name), optimize=True)

    print("Wrote logo-light.png + logo-chrome.png (HD copies), logo.*, favicon PNGs")


if __name__ == "__main__":
    main()
