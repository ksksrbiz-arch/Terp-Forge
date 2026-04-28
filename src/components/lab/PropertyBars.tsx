"use client";

import { useEffect, useRef, useState } from "react";
import type { TerpeneCompound } from "@/lib/compounds";

const ROWS: { key: keyof TerpeneCompound["bars"]; label: string; unit: string }[] = [
  { key: "potency", label: "Potency", unit: "PCT" },
  { key: "volatility", label: "Volatility", unit: "VAP" },
  { key: "polarity", label: "Polarity", unit: "POL" },
  { key: "abundance", label: "Abundance", unit: "ABD" },
];

/** Animated property bars. Bars start at 0% and fill in once the section
 *  scrolls into view. They re-animate any time `compound.slug` changes
 *  (the keyed wrapper unmounts and remounts the inner row). */
export function PropertyBars({ compound }: { compound: TerpeneCompound }) {
  return (
    <div className="space-y-3" key={compound.slug}>
      {ROWS.map((row) => (
        <PropertyRow
          key={row.key}
          row={row}
          value={compound.bars[row.key]}
          color={compound.profileColor}
        />
      ))}
    </div>
  );
}

function PropertyRow({
  row,
  value,
  color,
}: {
  row: (typeof ROWS)[number];
  value: number;
  color: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [seen, setSeen] = useState(false);
  // Animated numeric readout that counts up from 0 to `value` once visible.
  // Re-runs whenever value changes (e.g., user picks a different compound).
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setSeen(true)),
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!seen) return;
    // Honor reduced-motion: snap straight to the final value.
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduce ? 0 : 1100;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      // easeOutCubic — matches the 1.1s ease-out bar fill timing.
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, value]);

  return (
    <div ref={ref} className="grid grid-cols-[110px_1fr_50px] items-center gap-3">
      <p className="text-[10px] font-mono tracking-[0.25em] uppercase" style={{ color }}>
        {row.label}
      </p>
      <div className="relative h-2 bg-[#0A1628] border border-[#1E293B] overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 transition-[width] ease-out"
          style={{
            width: seen ? `${value}%` : "0%",
            background: `linear-gradient(90deg, ${color}40, ${color})`,
            boxShadow: `0 0 12px ${color}66`,
            transitionDuration: "1100ms",
          }}
        />
        {/* Sweeping highlight that rides the leading edge of the bar */}
        {seen && (
          <div
            aria-hidden
            className="absolute inset-y-0 w-12 pointer-events-none"
            style={{
              left: `calc(${value}% - 3rem)`,
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 60%, rgba(255,255,255,0) 100%)",
              transition: "left 1100ms ease-out",
              mixBlendMode: "screen",
            }}
          />
        )}
        <div className="absolute inset-0 flex justify-between pointer-events-none opacity-30">
          {Array.from({ length: 11 }).map((_, i) => (
            <span
              key={i}
              className="block w-px h-full"
              style={{ background: i % 5 === 0 ? color : "#64748B" }}
            />
          ))}
        </div>
      </div>
      <p className="text-right text-[11px] font-mono text-[#E8EDF5] tabular-nums">
        {Math.round(displayed)}
        <span className="text-[#64748B] text-[9px] ml-1">{row.unit}</span>
      </p>
    </div>
  );
}
