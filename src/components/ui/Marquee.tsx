import type { ReactNode } from "react";

interface MarqueeProps {
  children: ReactNode;
  /** Duration of one full loop in seconds. Defaults to 42. */
  durationSeconds?: number;
  className?: string;
  /** Number of times to repeat the children for seamless looping. Defaults to 2. */
  repeat?: number;
}

/**
 * Pure-CSS infinite ticker. Children are repeated `repeat` times within a track
 * that is translated -100% over `durationSeconds`. Honors prefers-reduced-motion
 * via the global animation kill-switch.
 */
export default function Marquee({
  children,
  durationSeconds = 42,
  className = "",
  repeat = 2,
}: MarqueeProps) {
  const tracks = Array.from({ length: Math.max(2, repeat) });
  return (
    <div
      className={`marquee ${className}`.trim()}
      style={{ ["--marquee-duration" as string]: `${durationSeconds}s` }}
      aria-hidden="true"
    >
      {tracks.map((_, i) => (
        <div key={i} className="marquee__track">
          {children}
        </div>
      ))}
    </div>
  );
}
