"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { markHeroReady } from "@/lib/heroReady";

const STREAM_SUBDOMAIN = process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_SUBDOMAIN;
const VIDEO_UID = process.env.NEXT_PUBLIC_HERO_VIDEO_UID;

const HLS_SRC = `https://${STREAM_SUBDOMAIN}/${VIDEO_UID}/manifest/video.m3u8`;
const POSTER = `https://${STREAM_SUBDOMAIN}/${VIDEO_UID}/thumbnails/thumbnail.jpg?height=1080`;

// Adaptive streaming starts on a low rendition and ramps up. To never show that
// 720→1080 ramp, we hold the full-resolution poster (a sharp still) until the
// stream has actually reached its top rendition, then cross-fade straight to
// full quality. This keeps the reveal crisp on every load — the first visit
// (behind the intro splash) and any later refresh (behind the poster) alike. The
// same moment also clears the splash via markHeroReady.
const FULL_QUALITY_HEIGHT = 1080;
// If the top rendition never arrives (slow link), reveal whatever's buffered
// after this long rather than sitting on the poster forever.
const REVEAL_FALLBACK_MS = 8000;

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;

    // Cross-fade poster→video and clear the splash together, the moment full
    // quality is live — so the quality ramp is never on screen.
    const revealAtFullQuality = () => {
      if (cancelled) return;
      setRevealed(true);
      markHeroReady();
    };
    const onProgress = () => {
      if (video.videoHeight >= FULL_QUALITY_HEIGHT) revealAtFullQuality();
    };
    video.addEventListener("loadeddata", onProgress);
    video.addEventListener("canplay", onProgress);
    video.addEventListener("playing", onProgress);
    video.addEventListener("resize", onProgress); // fires on rendition switch

    // Safety net: don't sit on the poster forever on a slow connection.
    const fallback = window.setTimeout(() => {
      if (video.readyState >= 2) revealAtFullQuality();
    }, REVEAL_FALLBACK_MS);

    let hls: import("hls.js").default | null = null;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari: let the native player run ABR off the multivariant manifest.
      video.src = HLS_SRC;
    } else {
      import("hls.js").then(({ default: Hls }) => {
        if (cancelled || !Hls.isSupported()) return;
        // Default config keeps ABR on: fast low-rendition start, ramps to 1080p.
        hls = new Hls();
        hls.loadSource(HLS_SRC);
        hls.attachMedia(video);
        // ABR reaching the highest level is the definitive "full quality" cue —
        // more reliable than pixel height across renditions.
        hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
          if (!cancelled && hls && data.level >= hls.levels.length - 1) {
            revealAtFullQuality();
          }
        });
      });
    }

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
      video.removeEventListener("loadeddata", onProgress);
      video.removeEventListener("canplay", onProgress);
      video.removeEventListener("playing", onProgress);
      video.removeEventListener("resize", onProgress);
      hls?.destroy();
    };
  }, []);

  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden flex items-center justify-center bg-black">
      <link rel="preload" as="image" href={POSTER} fetchPriority="high" />

      {/* Static full-res poster — holds until the video is playing at full quality. */}
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
        autoPlay
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
