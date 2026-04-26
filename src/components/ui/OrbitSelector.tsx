"use client";

import Link from "next/link";
import { useState } from "react";

export interface OrbitTerpene {
  name: string;
  formula: string;
  profile: string;
  effect: string;
  accent: string;
  /** Optional short label shown on the orbit node. Defaults to first letter. */
  symbol?: string;
}

interface OrbitSelectorProps {
  terpenes: OrbitTerpene[];
  /** Optional ctaHref for the "View Molecular Data →" link inside the central panel */
  ctaHref?: string;
  /** Optional CSS to override default sizing. */
  className?: string;
}

/**
 * Interactive Terpene Orbit Selector.
 * - Outer ring slowly auto-rotates (CSS); each child counter-rotates to stay upright.
 * - Click a node to inspect its data in the central hex panel.
 * - Hover a node to preview its accent on the connecting line.
 * - prefers-reduced-motion is honored globally (animation kill-switch).
 *
 * The component is purely CSS + SVG + a tiny piece of state — no canvas.
 */
export default function OrbitSelector({
  terpenes,
  ctaHref = "/lab",
  className = "",
}: OrbitSelectorProps) {
  const safe = terpenes.length > 0 ? terpenes : [];
  const [activeIdx, setActiveIdx] = useState(0);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (safe.length === 0) return null;

  const focusIdx = hoverIdx ?? activeIdx;
  const active = safe[focusIdx] ?? safe[0];
  const count = safe.length;

  return (
    <div
      className={`relative mx-auto w-full max-w-[640px] aspect-square ${className}`.trim()}
    >
      {/* Decorative concentric rings */}
      <svg
        viewBox="-100 -100 200 200"
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      >
        <circle cx="0" cy="0" r="92" fill="none" stroke="rgba(201,168,76,0.10)" strokeDasharray="2 4" />
        <circle cx="0" cy="0" r="74" fill="none" stroke="rgba(13,148,136,0.18)" />
        <circle cx="0" cy="0" r="42" fill="none" stroke="rgba(201,168,76,0.20)" />
        {/* Crosshair ticks */}
        {[0, 90, 180, 270].map((a) => (
          <line
            key={a}
            x1={Math.cos((a * Math.PI) / 180) * 88}
            y1={Math.sin((a * Math.PI) / 180) * 88}
            x2={Math.cos((a * Math.PI) / 180) * 96}
            y2={Math.sin((a * Math.PI) / 180) * 96}
            stroke="rgba(201,168,76,0.4)"
            strokeWidth="0.6"
          />
        ))}
        {/* Connecting lines from center to each node — highlight active */}
        {safe.map((t, i) => {
          const a = (i / count) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(a) * 74;
          const y = Math.sin(a) * 74;
          const isActive = i === focusIdx;
          return (
            <line
              key={`spoke-${i}`}
              x1="0"
              y1="0"
              x2={x.toFixed(3)}
              y2={y.toFixed(3)}
              stroke={isActive ? t.accent : "rgba(13,148,136,0.25)"}
              strokeWidth={isActive ? 0.8 : 0.4}
              strokeDasharray={isActive ? "0" : "1.5 1.5"}
              style={{ transition: "stroke 300ms ease" }}
            />
          );
        })}
      </svg>

      {/* Rotating ring of nodes */}
      <div
        className="absolute inset-0 hex-rotate"
        style={{ animationDuration: "60s" }}
      >
        {safe.map((t, i) => {
          const angleDeg = (i / count) * 360 - 90;
          const isActive = i === activeIdx;
          const isHover = i === hoverIdx;
          const symbol = t.symbol ?? t.name.charAt(0);
          return (
            <button
              key={t.name}
              type="button"
              aria-label={`Inspect ${t.name}`}
              aria-pressed={isActive}
              onClick={() => setActiveIdx(i)}
              onPointerEnter={() => setHoverIdx(i)}
              onPointerLeave={() => setHoverIdx(null)}
              onFocus={() => setHoverIdx(i)}
              onBlur={() => setHoverIdx(null)}
              className="absolute left-1/2 top-1/2 group"
              style={{
                // Place each node on the ring (74% radius), then keep it upright
                // by reversing the parent rotation on the inner element.
                transform: `translate(-50%, -50%) rotate(${angleDeg}deg) translate(37%) rotate(${-angleDeg}deg)`,
              }}
            >
              <span
                className="hex-rotate inline-block"
                style={{
                  animationDuration: "60s",
                  animationDirection: "reverse",
                }}
              >
                <span
                  className="relative inline-flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 transition-all duration-300"
                  style={{
                    transform: `scale(${isActive ? 1.08 : isHover ? 1.04 : 1})`,
                  }}
                >
                  <svg
                    viewBox="0 0 80 80"
                    className="absolute inset-0 w-full h-full"
                    aria-hidden="true"
                  >
                    <polygon
                      points="40,4 73,22 73,58 40,76 7,58 7,22"
                      fill="rgba(10,22,40,0.92)"
                      stroke={isActive || isHover ? t.accent : "rgba(201,168,76,0.4)"}
                      strokeWidth={isActive ? 1.6 : 1}
                      style={{ transition: "stroke 300ms ease, stroke-width 300ms ease" }}
                    />
                    <polygon
                      points="40,12 65,26 65,54 40,68 15,54 15,26"
                      fill="none"
                      stroke={isActive || isHover ? `${t.accent}` : "rgba(13,148,136,0.3)"}
                      strokeWidth="0.6"
                      strokeOpacity={isActive ? 0.9 : 0.5}
                      style={{ transition: "stroke 300ms ease" }}
                    />
                  </svg>
                  <span
                    className="relative text-base sm:text-lg font-black font-mono tracking-wider"
                    style={{
                      color: isActive || isHover ? t.accent : "#E8EDF5",
                      transition: "color 300ms ease",
                    }}
                  >
                    {symbol}
                  </span>
                  <span
                    className="relative text-[9px] sm:text-[10px] font-mono tracking-widest uppercase mt-0.5"
                    style={{ color: isActive || isHover ? t.accent : "#64748B" }}
                  >
                    {t.profile}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Central hex — inspector panel */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[58%] aspect-square pointer-events-none">
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full"
          aria-hidden="true"
        >
          <polygon
            points="50,4 91,27 91,73 50,96 9,73 9,27"
            fill="rgba(10,22,40,0.95)"
            stroke={active.accent}
            strokeOpacity="0.7"
            strokeWidth="0.8"
          />
          <polygon
            points="50,10 86,30 86,70 50,90 14,70 14,30"
            fill="none"
            stroke="rgba(201,168,76,0.15)"
            strokeWidth="0.5"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-auto">
          <p
            className="text-[10px] font-mono tracking-[0.4em] uppercase mb-2"
            style={{ color: active.accent }}
          >
            PROFILE: {active.profile}
          </p>
          <h3
            className="text-2xl sm:text-3xl font-black uppercase text-[#E8EDF5] mb-1"
          >
            {active.name}
          </h3>
          <p
            className="text-xs font-mono tracking-wider mb-3"
            style={{ color: active.accent }}
          >
            {active.formula}
          </p>
          <p className="text-[#94A3B8] text-xs sm:text-sm font-mono leading-relaxed mb-4 max-w-[28ch]">
            {active.effect}
          </p>
          <Link
            href={ctaHref}
            className="text-[10px] sm:text-xs font-mono tracking-[0.3em] uppercase border-b transition-colors"
            style={{ color: active.accent, borderColor: `${active.accent}80` }}
          >
            View Molecular Data →
          </Link>
        </div>
      </div>

      {/* Live region for screen readers */}
      <p className="sr-only" aria-live="polite">
        Selected terpene: {active.name}, profile {active.profile}.
      </p>
    </div>
  );
}
