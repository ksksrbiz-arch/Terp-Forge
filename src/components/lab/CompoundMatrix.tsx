"use client";

import { useState } from "react";
import { terpenes, type TerpeneCompound } from "@/lib/compounds";

/** Periodic-table-style grid of TerpForge's compound library.
 *  Each cell shows symbol + atomic-number style header, formula footer,
 *  with a mini structural sketch revealed on hover/focus. */
export function CompoundMatrix({
  onSelect,
  activeSlug,
}: {
  onSelect: (c: TerpeneCompound) => void;
  activeSlug?: string;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
      {terpenes.map((c) => {
        const isActive = c.slug === activeSlug;
        const isHover = hovered === c.slug;
        return (
          <button
            type="button"
            key={c.slug}
            onClick={() => onSelect(c)}
            onMouseEnter={() => setHovered(c.slug)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(c.slug)}
            onBlur={() => setHovered(null)}
            aria-pressed={isActive}
            className="group relative aspect-square overflow-hidden border bg-[#0A1628] transition-all duration-300 text-left"
            style={{
              borderColor: isActive ? c.profileColor : `${c.profileColor}30`,
              boxShadow: isActive
                ? `0 0 24px ${c.profileColor}55, inset 0 0 30px ${c.profileColor}15`
                : isHover
                ? `0 0 16px ${c.profileColor}33`
                : undefined,
            }}
          >
            {/* atomic-number style header */}
            <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
              <span
                className="text-[9px] font-mono tracking-widest"
                style={{ color: c.profileColor }}
              >
                {String(c.atomicNumber).padStart(2, "0")}
              </span>
              <span
                className="text-[8px] font-mono tracking-widest opacity-80"
                style={{ color: c.profileColor }}
              >
                {c.profile}
              </span>
            </div>

            {/* big symbol */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p
                className="text-3xl sm:text-4xl font-black uppercase tracking-tight transition-transform duration-500 group-hover:-translate-y-1"
                style={{ fontFamily: "var(--font-montserrat)", color: "#E8EDF5" }}
              >
                {c.symbol}
              </p>
              <p
                className="text-[10px] font-mono mt-1 transition-opacity duration-500"
                style={{ color: c.profileColor, opacity: isHover || isActive ? 1 : 0.7 }}
              >
                {c.formula}
              </p>
            </div>

            {/* mini structural sketch — reveal on hover/focus */}
            <svg
              viewBox="-3 -3 6 6"
              className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-500"
              style={{ opacity: isHover || isActive ? 0.45 : 0 }}
            >
              {c.bonds.map((b, i) => {
                const a = c.atoms[b[0]];
                const z = c.atoms[b[1]];
                if (!a || !z) return null;
                return (
                  <line
                    key={i}
                    x1={a.x * 0.3}
                    y1={-a.y * 0.3}
                    x2={z.x * 0.3}
                    y2={-z.y * 0.3}
                    stroke={c.profileColor}
                    strokeWidth={b[2] === 2 ? 0.06 : 0.04}
                    opacity="0.9"
                  />
                );
              })}
              {c.atoms.map((a, i) => (
                <circle
                  key={i}
                  cx={a.x * 0.3}
                  cy={-a.y * 0.3}
                  r={a.el === "C" ? 0.07 : 0.09}
                  fill={a.el === "O" ? "#EF4444" : a.el === "N" ? "#3B82F6" : c.profileColor}
                />
              ))}
            </svg>

            {/* footer */}
            <div
              className="absolute bottom-2 left-2 right-2 flex justify-between text-[8px] font-mono tracking-widest"
              style={{ color: `${c.profileColor}aa` }}
            >
              <span>{c.symbol.toUpperCase()}</span>
              <span>{c.bp.split(" ")[0]}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
