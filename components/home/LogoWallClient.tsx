"use client";

import { useEffect, useState } from "react";

export type LogoMeta = { name: string; v: number };

function signature(items: LogoMeta[]): string {
  return items.map((i) => `${i.name}:${i.v}`).join("|");
}

export default function LogoWallClient({
  initialItems,
}: {
  initialItems: LogoMeta[];
}) {
  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const tick = async () => {
      try {
        const r = await fetch("/api/logos-meta", { cache: "no-store" });
        if (!r.ok) return;
        const next = (await r.json()) as LogoMeta[];
        setItems((prev) =>
          signature(next) !== signature(prev) ? next : prev
        );
      } catch {
        /* ignore transient dev errors */
      }
    };

    const id = setInterval(tick, 1200);
    void tick();
    return () => clearInterval(id);
  }, []);

  const tone =
    "grayscale opacity-[0.88] hover:grayscale-0 hover:opacity-100 transition duration-300 drop-shadow-[0_0_0.65px_rgba(26,26,26,0.22)]";

  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-12 md:gap-x-10 md:gap-y-14 list-none p-0 m-0 items-center justify-items-center">
      {items.map(({ name: file, v }) => {
        const base = `/logos/${encodeURIComponent(file)}`;
        const src =
          process.env.NODE_ENV === "development"
            ? `${base}?v=${Math.floor(v)}`
            : base;
        const label = file.replace(/\.(png|svg)$/i, "").replace(/_/g, " ");
        return (
          <li
            key={file}
            className="w-full max-w-[200px] flex items-center justify-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- trusted local assets from /public */}
            <img
              src={src}
              alt={label}
              className={`h-10 w-auto max-w-[160px] object-contain ${tone}`}
              loading="lazy"
              decoding="async"
            />
          </li>
        );
      })}
    </ul>
  );
}
