"""Remove white backgrounds from logo PNGs using edge flood-fill.

Strategy:
- Treat any pixel that is *either* already transparent (alpha < 32) or
  near-white (min(R,G,B) >= 235) as a "background candidate".
- Flood-fill from every edge pixel through 4-connected background candidates.
- For pixels reached by the flood:
    - if the pixel is near-white, set alpha to 0
    - if the pixel is borderline (gray/anti-aliased), scale alpha down by how
      "white" it is, so the soft edge against the new transparent background
      looks clean instead of leaving a halo.
- Pixels NOT reached by the flood are preserved verbatim. This keeps:
    - white text inside a colored badge (Tbooth's T, Strabag's STRABAG)
    - any inner white shapes that are part of the logo

Usage:
  python scripts/clean_logo_bg.py            # write to public/logos/_cleaned
  python scripts/clean_logo_bg.py --apply    # overwrite originals in place
  python scripts/clean_logo_bg.py --diff-only  # also save a red diff overlay
"""

from __future__ import annotations

import argparse
import sys
from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
LOGOS_DIR = ROOT / "public" / "logos"
CLEANED_DIR = LOGOS_DIR / "_cleaned"
DIFF_DIR = LOGOS_DIR / "_diff"

# (filename, aggressive)
# aggressive=True also removes trapped white regions (those NOT reachable
# from the edge by flood-fill). Use only when the trapped white is canvas
# rather than intentional white-on-color lettering.
TARGETS: list[tuple[str, bool]] = [
    # Aggressive mode removes ALL near-white pixels (including ones trapped
    # inside colored shapes). Per the design call we want every logo on
    # the wall to render with no white bleeding through against the
    # warm-grey page bg or on hover, even when the white was intentional
    # (e.g. the "T" inside Tbooth's purple badge becomes transparent so
    # the page bg shows through).
    ("Tbooth.png", True),
    ("Elmspa.png", True),
    ("Rolex_Canada.png", True),
    ("Metrolinx.png", True),
    ("Strabag.png", True),
    ("Seneca_College.png", True),
    ("Bangkok_Garden.png", True),
    ("Guerlain_Spa.png", True),
    ("Scarborough_Hospital_Network.png", True),
]

NEAR_WHITE_MIN = 235     # min(R,G,B) >= this = "near white"
SOFT_EDGE_MIN = 200      # pixels in [200, 235) get a softened alpha
ALPHA_TRANSPARENT = 32   # alpha below this is treated as already background


def is_background_candidate(r: int, g: int, b: int, a: int) -> bool:
    if a < ALPHA_TRANSPARENT:
        return True
    return min(r, g, b) >= SOFT_EDGE_MIN


def clean_image(src_path: Path, aggressive: bool = False) -> tuple[Image.Image, Image.Image, dict]:
    img = Image.open(src_path).convert("RGBA")
    w, h = img.size
    pixels = list(img.getdata())

    visited = bytearray(w * h)
    queue: deque[int] = deque()

    def idx(x: int, y: int) -> int:
        return y * w + x

    if aggressive:
        for i, (r, g, b, a) in enumerate(pixels):
            if is_background_candidate(r, g, b, a):
                visited[i] = 1
    else:
        for x in range(w):
            for y in (0, h - 1):
                i = idx(x, y)
                r, g, b, a = pixels[i]
                if is_background_candidate(r, g, b, a):
                    visited[i] = 1
                    queue.append(i)
        for y in range(h):
            for x in (0, w - 1):
                i = idx(x, y)
                r, g, b, a = pixels[i]
                if is_background_candidate(r, g, b, a):
                    visited[i] = 1
                    queue.append(i)

        neighbors = (
            (1, 0), (-1, 0), (0, 1), (0, -1),
            (1, 1), (1, -1), (-1, 1), (-1, -1),
        )
        while queue:
            i = queue.popleft()
            x = i % w
            y = i // w
            for dx, dy in neighbors:
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h:
                    ni = idx(nx, ny)
                    if visited[ni]:
                        continue
                    r, g, b, a = pixels[ni]
                    if is_background_candidate(r, g, b, a):
                        visited[ni] = 1
                        queue.append(ni)

    new_pixels = list(pixels)
    diff_pixels = [(0, 0, 0, 0)] * len(pixels)
    removed = 0
    softened = 0

    for i, (r, g, b, a) in enumerate(pixels):
        if not visited[i]:
            continue
        m = min(r, g, b)
        if m >= NEAR_WHITE_MIN:
            new_pixels[i] = (r, g, b, 0)
            if a > 0:
                removed += 1
                diff_pixels[i] = (255, 0, 0, 220)
        else:
            scale = max(0.0, (m - SOFT_EDGE_MIN) / (NEAR_WHITE_MIN - SOFT_EDGE_MIN))
            new_a = int(a * scale)
            if new_a < a:
                softened += 1
                diff_pixels[i] = (255, 140, 0, 200)
            new_pixels[i] = (r, g, b, new_a)

    out = Image.new("RGBA", (w, h))
    out.putdata(new_pixels)

    diff = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    diff.paste(img, (0, 0))
    overlay = Image.new("RGBA", (w, h))
    overlay.putdata(diff_pixels)
    diff.alpha_composite(overlay)

    stats = {
        "size": (w, h),
        "removed": removed,
        "softened": softened,
        "total": len(pixels),
    }
    return out, diff, stats


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="overwrite originals")
    parser.add_argument("--no-diff", action="store_true", help="skip diff images")
    args = parser.parse_args()

    if not args.apply:
        CLEANED_DIR.mkdir(exist_ok=True)
    if not args.no_diff:
        DIFF_DIR.mkdir(exist_ok=True)

    print(f"{'Logo':35} {'Mode':>10}  {'Removed%':>9}  {'Softened%':>9}")
    print("-" * 70)
    missing = []
    for name, aggressive in TARGETS:
        src = LOGOS_DIR / name
        if not src.exists():
            missing.append(name)
            continue
        cleaned, diff, stats = clean_image(src, aggressive=aggressive)
        rm_pct = stats["removed"] / stats["total"] * 100
        sf_pct = stats["softened"] / stats["total"] * 100
        mode = "aggressive" if aggressive else "edge-flood"
        print(f"{name:35} {mode:>10}  {rm_pct:9.2f}  {sf_pct:9.2f}")

        if args.apply:
            cleaned.save(src, optimize=True)
        else:
            cleaned.save(CLEANED_DIR / name, optimize=True)
        if not args.no_diff:
            diff.save(DIFF_DIR / name, optimize=True)

    if missing:
        print("\nMissing:", missing, file=sys.stderr)


if __name__ == "__main__":
    main()
