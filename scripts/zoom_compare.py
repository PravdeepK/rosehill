"""Zoomed side-by-side of a single logo before and after cleaning."""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
LOGOS_DIR = ROOT / "public" / "logos"
CLEANED_DIR = LOGOS_DIR / "_cleaned"
PREVIEW_DIR = LOGOS_DIR / "_preview"

WARM_GREY = (232, 230, 225, 255)
DARK = (20, 30, 50, 255)
SCALE = 4


def composite(logo: Image.Image, bg: tuple) -> Image.Image:
    canvas = Image.new("RGBA", logo.size, bg)
    canvas.alpha_composite(logo)
    return canvas


def main() -> None:
    name = sys.argv[1] if len(sys.argv) > 1 else "Strabag.png"
    orig = Image.open(LOGOS_DIR / name).convert("RGBA")
    cleaned = Image.open(CLEANED_DIR / name).convert("RGBA")

    parts = [
        ("orig/warm", composite(orig, WARM_GREY)),
        ("clean/warm", composite(cleaned, WARM_GREY)),
        ("orig/dark", composite(orig, DARK)),
        ("clean/dark", composite(cleaned, DARK)),
    ]

    w, h = orig.size
    full = Image.new("RGBA", ((w * SCALE + 4) * len(parts), h * SCALE), (255, 255, 255, 255))
    x = 0
    for _, im in parts:
        zoomed = im.resize((w * SCALE, h * SCALE), Image.NEAREST)
        full.paste(zoomed, (x, 0))
        x += w * SCALE + 4

    out = PREVIEW_DIR / f"zoom_{name}"
    full.save(out, optimize=True)
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
