"use client";

import { useEffect, useRef, useState, type ReactNode, type KeyboardEvent } from "react";

interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  /** Override flip trigger. Default: hover on fine pointers, click/tap on coarse. */
  trigger?: "hover" | "click" | "auto";
  className?: string;
  ariaLabel?: string;
  /**
   * Choreographed mode. Adds a 1.2s sequence — tilt forward, schematic
   * sweep, brackets bloom — before the flip itself, plus a typed reveal
   * on the back face. On `prefers-reduced-motion` the sequence collapses
   * to an instant face swap. Defaults to `true`.
   */
  cinematic?: boolean;
}

type Phase = "rest" | "tilt" | "sweep" | "flipping" | "flipped";

/**
 * Choreographed 3D-flip container.
 *
 * Phases (cinematic mode, hover/click triggered):
 *  0ms     rest     →  hover begins
 *  0–280   tilt     →  card rotates 12° forward, brackets bloom outward
 *  280–820 sweep    →  schematic-redraw scan line crosses the front face
 *  820–1200 flipping → 3D rotateY to back
 *  1200+   flipped  →  back face reveal; spec rows type-on at 40ms/char
 *
 * The CSS hooks driven via `data-phase` on the card and `--card-tilt`
 * custom prop are what the brief asks for — sites and inner content can
 * style themselves off the phase without coordinating timers.
 */
export default function FlipCard({
  front,
  back,
  trigger = "auto",
  className = "",
  ariaLabel,
  cinematic = true,
}: FlipCardProps) {
  const [phase, setPhase] = useState<Phase>("rest");
  const [hovering, setHovering] = useState(false);
  const timersRef = useRef<number[]>([]);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  const runSequenceTo = (target: "flipped" | "rest") => {
    clearTimers();
    if (!cinematic || reducedRef.current) {
      setPhase(target === "flipped" ? "flipped" : "rest");
      return;
    }
    if (target === "flipped") {
      setPhase("tilt");
      timersRef.current.push(
        window.setTimeout(() => setPhase("sweep"), 280),
        window.setTimeout(() => setPhase("flipping"), 820),
        window.setTimeout(() => setPhase("flipped"), 1200),
      );
    } else {
      setPhase("flipping");
      timersRef.current.push(window.setTimeout(() => setPhase("rest"), 380));
    }
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      runSequenceTo(phase === "flipped" ? "rest" : "flipped");
    }
  };

  const useHover = trigger === "hover" || trigger === "auto";
  const useClick = trigger === "click" || trigger === "auto";

  const onMouseEnter = () => {
    if (!useHover) return;
    setHovering(true);
    if (phase !== "flipped") runSequenceTo("flipped");
  };
  const onMouseLeave = () => {
    if (!useHover) return;
    setHovering(false);
    if (phase !== "rest") runSequenceTo("rest");
  };

  const onClick = () => {
    if (!useClick) return;
    runSequenceTo(phase === "flipped" ? "rest" : "flipped");
  };

  const isFlipped = phase === "flipping" || phase === "flipped";
  const tiltDeg = phase === "tilt" || phase === "sweep" ? 12 : 0;

  return (
    <div
      className={`flip-card group relative h-full w-full ${className}`.trim()}
      data-phase={phase}
      data-flipped={isFlipped ? "true" : "false"}
      data-hover={useHover ? "true" : "false"}
      data-cinematic={cinematic ? "true" : "false"}
      role="button"
      tabIndex={0}
      aria-pressed={isFlipped}
      aria-label={ariaLabel}
      onKeyDown={onKey}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={
        {
          perspective: "1400px",
          ["--card-tilt" as string]: `${tiltDeg}deg`,
        } as React.CSSProperties
      }
    >
      <div
        className="flip-inner relative h-full w-full"
        style={{
          transformStyle: "preserve-3d",
          transition: cinematic
            ? "transform 380ms cubic-bezier(0.22, 1, 0.36, 1)"
            : "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)",
          transform: isFlipped
            ? `rotateY(180deg) rotateX(calc(var(--card-tilt) * -1))`
            : `rotateX(var(--card-tilt))`,
        }}
      >
        <div
          className="flip-face flip-front absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {front}
          {/* Cinematic-mode-only: schematic redraw sweep + bracket bloom.
              Both stay invisible at rest and animate on phase change. */}
          {cinematic && (
            <>
              <div aria-hidden className="flip-sweep pointer-events-none absolute inset-0" />
              <div aria-hidden className="flip-bracket-bloom pointer-events-none absolute inset-0" />
            </>
          )}
        </div>
        <div
          className="flip-face flip-back absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {back}
        </div>
      </div>
      {/* Ambient hover halo — fades in during tilt phase */}
      {cinematic && hovering && (
        <div aria-hidden className="flip-halo pointer-events-none absolute -inset-2" />
      )}
    </div>
  );
}
