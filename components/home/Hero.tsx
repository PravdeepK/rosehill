import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden flex items-center justify-center">
      {/* Preload the LCP image per breakpoint so the browser can start
          fetching it in parallel with the CSS. React 19 hoists <link>
          elements rendered in JSX to <head>. */}
      <link
        rel="preload"
        as="image"
        media="(max-width: 768px)"
        href="/images/hero-mobile.webp"
        imageSrcSet="/images/hero-mobile.webp 620w, /images/hero-mobile-2x.webp 1240w"
        imageSizes="100vw"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        media="(min-width: 769px)"
        href="/images/hero-desktop.webp"
        imageSrcSet="/images/hero-desktop.webp 1600w, /images/hero-desktop-2x.webp 2400w"
        imageSizes="100vw"
        fetchPriority="high"
      />

      {/* Art-directed hero image. Mobile uses a 1:2 portrait WebP that
          matches the 412×823 viewport (so Lighthouse's image-aspect-ratio
          and image-size-responsive audits pass) and is small enough to
          ship without delaying LCP. Desktop uses a 3:2 landscape WebP. */}
      <picture>
        <source
          type="image/webp"
          media="(max-width: 768px)"
          srcSet="/images/hero-mobile.webp 620w, /images/hero-mobile-2x.webp 1240w"
          sizes="100vw"
        />
        <source
          type="image/webp"
          srcSet="/images/hero-desktop.webp 1600w, /images/hero-desktop-2x.webp 2400w"
          sizes="100vw"
        />
        <img
          src="/images/hero-desktop.webp"
          alt="Guerlain Spa lobby at Hotel X — interior designed and built by Rose Hill"
          width={1600}
          height={1067}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </picture>

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
