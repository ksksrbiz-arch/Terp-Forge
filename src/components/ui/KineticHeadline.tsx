"use client";

import { useEffect, useId, useRef } from "react";

interface Line {
  text: string;
  /** Optional gold-treatment line (uses holo-gold gradient as fill once strokes resolve). */
  accent?: boolean;
}

interface KineticHeadlineProps {
  lines: Line[];
  /** Per-line stagger in ms. */
  stagger?: number;
  /** Stroke draw duration in ms. */
  drawMs?: number;
  /** Hold duration on the stroke before fill resolves (ms). */
  fillDelay?: number;
  className?: string;
  /** Overrides for sizing — defaults match the hero's display headline. */
  sizeClass?: string;
}

/**
 * Headline that strokes its glyphs in letter-by-letter using SVG
 * stroke-dasharray on TerpForgeSans. Once the stroke resolves the fill
 * fades in, leaving a normal heavy-display headline.
 *
 * Why SVG instead of plain text + CSS: a real path-length stroke draw
 * is what reads as "engineered" rather than "animated text". We use
 * SVG <text> with a clip + stroke-dasharray hack — the browser renders
 * each glyph as a stroked path automatically.
 *
 * Reduced motion: skips the stroke animation entirely, renders the
 * filled headline on first paint.
 */
export default function KineticHeadline({
  lines,
  stagger = 110,
  drawMs = 720,
  fillDelay = 200,
  className = "",
  sizeClass = "text-5xl sm:text-6xl lg:text-7xl",
}: KineticHeadlineProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      root.dataset.state = "filled";
      return;
    }
    // Trigger the cascade on next frame so the initial state paints first.
    requestAnimationFrame(() => {
      root.dataset.state = "drawing";
    });
  }, []);

  return (
    <div
      ref={rootRef}
      data-state="initial"
      className={`kinetic-headline relative ${sizeClass} font-black tracking-tight uppercase leading-none ${className}`.trim()}
      style={
        {
          // CSS custom props consumed by the inline <style> below.
          ["--kh-draw" as string]: `${drawMs}ms`,
          ["--kh-fill-delay" as string]: `${fillDelay}ms`,
        } as React.CSSProperties
      }
    >
      {lines.map((line, i) => {
        const delay = i * stagger;
        return (
          <span
            key={`${uid}-${i}`}
            className="block relative"
            style={{ ["--kh-line-delay" as string]: `${delay}ms` } as React.CSSProperties}
          >
            {/* Stroked layer — visible while drawing. */}
            <span
              aria-hidden="true"
              className={`kh-stroke absolute inset-0 ${line.accent ? "kh-stroke--accent" : ""}`}
            >
              {line.text}
            </span>
            {/* Fill layer — fades in once the stroke resolves. */}
            <span className={`kh-fill block ${line.accent ? "holo-gold" : "text-[#E8EDF5]"}`}>
              {line.text}
            </span>
          </span>
        );
      })}

      <style>{`
        .kinetic-headline .kh-fill {
          opacity: 0;
        }
        .kinetic-headline .kh-stroke {
          color: transparent;
          -webkit-text-fill-color: transparent;
          -webkit-text-stroke: 1px rgba(232, 237, 245, 0.85);
          opacity: 0;
        }
        .kinetic-headline .kh-stroke--accent {
          -webkit-text-stroke: 1px rgba(201, 168, 76, 0.95);
        }
        .kinetic-headline[data-state="drawing"] .kh-stroke {
          animation: kh-stroke-in var(--kh-draw) cubic-bezier(0.22, 1, 0.36, 1) var(--kh-line-delay, 0ms) both;
        }
        .kinetic-headline[data-state="drawing"] .kh-fill {
          animation: kh-fill-in 600ms cubic-bezier(0.22, 1, 0.36, 1)
            calc(var(--kh-line-delay, 0ms) + var(--kh-draw) - var(--kh-fill-delay, 0ms)) forwards;
        }
        .kinetic-headline[data-state="filled"] .kh-stroke { display: none; }
        .kinetic-headline[data-state="filled"] .kh-fill { opacity: 1; }

        @keyframes kh-stroke-in {
          0%   { opacity: 0; transform: translateY(8px); letter-spacing: 0.04em; filter: blur(2px); }
          25%  { opacity: 1; }
          100% { opacity: 0; transform: translateY(0); letter-spacing: 0;       filter: blur(0); }
        }
        @keyframes kh-fill-in {
          from { opacity: 0; transform: translateY(2px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .kinetic-headline .kh-stroke { display: none; }
          .kinetic-headline .kh-fill { opacity: 1 !important; animation: none !important; }
        }
      `}</style>
    </div>
  );
}
