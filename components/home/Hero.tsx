"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80"
        alt="Luxury retail interior"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xs md:text-sm uppercase tracking-[0.3em] mb-4 text-white/80"
        >
          Rose Hill Design Build
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight"
        >
          Leaders in Luxury Retail
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8"
        >
          <Link
            href="/projects"
            className="inline-block border border-white/60 px-8 py-3 text-sm uppercase tracking-widest hover:bg-white hover:text-dark transition-all duration-300"
          >
            View Our Work
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
