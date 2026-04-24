"use client";

import { useEffect, useRef } from "react";

interface MolecularCanvasProps {
  /** Approximate node count at 1280px wide. Auto-scales by area. */
  density?: number;
  /** Maximum link distance in CSS pixels. */
  linkDistance?: number;
  /** Node color (hex). */
  nodeColor?: string;
  /** Link color (hex). Should be the same family as node for cohesion. */
  linkColor?: string;
  /** Highlight color used for a few "hot" nodes. */
  accentColor?: string;
  className?: string;
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hot: boolean;
}

/**
 * Animated molecular network drawn on a <canvas>.
 *
 * - Self-throttles via requestAnimationFrame and pauses when off-screen.
 * - Honors `prefers-reduced-motion`: renders a single static frame.
 * - Re-tunes node count on resize for consistent density across viewports.
 * - No external dependencies.
 */
export default function MolecularCanvas({
  density = 36,
  linkDistance = 140,
  nodeColor = "#0D9488",
  linkColor = "#0D9488",
  accentColor = "#C9A84C",
  className = "",
}: MolecularCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let nodes: Node[] = [];
    let raf = 0;
    let running = true;
    let dpr = Math.min(2, window.devicePixelRatio || 1);
    let cssW = 0;
    let cssH = 0;

    const seed = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      cssW = Math.max(1, Math.floor(rect.width));
      cssH = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const areaScale = (cssW * cssH) / (1280 * 720);
      const count = Math.max(
        14,
        Math.min(96, Math.round(density * Math.max(0.4, Math.min(2.2, areaScale)))),
      );
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * cssW,
        y: Math.random() * cssH,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: 1 + Math.random() * 1.6,
        hot: Math.random() < 0.12,
      }));
    };

    const hexToRgb = (hex: string) => {
      const m = hex.replace("#", "");
      const v = m.length === 3
        ? m.split("").map((c) => c + c).join("")
        : m;
      const n = parseInt(v, 16);
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    };
    const linkRgb = hexToRgb(linkColor);
    const nodeRgb = hexToRgb(nodeColor);
    const accentRgb = hexToRgb(accentColor);

    const draw = () => {
      ctx.clearRect(0, 0, cssW, cssH);

      // Links
      const ld2 = linkDistance * linkDistance;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < ld2) {
            const alpha = (1 - d2 / ld2) * 0.35;
            ctx.strokeStyle = `rgba(${linkRgb.r}, ${linkRgb.g}, ${linkRgb.b}, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      for (const n of nodes) {
        const rgb = n.hot ? accentRgb : nodeRgb;
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${n.hot ? 0.95 : 0.7})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
        if (n.hot) {
          ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + 4, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    };

    const step = () => {
      if (!running) return;
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > cssW) {
          n.vx *= -1;
          n.x = Math.max(0, Math.min(cssW, n.x));
        }
        if (n.y < 0 || n.y > cssH) {
          n.vy *= -1;
          n.y = Math.max(0, Math.min(cssH, n.y));
        }
      }
      draw();
      raf = requestAnimationFrame(step);
    };

    const start = () => {
      if (reduced) {
        seed();
        draw();
        return;
      }
      running = true;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(step);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    seed();
    start();

    const onResize = () => {
      seed();
      if (reduced) draw();
    };
    window.addEventListener("resize", onResize, { passive: true });

    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined" && !reduced) {
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) start();
            else stop();
          }
        },
        { threshold: 0 },
      );
      io.observe(canvas);
    }

    const onVis = () => {
      if (document.hidden) stop();
      else if (!reduced) start();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stop();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      io?.disconnect();
    };
  }, [density, linkDistance, nodeColor, linkColor, accentColor]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`block w-full h-full ${className}`.trim()}
    />
  );
}
