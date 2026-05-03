"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export type HeroSlide = {
  id: number;
  pill: string;
  headline: string;
  sub: string;
  imageUrl: string;
};

const SLIDES: HeroSlide[] = [
  { id: 1, pill: "MECHVI • DARK PREMIUM", headline: "Buy smart. Drive confident.", sub: "Mechanic-level verdicts, explained in plain English — Australia MVP.", imageUrl: "/hero/1.jpg" },
  { id: 2, pill: "PRE-PURCHASE INTEL", headline: "Know the car before you buy.", sub: "Red flags, running costs, and what to check — in seconds.", imageUrl: "/hero/2.jpg" },
  { id: 3, pill: "NO MORE SURPRISES", headline: "Skip the regret purchases.", sub: "MechVi highlights what sellers don’t mention — fast.", imageUrl: "/hero/3.jpg" },
  { id: 4, pill: "MAINTENANCE MADE SIMPLE", headline: "Keep it reliable.", sub: "Driving style + usage = a plan that actually fits your life.", imageUrl: "/hero/4.jpg" },
  { id: 5, pill: "BUILT BY A REAL MECHANIC", headline: "Workshop logic. AI speed.", sub: "Real world checks, scaled for every car you consider.", imageUrl: "/hero/5.jpg" },
];

export default function HeroCarousel({
  intervalMs = 7800,
  onSlide,
}: {
  intervalMs?: number;
  onSlide?: (slide: HeroSlide, index: number) => void;
}) {
  const [index, setIndex] = useState(0);

  // ✅ Call parent ONLY when index changes (safe)
  useEffect(() => {
    onSlide?.(SLIDES[index], index);
  }, [index, onSlide]);

  // ✅ Interval only updates index (no parent setState inside updater)
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  const current = SLIDES[index];
  const prevIndex = useMemo(() => (index - 1 + SLIDES.length) % SLIDES.length, [index]);
  const prev = SLIDES[prevIndex];

  return (
    <div className="mechvi-hero-root">
      {/* Prev image (behind) */}
      <Image
        src={prev.imageUrl}
        alt={prev.headline}
        fill
        priority
        sizes="100vw"
        className="mechvi-hero-img"
        style={{
          filter: "brightness(0.72) saturate(1.10) contrast(1.06)",
        }}
      />

      {/* Current image (fade on top) */}
      <div style={{ position: "absolute", inset: 0, animation: "mechviFadeIn 900ms ease forwards" }}>
        <Image
          src={current.imageUrl}
          alt={current.headline}
          fill
          priority
          sizes="100vw"
          className="mechvi-hero-img"
          style={{
            filter: "brightness(0.74) saturate(1.15) contrast(1.08)",
          }}
        />
      </div>

      <div className="mechvi-hero-overlay" />

      <div className="mechvi-hero-vignette" />

      {/* Film grain (very subtle) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='260'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='260' height='260' filter='url(%23n)' opacity='.22'/%3E%3C/svg%3E\")",
          opacity: 0.18,
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      />

      <style>{`
        @keyframes mechviFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
