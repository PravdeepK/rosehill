"use client";

import { useEffect, useId, useRef } from "react";
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
 */
export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const nameId = useId();

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

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-dark/70 p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={nameId}
        className="relative flex max-h-[88vh] w-full max-w-[640px] flex-col overflow-auto bg-warm-white"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close project details"
          className="absolute right-3.5 top-3.5 z-10 flex h-8 w-8 items-center justify-center bg-warm-white/90 text-lg leading-none text-dark transition-colors hover:bg-warm-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2"
        >
          <span aria-hidden="true">&times;</span>
        </button>

        <div
          className="relative flex aspect-[16/9] items-end overflow-hidden"
          style={{ background: CARD_GRADIENT[project.category] }}
        >
          <span
            aria-hidden="true"
            className="absolute -bottom-8 -right-2.5 text-[140px] font-bold leading-none text-white/10"
          >
            {initials(project.name)}
          </span>
        </div>

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
              Placeholder content — real project photography and copy would
              replace this.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
