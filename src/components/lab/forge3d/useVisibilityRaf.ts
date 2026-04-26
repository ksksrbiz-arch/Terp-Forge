/**
 * forge3d/useVisibilityRaf — visibility-aware requestAnimationFrame loop.
 *
 * Pauses the loop when:
 *   - the canvas is scrolled out of view (IntersectionObserver), or
 *   - the tab is hidden (document.visibilitychange).
 *
 * Critical on mobile: a hidden WebGL canvas otherwise keeps draining
 * battery / GPU. Same pattern that ships in `PlantForge3D`.
 *
 * Usage:
 *
 *   useVisibilityRaf(mountRef, (dt, now) => {
 *     // animate + render here
 *   }, { enabled: !reduceMotion });
 */

import { useEffect, useRef } from "react";

export interface UseVisibilityRafOptions {
  /** If false, the loop never starts (e.g., reduced-motion). */
  enabled?: boolean;
  /** Clamp dt to avoid huge jumps after tab-resume. Default 50ms. */
  maxDt?: number;
}

export type RafTick = (dtSeconds: number, now: number) => void;

export function useVisibilityRaf(
  mountRef: React.RefObject<HTMLElement | null>,
  tick: RafTick,
  options: UseVisibilityRafOptions = {},
): void {
  const { enabled = true, maxDt = 0.05 } = options;
  // Keep latest tick in a ref so callers can pass an inline function
  // without restarting the loop on every render.
  const tickRef = useRef<RafTick>(tick);
  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !enabled) return;

    let raf = 0;
    let last = performance.now();
    let running = false;
    let onScreen = true;
    let tabVisible =
      typeof document === "undefined" || !document.hidden;

    const loop = (now: number) => {
      const dt = Math.min(maxDt, (now - last) / 1000);
      last = now;
      tickRef.current(dt, now);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running) return;
      if (!onScreen || !tabVisible) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e) return;
        onScreen = e.isIntersecting;
        if (onScreen) start();
        else stop();
      },
      { threshold: 0.01 },
    );
    io.observe(mount);

    const onVis = () => {
      tabVisible = !document.hidden;
      if (tabVisible) start();
      else stop();
    };
    document.addEventListener("visibilitychange", onVis);

    start();

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
    // mountRef is stable; tick uses tickRef so doesn't need to retrigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, maxDt]);
}
