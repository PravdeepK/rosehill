"use client";

import { useEffect, useState } from "react";
import { HERO_READY_EVENT, isHeroReady } from "@/lib/heroReady";

const MIN_MS = 1400; // keep the logo on screen at least this long
const MAX_MS = 8000; // …but never hang: reveal even if 1080p isn't reached yet
const EXIT_MS = 700; // overlay cross-fade duration (matches globals.css)
const TRICKLE_TO = 90; // loading bar eases to this %, then snaps to 100 on ready

// In-memory flag: a full page load (refresh) resets it so the splash replays,
// while in-app navigation back to the landing page reuses it and skips the
// splash — so clicking around the site doesn't trigger it every time.
let played = false;

/**
 * Brand splash on the landing page: the Rose Hill logo on warm-white while the
 * Hero video loads and adaptive streaming ramps its quality up behind the logo.
 * The splash clears once the hero signals full quality (or after a hard cap on
 * slow connections), then cross-fades to reveal the already-sharp 1080p video.
 *
 * Plays on every full page load; skipped on in-app navigation (see `played`).
 */
export default function IntroGate() {
  // Decide once, at mount, whether this load should play the splash.
  const [show] = useState(() => !played);
  const [exiting, setExiting] = useState(false);
  const [done, setDone] = useState(false);
  // Loading bar: trickles toward TRICKLE_TO while the video loads, then snaps
  // to 100 the moment the hero signals it's ready (or the MAX_MS cap fires).
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!show) return;

    // Lock scroll while the splash is up.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const start = performance.now();
    let dismissed = false;
    let exitTimer = 0;
    let doneTimer = 0;

    const beginExit = () => {
      played = true; // an in-app nav back to the landing page won't replay it
      document.body.style.overflow = prevOverflow;
      setExiting(true);
      doneTimer = window.setTimeout(() => setDone(true), EXIT_MS);
    };

    // Honour MIN_MS so the logo is always seen, even if the video is instant.
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      setComplete(true); // fill the bar the rest of the way
      setProgress(100);
      const remaining = Math.max(0, MIN_MS - (performance.now() - start));
      exitTimer = window.setTimeout(beginExit, remaining);
    };

    // Kick the trickle on the next frame so the bar starts at 0 and eases up.
    const raf = requestAnimationFrame(() => {
      if (!dismissed) setProgress(TRICKLE_TO);
    });

    if (isHeroReady()) dismiss();
    else window.addEventListener(HERO_READY_EVENT, dismiss, { once: true });
    const cap = window.setTimeout(dismiss, MAX_MS);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener(HERO_READY_EVENT, dismiss);
      window.clearTimeout(cap);
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
      document.body.style.overflow = prevOverflow;
    };
  }, [show]);

  if (!show || done) return null;

  return (
    <div
      className="intro-overlay"
      data-exit={exiting}
      role="presentation"
      aria-hidden="true"
    >
      <link
        rel="preload"
        as="image"
        href="/company-logos/rosehill-linear-colour.png"
        fetchPriority="high"
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- must paint
          instantly with the preload above; next/image would defer it. */}
      <img
        src="/company-logos/rosehill-linear-colour.png"
        alt=""
        width={600}
        height={165}
        fetchPriority="high"
        className="intro-logo"
      />
      <div className="intro-progress">
        <span
          className="intro-progress__fill"
          data-complete={complete}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
