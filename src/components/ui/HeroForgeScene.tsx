"use client";

import { useEffect, useRef } from "react";
import { terpenes } from "@/lib/compounds";

/**
 * Industrial-foundry hero scene.
 *
 * Scope: pure 2D canvas, no three.js, no shaders. The "WebGL look" is built
 * from layered compositing — depth-sorted ball-and-stick molecules pulled
 * from the real `compounds.ts` geometry, additive teal rim lights, gold
 * volumetric shafts cast through animated fog particles, and a slow camera
 * orbit driven by mouse parallax + scroll dolly.
 *
 * Performance: pauses RAF when offscreen (IntersectionObserver) and on
 * tab hidden (visibilitychange). Honors prefers-reduced-motion → renders
 * a single static frame and exits.
 *
 * Design intent: should read as "machine readout of a working foundry",
 * not "hero animation". Cool-side teal cryo glow on atoms, warm-side gold
 * sodium-lamp shafts cutting through ambient haze.
 */
export default function HeroForgeScene({
  className = "",
}: {
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── Scene composition: pick five structurally varied compounds and
    // place them across the frame at different depths and rotations.
    type Placement = {
      slug: string;
      // canvas-relative position (0..1, x/y) and depth (smaller = farther)
      tx: number;
      ty: number;
      depth: number;
      // base rotation rates around y / x axes
      ry: number;
      rx: number;
      // initial phase
      py: number;
      px: number;
      // local scale multiplier
      scale: number;
    };
    const placements: Placement[] = [
      { slug: "limonene", tx: 0.62, ty: 0.46, depth: 1.0, ry: 0.18, rx: 0.04, py: 0.0, px: 0.2, scale: 1.0 },
      { slug: "myrcene", tx: 0.18, ty: 0.32, depth: 0.7, ry: 0.13, rx: 0.06, py: 1.4, px: 0.5, scale: 0.62 },
      { slug: "linalool", tx: 0.82, ty: 0.78, depth: 0.55, ry: 0.22, rx: 0.03, py: 2.1, px: -0.3, scale: 0.48 },
      { slug: "pinene", tx: 0.30, ty: 0.78, depth: 0.45, ry: 0.10, rx: 0.05, py: 0.6, px: 0.1, scale: 0.42 },
      { slug: "caryophyllene", tx: 0.92, ty: 0.20, depth: 0.35, ry: 0.16, rx: 0.04, py: 3.0, px: -0.2, scale: 0.36 },
    ];
    const compounds = placements
      .map((p) => ({ p, c: terpenes.find((t) => t.slug === p.slug)! }))
      .filter((x) => x.c);

    // ── Fog particles: low-alpha drifting motes that read as ambient haze.
    type Mote = { x: number; y: number; vx: number; vy: number; r: number; a: number };
    let motes: Mote[] = [];

    let raf = 0;
    let running = true;
    let dpr = Math.min(2, window.devicePixelRatio || 1);
    let cssW = 0;
    let cssH = 0;
    let mouseX = 0; // -1..1
    let mouseY = 0;
    let scrollT = 0; // 0..1 dolly progress (1 = fully scrolled past)
    const t0 = performance.now();

    const seed = () => {
      const rect = container.getBoundingClientRect();
      cssW = Math.max(1, Math.floor(rect.width));
      cssH = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const motesCount = Math.round(40 * Math.min(1.6, Math.max(0.6, (cssW * cssH) / (1280 * 720))));
      motes = Array.from({ length: motesCount }, () => ({
        x: Math.random() * cssW,
        y: Math.random() * cssH,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -0.04 - Math.random() * 0.08,
        r: 30 + Math.random() * 90,
        a: 0.02 + Math.random() * 0.05,
      }));
    };

    // 3D rotation pipeline (Y → X) with perspective. Used per-molecule.
    type Atom3D = { el: "C" | "O" | "N"; x: number; y: number; z: number };
    const project = (
      a: Atom3D,
      cT: number,
      sT: number,
      cP: number,
      sP: number,
      cx: number,
      cy: number,
      sc: number,
    ) => {
      const x = a.x * cT + a.z * sT;
      let z = -a.x * sT + a.z * cT;
      const y = a.y * cP - z * sP;
      z = a.y * sP + z * cP;
      const persp = 1 / (1 + z * 0.045);
      return {
        sx: cx + x * sc * persp,
        sy: cy - y * sc * persp,
        depth: z,
        r: persp,
        el: a.el,
      };
    };

    const drawMolecule = (
      placement: Placement,
      atoms: Atom3D[],
      bonds: [number, number, 1 | 2][],
      profileColor: string,
      time: number,
    ) => {
      // Camera = mouse parallax (2–3°) baked into the rotation.
      const parallaxY = mouseX * 0.06;
      const parallaxX = mouseY * 0.04;
      const theta = placement.py + time * placement.ry + parallaxY;
      const phi = placement.px + time * placement.rx + parallaxX;
      const cT = Math.cos(theta);
      const sT = Math.sin(theta);
      const cP = Math.cos(phi);
      const sP = Math.sin(phi);

      // Dolly: as user scrolls, push the primary (depth=1) molecule forward
      // and fade peripherals out.
      const dollyZ = placement.depth === 1.0 ? 1 + scrollT * 1.6 : 1 - scrollT * 0.6;
      const opacity = placement.depth === 1.0 ? 1 - scrollT * 0.85 : Math.max(0, 1 - scrollT * 1.3);
      if (opacity <= 0.01) return;

      const cx = placement.tx * cssW;
      const cy = placement.ty * cssH;
      const baseScale = 38 * placement.scale * placement.depth * dollyZ;

      // Project all atoms once.
      const projected = atoms.map((a) => project(a, cT, sT, cP, sP, cx, cy, baseScale));

      // Sort bonds back-to-front by mean depth.
      const bondsSorted = bonds
        .map((b, i) => ({ b, i, d: (projected[b[0]].depth + projected[b[1]].depth) / 2 }))
        .sort((a, b) => a.d - b.d);

      ctx.save();
      ctx.globalAlpha = opacity;

      // Draw bonds — mid-grey with depth-modulated alpha. Double bonds get
      // a parallel offset line so π electrons read.
      for (const { b } of bondsSorted) {
        const p1 = projected[b[0]];
        const p2 = projected[b[1]];
        const a = 0.30 + Math.min(0.45, (p1.depth + p2.depth) / 12);
        const w = 1.6 * Math.min(p1.r, p2.r);
        if (b[2] === 2) {
          const dx = p2.sy - p1.sy;
          const dy = -(p2.sx - p1.sx);
          const len = Math.hypot(dx, dy) || 1;
          const ox = (dx / len) * 2.4 * Math.min(p1.r, p2.r);
          const oy = (dy / len) * 2.4 * Math.min(p1.r, p2.r);
          ctx.strokeStyle = `rgba(168, 184, 196, ${a})`;
          ctx.lineWidth = w;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(p1.sx + ox, p1.sy + oy);
          ctx.lineTo(p2.sx + ox, p2.sy + oy);
          ctx.moveTo(p1.sx - ox, p1.sy - oy);
          ctx.lineTo(p2.sx - ox, p2.sy - oy);
          ctx.stroke();
        } else {
          ctx.strokeStyle = `rgba(168, 184, 196, ${a})`;
          ctx.lineWidth = w;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);
          ctx.stroke();
        }
      }

      // Draw atoms — back-to-front. Each atom = sphere body + rim cryo glow.
      const atomsSorted = projected
        .map((p, i) => ({ p, i }))
        .sort((a, b) => a.p.depth - b.p.depth);

      for (const { p } of atomsSorted) {
        const baseR = (p.el === "O" ? 7 : p.el === "N" ? 6.5 : 7) * p.r * placement.scale * placement.depth * dollyZ;
        if (baseR < 0.6) continue;
        const fillCore = p.el === "O" ? "#FF8C8C" : p.el === "N" ? "#7FB3FF" : "#E8EDF5";
        // Soft outer rim — additive teal cryo glow.
        const rim = ctx.createRadialGradient(p.sx, p.sy, baseR * 0.6, p.sx, p.sy, baseR * 3.2);
        rim.addColorStop(0, "rgba(20, 184, 166, 0.45)");
        rim.addColorStop(1, "rgba(20, 184, 166, 0)");
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = rim;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, baseR * 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";

        // Sphere body — radial highlight up-left for the sodium-lamp side.
        const body = ctx.createRadialGradient(
          p.sx - baseR * 0.5,
          p.sy - baseR * 0.5,
          baseR * 0.15,
          p.sx,
          p.sy,
          baseR * 1.05,
        );
        body.addColorStop(0, "#FFFFFF");
        body.addColorStop(0.35, fillCore);
        body.addColorStop(1, "#0A1628");
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, baseR, 0, Math.PI * 2);
        ctx.fill();
        // Profile-color outline (very thin) — anchors the molecule to its compound.
        ctx.strokeStyle = profileColor;
        ctx.globalAlpha = opacity * 0.4;
        ctx.lineWidth = 0.6;
        ctx.stroke();
        ctx.globalAlpha = opacity;
      }

      ctx.restore();
    };

    const drawFog = (time: number) => {
      // Drifting haze motes with low alpha. Additive blend gives the
      // "lit smoke" feel without doing volumetric raymarching.
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (const m of motes) {
        m.x += m.vx;
        m.y += m.vy;
        if (m.x < -200) m.x = cssW + 50;
        if (m.x > cssW + 200) m.x = -50;
        if (m.y < -200) m.y = cssH + 50;
        const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r);
        g.addColorStop(0, `rgba(60, 90, 120, ${m.a * 1.4})`);
        g.addColorStop(1, "rgba(10, 22, 40, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      // Off-screen gold sodium-lamp shafts — animated translation simulates
      // the lamp swaying / particles drifting across the beam.
      const shaftPhase = (time * 0.04) % 1;
      const shaft = (cxPos: number, angle: number, hue: string, intensity: number) => {
        ctx.save();
        ctx.translate(cxPos, -50);
        ctx.rotate(angle);
        const grad = ctx.createLinearGradient(0, 0, 0, cssH * 1.4);
        grad.addColorStop(0, `${hue}, ${0.18 * intensity})`);
        grad.addColorStop(0.45, `${hue}, ${0.08 * intensity})`);
        grad.addColorStop(1, `${hue}, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(-180, 0, 360, cssH * 1.4);
        ctx.restore();
      };
      shaft(cssW * (0.18 + shaftPhase * 0.04), 0.18, "rgba(201, 168, 76", 1.0);
      shaft(cssW * (0.78 - shaftPhase * 0.03), -0.22, "rgba(201, 168, 76", 0.8);
      shaft(cssW * 0.5, 0.05, "rgba(13, 148, 136", 0.55);
      ctx.restore();
    };

    const drawScanGate = () => {
      // Subtle horizontal teal sweep that crosses the canvas slowly,
      // reinforcing the "machine readout" vibe.
      const t = ((performance.now() - t0) % 9000) / 9000;
      const y = t * cssH * 1.1 - cssH * 0.05;
      const grad = ctx.createLinearGradient(0, y - 4, 0, y + 4);
      grad.addColorStop(0, "rgba(13, 148, 136, 0)");
      grad.addColorStop(0.5, "rgba(20, 184, 166, 0.25)");
      grad.addColorStop(1, "rgba(13, 148, 136, 0)");
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = grad;
      ctx.fillRect(0, y - 4, cssW, 8);
      ctx.restore();
    };

    const draw = () => {
      const now = performance.now();
      const time = (now - t0) / 1000;

      // Backdrop: navy gradient with subtle diagonal lighting bias.
      const bg = ctx.createLinearGradient(0, 0, cssW, cssH);
      bg.addColorStop(0, "#0A1628");
      bg.addColorStop(0.6, "#0D1F3D");
      bg.addColorStop(1, "#070F1E");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, cssW, cssH);

      drawFog(time);

      // Sort molecules by depth so the closest one renders last.
      const sorted = [...compounds].sort((a, b) => a.p.depth - b.p.depth);
      for (const { p, c } of sorted) {
        drawMolecule(p, c.atoms, c.bonds, c.profileColor, time);
      }

      drawScanGate();
    };

    const step = () => {
      if (!running) return;
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

    const onPointer = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    if (!reduced) {
      window.addEventListener("pointermove", onPointer, { passive: true });
    }

    const onScroll = () => {
      const rect = container.getBoundingClientRect();
      // Once the hero's bottom rises above the viewport top, scrollT = 1.
      // Smooth between 0 (in-frame) and 1 (scrolled past).
      const out = Math.min(1, Math.max(0, 1 - rect.bottom / rect.height));
      scrollT = out;
    };
    if (!reduced) {
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

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
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
      io?.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`.trim()}>
      <canvas ref={canvasRef} aria-hidden="true" className="block w-full h-full" />
    </div>
  );
}
