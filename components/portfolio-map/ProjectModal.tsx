"use client";

import Image from "next/image";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { CARD_GRADIENT, type PortfolioProject } from "@/lib/portfolioMapData";
import { initials } from "./helpers";

interface ProjectModalProps {
  /** The project to show, or `null` when the modal is closed. */
  project: PortfolioProject | null;
  onClose: () => void;
}

/**
 * Overlay + centered panel for a single portfolio project. Kept mounted at all
 * times (renders `null` when closed) so the open/close effect can reliably
 * restore focus to whatever triggered it.
 *
 * Adds the production-quality bits the demo skipped (plan §7): focus moves to
 * the close button on open and back to the trigger on close, `Escape` closes,
 * focus is trapped inside while open, and body scroll is locked.
 *
 * Projects with photography get a one-at-a-time carousel — prev/next arrows,
 * a position counter, left/right arrow keys and a horizontal swipe, wrapping
 * at both ends, plus a thumbnail strip below it for jumping straight to a shot.
 * Those still awaiting it (`images: []`) keep the gradient-and-initials
 * treatment.
 */
export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const swipeRef = useRef<{ x: number; y: number } | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const nameId = useId();

  // Reset the gallery when a different project opens — adjusted during render
  // rather than in an effect, matching Navbar/PortfolioMap.
  const [activeIndex, setActiveIndex] = useState(0);
  const [lastProjectId, setLastProjectId] = useState<number | null>(null);
  if (project && project.id !== lastProjectId) {
    setLastProjectId(project.id);
    setActiveIndex(0);
  }

  // Stepping with the arrows, the keyboard or a swipe has to drag the strip
  // along with it, or the active thumbnail ends up off-screen. Scrolling a node
  // is a genuine side effect, unlike the derived state adjusted during render.
  useEffect(() => {
    const thumb = stripRef.current?.querySelector<HTMLElement>(
      '[data-active="true"]',
    );
    if (!thumb) return;
    thumb.scrollIntoView({
      block: "nearest",
      inline: "center",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, [activeIndex, project]);

  useEffect(() => {
    if (!project) return;

    triggerRef.current = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      // Left/right step the carousel wherever focus sits inside the modal —
      // nothing else in here uses the arrow keys.
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const count = project.images.length;
        if (count < 2) return;
        e.preventDefault();
        const step = e.key === "ArrowRight" ? 1 : -1;
        setActiveIndex((i) => (i + step + count) % count);
        return;
      }
      if (e.key !== "Tab") return;

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = originalOverflow;
      triggerRef.current?.focus();
    };
  }, [project, onClose]);

  if (!project) return null;

  const active = project.images[activeIndex];
  const count = project.images.length;
  const step = (by: number) => setActiveIndex((i) => (i + by + count) % count);

  // Swipe is the touch counterpart to the arrow keys. Anything mostly-vertical
  // is left alone so the panel underneath still scrolls.
  const onSwipeStart = (e: ReactTouchEvent) => {
    const t = e.touches[0];
    swipeRef.current = { x: t.clientX, y: t.clientY };
  };
  const onSwipeEnd = (e: ReactTouchEvent) => {
    const start = swipeRef.current;
    swipeRef.current = null;
    if (!start || count < 2) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(dy)) return;
    step(dx < 0 ? 1 : -1);
  };

  return (
    <div
      className="map-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center bg-dark/70 p-4 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={nameId}
        // dvh, not vh: iOS Safari's vh ignores its own retracting chrome, which
        // pushed the close button off-screen on a phone.
        className="map-modal-panel relative flex max-h-[88dvh] w-full max-w-[640px] flex-col overflow-auto bg-warm-white"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close project details"
          className="absolute right-3.5 top-3.5 z-10 flex h-11 w-11 cursor-pointer items-center justify-center bg-warm-white/90 text-lg leading-none text-dark transition-colors hover:bg-warm-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 sm:h-8 sm:w-8"
        >
          <span aria-hidden="true">&times;</span>
        </button>

        <div
          className="relative flex aspect-[16/9] items-end overflow-hidden"
          // pan-y keeps vertical scrolling native while horizontal drags
          // reach onSwipeEnd.
          style={{
            background: CARD_GRADIENT[project.category],
            touchAction: "pan-y",
          }}
          onTouchStart={onSwipeStart}
          onTouchEnd={onSwipeEnd}
        >
          {active ? (
            <Image
              src={active.src}
              alt={`${project.name}, ${project.location}`}
              fill
              sizes="(max-width: 688px) 100vw, 640px"
              className="object-cover"
              priority={activeIndex === 0}
            />
          ) : (
            <span
              aria-hidden="true"
              className="absolute -bottom-8 -right-2.5 text-[140px] font-bold leading-none text-white/10"
            >
              {initials(project.name)}
            </span>
          )}

          {count > 1 && (
            <>
              {/* Warm the two neighbours so stepping lands on a decoded image
                  rather than an empty gradient on the first pass through a set. */}
              {[
                ...new Set([
                  (activeIndex + 1) % count,
                  (activeIndex + count - 1) % count,
                ]),
              ]
                .filter((i) => i !== activeIndex)
                .map((i) => (
                  <Image
                    key={project.images[i].src}
                    src={project.images[i].src}
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes="(max-width: 688px) 100vw, 640px"
                    className="pointer-events-none absolute inset-0 opacity-0"
                  />
                ))}

              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center bg-dark/40 text-lg leading-none text-warm-white backdrop-blur-sm transition-colors hover:bg-dark/65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2"
              >
                <span aria-hidden="true">&#8592;</span>
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center bg-dark/40 text-lg leading-none text-warm-white backdrop-blur-sm transition-colors hover:bg-dark/65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2"
              >
                <span aria-hidden="true">&#8594;</span>
              </button>
              <p
                aria-live="polite"
                className="absolute bottom-3 right-3 bg-dark/55 px-2 py-1 text-[10px] tracking-[0.1em] text-warm-white"
              >
                {activeIndex + 1} / {count}
              </p>
            </>
          )}
        </div>

        {count > 1 && (
          <div
            ref={stripRef}
            className="scrollbar-none flex shrink-0 gap-2 overflow-x-auto border-t border-hairline p-3"
          >
            {project.images.map((img, i) => (
              <button
                key={img.src}
                type="button"
                data-active={i === activeIndex}
                onClick={() => setActiveIndex(i)}
                aria-label={`Show photo ${i + 1} of ${count}`}
                aria-current={i === activeIndex}
                // Transparent border on the inactive ones so selecting a
                // thumbnail recolours it rather than reflowing the strip.
                className={`relative h-12 w-20 shrink-0 cursor-pointer overflow-hidden border-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 ${
                  i === activeIndex
                    ? "border-gold"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.src}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <div className="p-7 md:p-8">
          <span className="block text-[10px] uppercase tracking-[0.18em] text-gold-contrast">
            {project.category}
          </span>
          <h2 id={nameId} className="mt-2 text-2xl font-light">
            {project.name}
          </h2>
          <p className="mt-1 text-xs text-medium-grey">{project.location}</p>
          <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-medium-grey">
            {project.description}
          </p>

          {project.placeholder && (
            <p className="mt-5 border-l-2 border-gold pl-3 text-[11px] leading-relaxed tracking-[0.06em] text-gold-contrast">
              Placeholder content. Real project photography and copy would
              replace this.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
