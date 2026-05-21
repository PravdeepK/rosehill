"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const STREAM_SUBDOMAIN = process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_SUBDOMAIN;
const VIDEO_UID = process.env.NEXT_PUBLIC_HERO_VIDEO_UID;

const HLS_SRC = `https://${STREAM_SUBDOMAIN}/${VIDEO_UID}/manifest/video.m3u8`;
const POSTER = `https://${STREAM_SUBDOMAIN}/${VIDEO_UID}/thumbnails/thumbnail.jpg?height=1080`;

// Keep the poster up until the video is decoding frames at least this tall, so
// visitors never see a low-bitrate HLS rendition. The fallback reveals whatever
// is playing after this long, so a slow connection can't freeze on the poster.
const FULL_QUALITY_HEIGHT = 1080;
const REVEAL_FALLBACK_MS = 8000;

// Pull the highest-bandwidth media playlist out of a Cloudflare Stream
// multivariant manifest. Pointing Safari's native player straight at it leaves
// only one rendition to choose, so it starts at full quality with no ramp-up.
async function topRenditionSrc(manifestUrl: string): Promise<string> {
  try {
    const text = await (await fetch(manifestUrl)).text();
    const lines = text.split("\n");
    let best = { bandwidth: -1, uri: "" };
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].startsWith("#EXT-X-STREAM-INF:")) continue;
      const bandwidth = Number(lines[i].match(/BANDWIDTH=(\d+)/)?.[1] ?? 0);
      const uri = lines[i + 1]?.trim();
      if (uri && bandwidth > best.bandwidth) best = { bandwidth, uri };
    }
    if (best.uri) return new URL(best.uri, manifestUrl).href;
  } catch {
    // fall through to the multivariant manifest
  }
  return manifestUrl;
}

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    const reveal = () => {
      if (!cancelled) setRevealed(true);
    };

    // Cross-fade in only once a full-quality frame is decoded.
    const revealIfSharp = () => {
      if (video.videoHeight >= FULL_QUALITY_HEIGHT) reveal();
    };
    video.addEventListener("loadeddata", revealIfSharp);
    video.addEventListener("canplay", revealIfSharp);
    video.addEventListener("playing", revealIfSharp);
    video.addEventListener("resize", revealIfSharp); // fires on rendition switch

    // Safety net: never leave the hero stuck on the static poster.
    const fallback = window.setTimeout(() => {
      if (video.readyState >= 2) reveal();
    }, REVEAL_FALLBACK_MS);

    let hls: import("hls.js").default | null = null;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari: play the top rendition's playlist directly — no ABR ramp-up.
      topRenditionSrc(HLS_SRC).then((src) => {
        if (!cancelled) video.src = src;
      });
    } else {
      import("hls.js").then(({ default: Hls }) => {
        if (cancelled || !Hls.isSupported()) return;
        hls = new Hls({ capLevelToPlayerSize: false });
        hls.loadSource(HLS_SRC);
        hls.attachMedia(video);
        // Pin to the highest rendition before the first segment loads.
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (!hls) return;
          const top = hls.levels.length - 1;
          hls.currentLevel = top;
          hls.loadLevel = top;
          hls.nextLevel = top;
        });
      });
    }

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
      video.removeEventListener("loadeddata", revealIfSharp);
      video.removeEventListener("canplay", revealIfSharp);
      video.removeEventListener("playing", revealIfSharp);
      video.removeEventListener("resize", revealIfSharp);
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
