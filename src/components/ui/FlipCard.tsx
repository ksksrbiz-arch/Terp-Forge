"use client";

import { useState, type ReactNode, type KeyboardEvent } from "react";

interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  /** Override flip trigger. Default: hover on fine pointers, click/tap on coarse. */
  trigger?: "hover" | "click" | "auto";
  className?: string;
  /** Outer aspect controlled by parent — FlipCard fills 100%/100%. */
  ariaLabel?: string;
}

/**
 * 3D-flip container.
 *
 * - `trigger="hover"`: only hover flips (CSS gates this to fine pointers).
 * - `trigger="click"`: only click/tap/keyboard flips.
 * - `trigger="auto"` (default): both. The hover transform is gated by a
 *   `(hover: hover) and (pointer: fine)` media query in globals.css, so touch
 *   devices fall through to the click handler — i.e. there is no sticky
 *   hover state on phones. Keyboard (Enter/Space) toggles in either mode.
 *
 * Both faces are stacked absolutely; parent must define a height.
 * `prefers-reduced-motion` is honored at the global level (transitions stripped),
 * so the flip becomes an instant face swap rather than a rotation.
 */
export default function FlipCard({
  front,
  back,
  trigger = "auto",
  className = "",
  ariaLabel,
}: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setFlipped((v) => !v);
    }
  };

  // For hover trigger we use CSS group-hover via data attr; click trigger uses React state.
  const useHover = trigger === "hover" || trigger === "auto";
  const useClick = trigger === "click" || trigger === "auto";

  return (
    <div
      className={`flip-card group relative h-full w-full ${className}`.trim()}
      data-flipped={flipped ? "true" : "false"}
      data-hover={useHover ? "true" : "false"}
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={ariaLabel}
      onKeyDown={onKey}
      onClick={useClick ? () => setFlipped((v) => !v) : undefined}
      style={{ perspective: "1200px" }}
    >
      <div
        className="flip-inner relative h-full w-full"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)",
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
    </div>
  );
}
