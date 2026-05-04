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

  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8 sm:gap-x-8 sm:gap-y-10 md:gap-x-10 md:gap-y-12 list-none p-0 m-0 items-center justify-items-center">
      {items.map(({ name: file, v }) => {
        const base = `/logos/${encodeURIComponent(file)}`;
        // Always include the file mtime as a cache-buster so an updated
        // logo asset shows up immediately even when browsers have cached
        // the previous bytes under the same path.
        const src = `${base}?v=${Math.floor(v)}`;
        const label = file.replace(/\.(png|svg)$/i, "").replace(/_/g, " ");
        const maskUrl = `url("${src}")`;
        return (
          <li
            key={file}
            className="w-full max-w-[180px] h-12 sm:h-14 flex items-center justify-center text-dark/75 hover:text-gold transition-colors duration-300"
          >
            <span
              role="img"
              aria-label={label}
              className="block w-full h-full bg-current"
              style={{
                WebkitMaskImage: maskUrl,
                maskImage: maskUrl,
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                WebkitMaskSize: "contain",
                maskSize: "contain",
              }}
            />
          </li>
        );
      })}
    </ul>
  );
}
