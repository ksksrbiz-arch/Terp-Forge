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

    // ── Forge sparks: warm flickering embers rising from the foundry floor.
    // Drawn additively so they bloom against the navy backdrop. Each spark
    // has a finite life so the field never feels static.
    type Spark = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number; // 0..1 (1 = newborn)
      decay: number; // per-frame life decrement
      r: number; // base radius
      hueShift: number; // 0=gold, 1=ember-orange
    };
    let sparks: Spark[] = [];
    const spawnSpark = (): Spark => ({
      x: Math.random() * cssW,
      y: cssH + Math.random() * 12,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -(0.35 + Math.random() * 0.55),
      life: 1,
      decay: 0.0035 + Math.random() * 0.004,
      r: 0.8 + Math.random() * 1.6,
      hueShift: Math.random(),
    });

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

      const sparkCount = Math.round(
        36 * Math.min(1.6, Math.max(0.6, (cssW * cssH) / (1280 * 720))),
      );
      sparks = Array.from({ length: sparkCount }, () => {
        const s = spawnSpark();
        // Pre-warm: distribute sparks across their lifetime so the field
        // is fully populated on the very first frame.
        s.life = Math.random();
        s.y = cssH - Math.random() * cssH * 0.55;
        return s;
      });
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

    const drawBlueprintFloor = (time: number) => {
      // Perspective grid receding to a vanishing point on the horizon.
      // Reads as a "foundry floor schematic" beneath the molecules.
      const horizon = cssH * 0.62;
      const vpX = cssW * 0.5;
      const floorH = cssH - horizon;
      if (floorH <= 0) return;

      ctx.save();

      // Soft horizon haze band — gives the floor a hot edge.
      const hazeGrad = ctx.createLinearGradient(0, horizon - 18, 0, horizon + 60);
      hazeGrad.addColorStop(0, "rgba(201, 168, 76, 0)");
      hazeGrad.addColorStop(0.45, "rgba(201, 168, 76, 0.10)");
      hazeGrad.addColorStop(1, "rgba(201, 168, 76, 0)");
      ctx.fillStyle = hazeGrad;
      ctx.fillRect(0, horizon - 18, cssW, 80);

      // Radial vignette of the floor toward the vanishing point — keeps
      // the grid feeling deep rather than flat.
      const floorVig = ctx.createRadialGradient(
        vpX,
        horizon,
        0,
        vpX,
        horizon,
        Math.max(cssW, floorH) * 0.9,
      );
      floorVig.addColorStop(0, "rgba(13, 148, 136, 0.10)");
      floorVig.addColorStop(0.6, "rgba(13, 148, 136, 0)");
      ctx.fillStyle = floorVig;
      ctx.fillRect(0, horizon, cssW, floorH);

      ctx.lineCap = "round";

      // Receding lines — fanning out from the vanishing point.
      const radials = 18;
      for (let i = -radials; i <= radials; i++) {
        const t = i / radials; // -1..1
        const xEnd = vpX + t * cssW * 1.4;
        const a = 0.05 + (1 - Math.abs(t)) * 0.12;
        ctx.strokeStyle = `rgba(13, 148, 136, ${a.toFixed(3)})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(vpX, horizon);
        ctx.lineTo(xEnd, cssH + 4);
        ctx.stroke();
      }

      // Horizontal "tracks" — closer rows are brighter and farther apart.
      // Slow inward drift sells the camera dolly.
      const drift = (time * 0.06) % 1;
      const rows = 9;
      for (let i = 0; i < rows; i++) {
        const k = (i + drift) / rows; // 0..1 (0 = at horizon)
        // Cubic ease pushes lines toward the bottom for perspective feel.
        const eased = k * k * k;
        const y = horizon + eased * floorH;
        const a = 0.05 + (1 - k) * 0.18;
        ctx.strokeStyle = `rgba(13, 148, 136, ${a.toFixed(3)})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(cssW, y);
        ctx.stroke();
      }

      // Crisp horizon line with a teal-to-gold gradient — the "forge edge".
      const horiz = ctx.createLinearGradient(0, 0, cssW, 0);
      horiz.addColorStop(0, "rgba(13, 148, 136, 0)");
      horiz.addColorStop(0.35, "rgba(13, 148, 136, 0.55)");
      horiz.addColorStop(0.5, "rgba(201, 168, 76, 0.65)");
      horiz.addColorStop(0.65, "rgba(13, 148, 136, 0.55)");
      horiz.addColorStop(1, "rgba(13, 148, 136, 0)");
      ctx.strokeStyle = horiz;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, horizon);
      ctx.lineTo(cssW, horizon);
      ctx.stroke();

      ctx.restore();
    };

    const drawSparks = () => {
      // Update and render forge sparks. Additive blend, warm hues.
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (const s of sparks) {
        s.life -= s.decay;
        s.x += s.vx;
        s.y += s.vy;
        s.vy -= 0.0025; // mild buoyancy — sparks accelerate as they cool
        s.vx += (Math.random() - 0.5) * 0.04; // jitter for flicker

        if (s.life <= 0 || s.y < cssH * 0.15) {
          Object.assign(s, spawnSpark());
          continue;
        }

        const flicker = 0.7 + Math.random() * 0.3;
        const alpha = s.life * 0.85 * flicker;
        const r = s.r * (0.6 + s.life * 0.6);
        // Blend gold (warm) → ember-orange based on per-spark hueShift.
        const baseR = 255;
        const baseG = Math.round(180 - s.hueShift * 60);
        const baseB = Math.round(110 - s.hueShift * 80);

        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * 6);
        g.addColorStop(0, `rgba(${baseR}, ${baseG}, ${baseB}, ${(alpha * 0.95).toFixed(3)})`);
        g.addColorStop(0.35, `rgba(${baseR}, ${baseG}, ${baseB}, ${(alpha * 0.25).toFixed(3)})`);
        g.addColorStop(1, `rgba(${baseR}, ${baseG}, ${baseB}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r * 6, 0, Math.PI * 2);
        ctx.fill();

        // Hot core
        ctx.fillStyle = `rgba(255, 240, 200, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, Math.max(0.4, r * 0.6), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const drawReticle = (time: number) => {
      // HUD reticle / data ring locked to the primary molecule. Reads as
      // "the foundry is actively measuring this compound".
      const primary = compounds.find((x) => x.p.depth === 1.0);
      if (!primary) return;
      // Fade out as the user dollies past the hero.
      const fade = Math.max(0, 1 - scrollT * 1.4);
      if (fade < 0.02) return;

      const cx = primary.p.tx * cssW + mouseX * 6;
      const cy = primary.p.ty * cssH + mouseY * 4;
      const baseR = Math.min(cssW, cssH) * 0.18;

      ctx.save();

      // Outer pulsing ring (gold, dashed).
      const pulse = 0.5 + 0.5 * Math.sin(time * 1.6);
      ctx.globalAlpha = (0.35 + pulse * 0.25) * fade;
      ctx.strokeStyle = "#C9A84C";
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Inner steady ring (teal, solid hairline).
      ctx.globalAlpha = 0.45 * fade;
      ctx.strokeStyle = "#0D9488";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(cx, cy, baseR * 0.78, 0, Math.PI * 2);
      ctx.stroke();

      // Tick marks every 30°.
      ctx.globalAlpha = 0.55 * fade;
      ctx.strokeStyle = "#C9A84C";
      ctx.lineWidth = 1;
      for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI) / 6;
        const inner = baseR + 4;
        const outer = i % 3 === 0 ? baseR + 14 : baseR + 8;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
        ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
        ctx.stroke();
      }

      // Sweeping radial scan — a thin teal wedge that orbits the ring.
      const sweepA = (time * 0.9) % (Math.PI * 2);
      const wedge = ctx.createConicGradient
        ? ctx.createConicGradient(sweepA, cx, cy)
        : null;
      if (wedge) {
        wedge.addColorStop(0, "rgba(20, 184, 166, 0.55)");
        wedge.addColorStop(0.05, "rgba(20, 184, 166, 0.0)");
        wedge.addColorStop(1, "rgba(20, 184, 166, 0)");
        ctx.globalAlpha = 0.7 * fade;
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = wedge;
        ctx.beginPath();
        ctx.arc(cx, cy, baseR + 2, 0, Math.PI * 2);
        ctx.arc(cx, cy, Math.max(2, baseR * 0.55), 0, Math.PI * 2, true);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
      }

      // Crosshair tick marks at N/S/E/W.
      ctx.globalAlpha = 0.6 * fade;
      ctx.strokeStyle = "#E8EDF5";
      ctx.lineWidth = 0.8;
      const ch = baseR + 22;
      ctx.beginPath();
      ctx.moveTo(cx - ch, cy); ctx.lineTo(cx - ch + 10, cy);
      ctx.moveTo(cx + ch, cy); ctx.lineTo(cx + ch - 10, cy);
      ctx.moveTo(cx, cy - ch); ctx.lineTo(cx, cy - ch + 10);
      ctx.moveTo(cx, cy + ch); ctx.lineTo(cx, cy + ch - 10);
      ctx.stroke();

      // Coordinate readout (top-right of ring).
      ctx.globalAlpha = 0.75 * fade;
      ctx.fillStyle = "#C9A84C";
      ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "left";
      const tx = cx + baseR * 0.72;
      const ty = cy - baseR * 0.78;
      ctx.fillText("// LOCK 0247-A", tx, ty);
      ctx.fillStyle = "#0D9488";
      ctx.fillText(
        `θ ${(((sweepA * 180) / Math.PI) | 0).toString().padStart(3, "0")}°`,
        tx,
        ty + 12,
      );

      ctx.restore();
    };

    const drawLensFlare = () => {
      // Soft warm bloom behind the primary molecule — "forge fire" through
      // the schematic. Additive, very low alpha, large radius.
      const primary = compounds.find((x) => x.p.depth === 1.0);
      if (!primary) return;
      const fade = Math.max(0, 1 - scrollT * 1.2);
      if (fade < 0.02) return;
      const cx = primary.p.tx * cssW;
      const cy = primary.p.ty * cssH;
      const r = Math.min(cssW, cssH) * 0.55;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, `rgba(201, 168, 76, ${(0.18 * fade).toFixed(3)})`);
      g.addColorStop(0.25, `rgba(201, 168, 76, ${(0.08 * fade).toFixed(3)})`);
      g.addColorStop(1, "rgba(201, 168, 76, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawCursorCaustic = () => {
      // Cursor-following gold caustic — only when the pointer is engaged.
      if (mouseX === 0 && mouseY === 0) return;
      const cx = (mouseX * 0.5 + 0.5) * cssW;
      const cy = (mouseY * 0.5 + 0.5) * cssH;
      const r = Math.min(cssW, cssH) * 0.22;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, "rgba(255, 220, 140, 0.10)");
      g.addColorStop(0.5, "rgba(201, 168, 76, 0.04)");
      g.addColorStop(1, "rgba(201, 168, 76, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
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

      // Foundry floor — perspective grid receding to the horizon. Sits
      // under the haze so fog and shafts blend into it.
      drawBlueprintFloor(time);

      drawFog(time);

      // Soft warm bloom behind the primary molecule — sells the "forge"
      // metaphor through the molecular schematic.
      drawLensFlare();

      // Sort molecules by depth so the closest one renders last.
      const sorted = [...compounds].sort((a, b) => a.p.depth - b.p.depth);
      for (const { p, c } of sorted) {
        drawMolecule(p, c.atoms, c.bonds, c.profileColor, time);
      }

      // HUD elements above the molecules.
      drawReticle(time);
      drawCursorCaustic();
      drawSparks();
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
