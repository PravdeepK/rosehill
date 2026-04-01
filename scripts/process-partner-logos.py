#!/usr/bin/env python3
"""
Copy partner logos into public/logos as PNG/SVG with transparent backgrounds.
Removes near-white and near-black border boxes via edge floods, trims padding,
and caps very large files. Re-run when ~/Downloads/logos_v2_final changes.
"""
from __future__ import annotations

import os
import shutil
from collections import deque
from pathlib import Path
from typing import Callable

from PIL import Image

SRC = Path("/Users/prav/Downloads/logos_v2_final")
OUT = Path(__file__).resolve().parent.parent / "public" / "logos"

# Max longest side after processing (keeps page weight reasonable)
MAX_SIDE = 520
# Upscale tiny trims so they don’t look postage-stamp sized in the grid
MIN_SIDE = 100


def luma(rgb: tuple[int, int, int]) -> float:
    r, g, b = rgb
    return (r + g + b) / 3.0


def flood_from_edges(
    im: Image.Image,
    seed_ok: Callable[[tuple[int, int, int]], bool],
    grow_ok: Callable[[tuple[int, int, int]], bool],
) -> Image.Image:
    """BFS from border: transparent pixels matching seed_ok; grow while grow_ok(r,g,b)."""
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    seen: set[tuple[int, int]] = set()
    q: deque[tuple[int, int]] = deque()

    def try_seed(x: int, y: int) -> None:
        if x < 0 or x >= w or y < 0 or y >= h:
            return
        if px[x, y][3] < 16:
            return
        if not seed_ok(px[x, y][:3]):
            return
        if (x, y) not in seen:
            seen.add((x, y))
            q.append((x, y))

    for x in range(w):
        try_seed(x, 0)
        try_seed(x, h - 1)
    for y in range(h):
        try_seed(0, y)
        try_seed(w - 1, y)

    while q:
        x, y = q.popleft()
        r, g, b, _ = px[x, y]
        px[x, y] = (r, g, b, 0)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if nx < 0 or nx >= w or ny < 0 or ny >= h:
                continue
            if (nx, ny) in seen:
                continue
            if px[nx, ny][3] < 16:
                continue
            if not grow_ok(px[nx, ny][:3]):
                continue
            seen.add((nx, ny))
            q.append((nx, ny))
    return im


def remove_light_border(im: Image.Image) -> Image.Image:
    """Remove white / light-gray boxes (seed luma high, grow in light-ish region)."""

    def seed(c: tuple[int, int, int]) -> bool:
        return luma(c) >= 248

    def grow(c: tuple[int, int, int]) -> bool:
        return luma(c) >= 228

    return flood_from_edges(im, seed, grow)


def remove_dark_border(im: Image.Image) -> Image.Image:
    """Remove black / near-black boxes."""

    def seed(c: tuple[int, int, int]) -> bool:
        return luma(c) <= 22

    def grow(c: tuple[int, int, int]) -> bool:
        return luma(c) <= 55

    return flood_from_edges(im, seed, grow)


def median_edge_rgb(im: Image.Image) -> tuple[int, int, int] | None:
    im = im.convert("RGBA")
    w, h = im.size
    edge_cols: list[tuple[int, int, int]] = []
    for x in range(w):
        for y in (0, h - 1):
            p = im.getpixel((x, y))
            if p[3] > 32:
                edge_cols.append(p[:3])
    for y in range(h):
        for x in (0, w - 1):
            p = im.getpixel((x, y))
            if p[3] > 32:
                edge_cols.append(p[:3])
    if not edge_cols:
        return None
    rs = sorted(c[0] for c in edge_cols)
    gs = sorted(c[1] for c in edge_cols)
    bs = sorted(c[2] for c in edge_cols)
    mid = len(rs) // 2
    return (rs[mid], gs[mid], bs[mid])


def flood_near_color(im: Image.Image, bg: tuple[int, int, int], tol: int) -> Image.Image:
    br, bg_, bb = bg

    def near(c: tuple[int, int, int]) -> bool:
        return (
            abs(c[0] - br) <= tol
            and abs(c[1] - bg_) <= tol
            and abs(c[2] - bb) <= tol
        )

    return flood_from_edges(im, near, near)


def trim_alpha(im: Image.Image, pad: int = 4) -> Image.Image:
    im = im.convert("RGBA")
    a = im.split()[3]
    bbox = a.getbbox()
    if not bbox:
        return im
    x0, y0, x1, y1 = bbox
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(im.width, x1 + pad)
    y1 = min(im.height, y1 + pad)
    return im.crop((x0, y0, x1, y1))


def clamp_size(im: Image.Image) -> Image.Image:
    w, h = im.size
    m = max(w, h)
    if m > MAX_SIDE:
        s = MAX_SIDE / m
        nw = max(1, int(w * s))
        nh = max(1, int(h * s))
        return im.resize((nw, nh), Image.Resampling.LANCZOS)
    if m < MIN_SIDE and m > 0:
        s = MIN_SIDE / m
        nw = max(1, int(w * s))
        nh = max(1, int(h * s))
        return im.resize((nw, nh), Image.Resampling.LANCZOS)
    return im


def normalize_elmwood_wordmark(im: Image.Image, stem: str) -> Image.Image:
    """elmwoodspa.com duotone asset is 250×104 with the same wordmark stacked twice."""
    if stem.lower() != "elmwood_spa":
        return im
    if im.size != (250, 104):
        return im
    return im.crop((0, 0, 250, 38))


def process_raster(path: Path, dest_png: Path) -> None:
    im = Image.open(path).convert("RGBA")
    im = normalize_elmwood_wordmark(im, path.stem)

    im = remove_light_border(im)
    im = remove_dark_border(im)

    med = median_edge_rgb(im)
    if med is not None and 30 < luma(med) < 235:
        im = flood_near_color(im, med, tol=28)
        im = remove_light_border(im)
        im = remove_dark_border(im)

    im = trim_alpha(im, pad=4)
    im = clamp_size(im)

    dest_png.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest_png, "PNG", optimize=True)


def main() -> None:
    if not SRC.is_dir():
        raise SystemExit(f"Source missing: {SRC}")

    OUT.mkdir(parents=True, exist_ok=True)
    for p in OUT.iterdir():
        if p.is_file():
            p.unlink()

    for name in sorted(os.listdir(SRC)):
        path = SRC / name
        if not path.is_file():
            continue
        lower = name.lower()
        if name == "Knix-Logo-Vector.jpg":
            continue
        if lower.endswith(".svg"):
            shutil.copy2(path, OUT / name)
            continue
        if lower.endswith((".png", ".webp", ".jpg", ".jpeg")):
            dest_name = name if lower.endswith(".png") else f"{path.stem}.png"
            process_raster(path, OUT / dest_name)
            continue

    print("Wrote assets to", OUT)


if __name__ == "__main__":
    main()
