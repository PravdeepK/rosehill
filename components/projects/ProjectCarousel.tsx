"use client";

import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { projects } from "@/lib/data";

export default function ProjectCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);

    const interval = setInterval(() => emblaApi.scrollNext(), 5000);

    return () => {
      clearInterval(interval);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {projects.map((project) => (
            <div
              key={project.id}
              className="relative flex-[0_0_100%] min-w-0 aspect-[3/2] md:aspect-[16/7]"
            >
              <Image
                src={project.image}
                alt={project.name}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12">
                <p className="text-[10px] uppercase tracking-widest text-gold mb-2">
                  {project.category}
                </p>
                <h3 className="font-display text-white text-2xl md:text-3xl">
                  {project.name}
                </h3>
                <p className="text-white/70 text-sm mt-2">
                  {project.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors text-white cursor-pointer"
        aria-label="Previous slide"
      >
        &#8592;
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors text-white cursor-pointer"
        aria-label="Next slide"
      >
        &#8594;
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
        {projects.map((_, i) => (
          <button
            key={i}
            className={`w-6 h-6 flex items-center justify-center cursor-pointer`}
            onClick={() => emblaApi?.scrollTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          >
            <span className={`w-2 h-2 rounded-full transition-colors ${
              i === selectedIndex ? "bg-gold" : "bg-white/40"
            }`} />
          </button>
        ))}
      </div>
    </div>
  );
}
