"""Composite cleaned logos side-by-side on warm-grey and dark bgs.

Use this to eyeball the final on-page appearance before/after a logo
cleanup pass.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
LOGOS_DIR = ROOT / "public" / "logos"
PREVIEW_DIR = LOGOS_DIR / "_preview"

WARM_GREY = (232, 230, 225, 255)  # #e8e6e1 (page bg)
DARK = (20, 30, 50, 255)          # contrast bg to expose any halos
TILE_W, TILE_H = 240, 96
PAD = 12

TARGETS = [
    "Tbooth.png",
    "Elmspa.png",
    "Rolex_Canada.png",
    "Metrolinx.png",
    "Strabag.png",
    "Seneca_College.png",
    "Bangkok_Garden.png",
    "Guerlain_Spa.png",
    "Scarborough_Hospital_Network.png",
]


def fit_into_tile(logo: Image.Image, bg: tuple) -> Image.Image:
    tile = Image.new("RGBA", (TILE_W, TILE_H), bg)
    w, h = logo.size
    scale = min((TILE_W - 2 * PAD) / w, (TILE_H - 2 * PAD) / h)
    nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
    resized = logo.resize((nw, nh), Image.LANCZOS)
    ox = (TILE_W - nw) // 2
    oy = (TILE_H - nh) // 2
    tile.alpha_composite(resized, (ox, oy))
    return tile


def main() -> None:
    PREVIEW_DIR.mkdir(exist_ok=True)
    rows = []
    for name in TARGETS:
        logo = Image.open(LOGOS_DIR / name).convert("RGBA")
        row = Image.new(
            "RGBA", (TILE_W * 2 + 4, TILE_H), (200, 200, 200, 255)
        )
        row.paste(fit_into_tile(logo, WARM_GREY), (0, 0))
        row.paste(fit_into_tile(logo, DARK), (TILE_W + 4, 0))
        rows.append((name, row))

    label_h = 22
    full = Image.new(
        "RGBA",
        (TILE_W * 2 + 4, (TILE_H + label_h) * len(rows)),
        (255, 255, 255, 255),
    )
    draw = ImageDraw.Draw(full)
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 13)
    except OSError:
        font = ImageFont.load_default()

    y = 0
    for name, row in rows:
        draw.rectangle([0, y, full.width, y + label_h], fill=(245, 245, 245, 255))
        draw.text(
            (8, y + 4),
            f"{name}    |    on warm-grey (page)    |    on dark (halo test)",
            fill=(20, 20, 20, 255),
            font=font,
        )
        full.paste(row, (0, y + label_h))
        y += TILE_H + label_h

    out = PREVIEW_DIR / "final.png"
    full.save(out, optimize=True)
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
