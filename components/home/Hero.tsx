"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { markHeroReady } from "@/lib/heroReady";

const STREAM_SUBDOMAIN = process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_SUBDOMAIN;
const VIDEO_UID = process.env.NEXT_PUBLIC_HERO_VIDEO_UID;

// One progressive MP4 from Cloudflare Stream rather than the adaptive manifest.
// Stream generates this from the same upload; it has to be enabled once per
// video via the Stream /downloads API, and is then served from the same CDN.
//
// A single rendition is the whole point. Adaptive streaming opens on a low
// rendition and climbs, so the first four seconds are only ever buffered at
// 480p — measured by seeking a live page back to 0 — and the viewer had already
// missed ~4.7s of the reel by the time the poster cross-faded. With one
// rendition there is no ladder to climb: frame one is full quality, and because
// a progressive file plays from a short prefix instead of a whole 4s segment it
// arrives sooner than HLS managed even on a fast link (70ms / 307ms at 5Mbps /
// 711ms at 2Mbps, against ~4.5s for the stream to reach 1080p).
//
// The cost is that there is nothing to adapt: everyone pulls the same file, so
// a slow connection buys a sharp picture with buffering rather than a soft one.
const MP4_SRC = `https://${STREAM_SUBDOMAIN}/${VIDEO_UID}/downloads/default.mp4`;
const POSTER = `https://${STREAM_SUBDOMAIN}/${VIDEO_UID}/thumbnails/thumbnail.jpg?height=1080`;

// The video deliberately does NOT autoplay. Letting it run behind the poster is
// what made viewers join the reel part-way through; instead it buffers while
// paused at 0 and we start it at the moment we cross-fade, so everyone sees the
// opening frame. `loadeddata` (readyState 2, first frame decoded) is the cue and
// NOT `canplay`: Chrome stops buffering a paused element once it has that frame,
// so on a throttled link readyState never reaches 3 and `canplay` never fires —
// measured, it sat on the poster until the fallback timer fired instead.
const REVEAL_FALLBACK_MS = 8000;

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;

    // Cross-fade poster→video, start the reel from its first frame, and clear
    // the splash — all at the same moment.
    const reveal = () => {
      if (cancelled) return;
      setRevealed(true);
      markHeroReady();
      // Autoplay is muted, so this is allowed; ignore a rejection rather than
      // leaving an unhandled promise if a policy ever blocks it.
      void video.play().catch(() => {});
    };

    video.addEventListener("loadeddata", reveal);

    // Safety net: if `loadeddata` never lands, show whatever we have rather than
    // sitting on the poster forever.
    const fallback = window.setTimeout(reveal, REVEAL_FALLBACK_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
      video.removeEventListener("loadeddata", reveal);
    };
  }, []);

  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden flex items-center justify-center bg-black">
      <link rel="preload" as="image" href={POSTER} fetchPriority="high" />
      {/* Warm the connection the video itself will use. */}
      <link rel="preconnect" href={`https://${STREAM_SUBDOMAIN}`} />

      {/* Static full-res poster — holds until the first frame is buffered. */}
      <img
        src={POSTER}
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${
          revealed ? "opacity-0" : "opacity-100"
        }`}
      />
      <video
        ref={videoRef}
        src={MP4_SRC}
        muted
        loop
        playsInline
        preload="auto"
        aria-label="Rose Hill Design Build showreel"
        className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${
          revealed ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/20" />

      <div className="relative z-10 flex flex-col items-center text-center text-white px-6 py-28 md:py-32 max-w-4xl">
        <p
          className="hero-fade-up text-xs sm:text-sm md:text-base uppercase tracking-[0.3em] mb-4 text-white/80"
          style={{ animationDelay: "0.2s" }}
        >
          Rose Hill Design Build
        </p>
        <h1 className="text-[2.5rem] leading-[1.05] sm:text-5xl md:text-7xl lg:text-8xl font-light tracking-tight">
          Leaders in Luxury
        </h1>
        <p
          className="hero-fade-up mt-4 flex items-center gap-3 text-sm md:text-lg uppercase tracking-[0.3em] text-white/80"
          style={{ animationDelay: "0.5s" }}
        >
          <span>CAN</span>
          <span className="block w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-gold flex-shrink-0" />
          <span>USA</span>
        </p>

        <div
          className="hero-fade-up mt-10"
          style={{ animationDelay: "0.7s" }}
        >
          <Link
            href="/contact"
            className="inline-flex items-center justify-center bg-gold text-dark px-10 py-3.5 text-sm uppercase tracking-widest font-medium hover:bg-gold-light transition-colors duration-300"
          >
            Connect With Us
          </Link>
        </div>
      </div>

      <div
        className="hero-fade absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2 text-white/70"
        style={{ animationDelay: "1.2s" }}
        aria-hidden="true"
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <span className="block w-px h-10 bg-white/40" />
      </div>
    </section>
  );
}
