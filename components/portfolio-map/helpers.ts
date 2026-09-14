import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { CITIES, PROJECTS } from "@/lib/portfolioMapData";

/** Two-letter monogram for the placeholder card/modal image watermark. */
export function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Full display name for a city key, falling back to the key itself. */
export function cityName(key: string): string {
  return CITIES.find((c) => c.key === key)?.name ?? key;
}

/** Number of projects Rose Hill Design Build has in a given city key. */
export function projectCount(key: string): number {
  return PROJECTS.filter((p) => p.city === key).length;
}

/**
 * Shared keyboard activation for elements given `role="button"` + `tabIndex={0}`
 * (SVG markers, petals, the zoom-out hub). Mirrors native button behaviour:
 * Enter / Space fire the action and Space's default page-scroll is suppressed.
 */
export function onActivateKey(
  e: ReactKeyboardEvent,
  fn: () => void,
): void {
  if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
    e.preventDefault();
    fn();
  }
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
