"""Inspect each PNG logo for an opaque (non-transparent) background.

For each logo we report:
- Corner pixel values (RGBA) so we can see if the strict edges are transparent.
- The percent of opaque (alpha >= 250) pixels that are also near-white
  (R,G,B all >= 240). A high value implies a solid white background was
  baked into the file, which is what causes a visible "card" when the
  hover state lifts the grayscale/opacity tone in the logo wall.
- Percent of pixels along the four edge bands (a 2px frame) that are opaque.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

LOGOS_DIR = Path(__file__).resolve().parent.parent / "public" / "logos"

NEAR_WHITE_RGB = 240
OPAQUE_ALPHA = 250
EDGE_BAND = 2


def near_white(r: int, g: int, b: int) -> bool:
    return r >= NEAR_WHITE_RGB and g >= NEAR_WHITE_RGB and b >= NEAR_WHITE_RGB


def describe(path: Path) -> dict:
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    px = img.load()

    total = w * h
    opaque = 0
    near_white_opaque = 0
    near_white_any_alpha = 0
    visible_white_weight = 0.0

    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            is_opaque = a >= OPAQUE_ALPHA
            is_near_white = near_white(r, g, b)
            if is_opaque:
                opaque += 1
                if is_near_white:
                    near_white_opaque += 1
            if a > 0 and is_near_white:
                near_white_any_alpha += 1
                visible_white_weight += a / 255.0

    corners = {
        "tl": tuple(px[0, 0]),
        "tr": tuple(px[w - 1, 0]),
        "bl": tuple(px[0, h - 1]),
        "br": tuple(px[w - 1, h - 1]),
    }
    return {
        "name": path.name,
        "size": (w, h),
        "opaque_pct": opaque / total * 100,
        "white_bg_pct": near_white_opaque / total * 100,
        "white_any_alpha_pct": near_white_any_alpha / total * 100,
        "white_weight_pct": visible_white_weight / total * 100,
        "corners": corners,
    }


def main() -> None:
    rows = []
    for p in sorted(LOGOS_DIR.iterdir()):
        if p.suffix.lower() != ".png":
            continue
        rows.append(describe(p))

    rows.sort(key=lambda r: -r["white_weight_pct"])

    print(
        f"{'Logo':35} {'Size':>11}  {'Opq%':>5}  {'WhiteBG%':>8}  {'WhiteAny%':>9}  {'Vis.Wht%':>8}  Flag"
    )
    print("-" * 100)
    for r in rows:
        flag = ""
        if r["white_weight_pct"] > 0.5 or r["white_bg_pct"] > 0.5:
            flag = "[WHITE BG]"
        size = f"{r['size'][0]}x{r['size'][1]}"
        print(
            f"{r['name']:35} {size:>11}  "
            f"{r['opaque_pct']:5.1f}  {r['white_bg_pct']:8.1f}  "
            f"{r['white_any_alpha_pct']:9.1f}  {r['white_weight_pct']:8.2f}  {flag}"
        )


if __name__ == "__main__":
    main()
