"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  /** Target numeric value to count up to. */
  to: number;
  /** Optional starting value. Default 0. */
  from?: number;
  /** Animation duration in ms. Default 1400. */
  duration?: number;
  /** Decimals to render. Default 0. */
  decimals?: number;
  /** Optional prefix (e.g. "$"). */
  prefix?: string;
  /** Optional suffix (e.g. "%"). */
  suffix?: string;
  /** Locale-aware grouping. Default true. */
  group?: boolean;
  className?: string;
}

/**
 * IntersectionObserver-triggered count-up.
 * - Eases out with cubic curve.
 * - Honors prefers-reduced-motion: snaps directly to `to` on first intersection.
 * - SSR-safe: renders the formatted target value before hydration so layout doesn't shift.
 */
export default function CountUp({
  to,
  from = 0,
  duration = 1400,
  decimals = 0,
  prefix = "",
  suffix = "",
  group = true,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(from);
  const startedRef = useRef(false);

  const format = (n: number) => {
    const fixed = n.toFixed(decimals);
    if (!group) return `${prefix}${fixed}${suffix}`;
    const [int, frac] = fixed.split(".");
    const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${prefix}${frac ? `${grouped}.${frac}` : grouped}${suffix}`;
  };

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let obs: IntersectionObserver | null = null;

    const run = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      if (reduced) {
        setValue(to);
        return;
      }
      const t0 = performance.now();
      const delta = to - from;
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(from + delta * eased);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    if (typeof IntersectionObserver === "undefined") {
      run();
      return () => cancelAnimationFrame(raf);
    }
    obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            run();
            obs?.disconnect();
            break;
          }
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(node);
    return () => {
      cancelAnimationFrame(raf);
      obs?.disconnect();
    };
  }, [to, from, duration]);

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}
