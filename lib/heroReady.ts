// Shared signal between the Hero and the intro splash. The splash waits for the
// hero video to reach a sharp, playing frame before it clears — letting adaptive
// streaming ramp the quality up behind the logo instead of in front of viewers.
//
// Both consumers are client components in the same bundle, so this module-level
// flag is a single shared instance at runtime.
export const HERO_READY_EVENT = "rh-hero-ready";

let ready = false;

/** Called by the Hero once its video is sharp and playing. */
export function markHeroReady() {
  if (ready || typeof window === "undefined") return;
  ready = true;
  window.dispatchEvent(new Event(HERO_READY_EVENT));
}

/** Lets the splash catch a hero that became ready before it subscribed. */
export function isHeroReady() {
  return ready;
}
