"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

const STREAM_SUBDOMAIN = process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_SUBDOMAIN;
const VIDEO_UID = process.env.NEXT_PUBLIC_HERO_VIDEO_UID;

const HLS_SRC = `https://${STREAM_SUBDOMAIN}/${VIDEO_UID}/manifest/video.m3u8`;
const POSTER = `https://${STREAM_SUBDOMAIN}/${VIDEO_UID}/thumbnails/thumbnail.jpg?height=1080`;

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Safari plays HLS natively at the best level its bandwidth estimate allows.
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = HLS_SRC;
      return;
    }

    let hls: import("hls.js").default | null = null;
    let cancelled = false;

    import("hls.js").then(({ default: Hls }) => {
      if (cancelled || !Hls.isSupported()) return;
      hls = new Hls({ capLevelToPlayerSize: false });
      hls.loadSource(HLS_SRC);
      hls.attachMedia(video);
      // Pin to the highest rendition the moment we know what's available — no ABR ramp-up.
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (!hls) return;
        const top = hls.levels.length - 1;
        hls.currentLevel = top;
        hls.loadLevel = top;
        hls.nextLevel = top;
      });
    });

    return () => {
      cancelled = true;
      hls?.destroy();
    };
  }, []);

  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden flex items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={POSTER}
        aria-label="Rose Hill Design Build showreel"
        className="absolute inset-0 w-full h-full object-cover object-center"
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
            Get In Touch
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
