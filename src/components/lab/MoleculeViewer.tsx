"use client";

import { useEffect, useRef, useState } from "react";
import type { Atom3D, TerpeneCompound } from "@/lib/compounds";

const ELEMENT_COLOR: Record<Atom3D["el"], string> = {
  C: "#E8EDF5",
  O: "#EF4444",
  N: "#3B82F6",
};
const ELEMENT_RADIUS: Record<Atom3D["el"], number> = { C: 14, O: 13, N: 13 };

/** Auto-rotating ball-and-stick viewer.
 *  - Pure SVG, no deps.
 *  - prefers-reduced-motion → static structure.
 *  - Mouse drag rotates Y; vertical drag rotates X. */
export function MoleculeViewer({ compound }: { compound: TerpeneCompound }) {
  const [theta, setTheta] = useState(0); // y-axis rotation
  const [phi, setPhi] = useState(-0.25); // x-axis rotation
  const [dragging, setDragging] = useState(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  // Auto-rotate unless user drags or prefers-reduced-motion
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setTheta((t) => (dragging ? t : t + dt * 0.45));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [dragging]);

  // Project atoms with a simple X→Y rotation pipeline + perspective.
  const W = 480;
  const H = 360;
  const scale = 38;
  const cx = W / 2;
  const cy = H / 2;

  const project = (a: Atom3D) => {
    // rotate around Y, then X
    const cT = Math.cos(theta), sT = Math.sin(theta);
    const cP = Math.cos(phi), sP = Math.sin(phi);
    const x = a.x * cT + a.z * sT;
    let z = -a.x * sT + a.z * cT;
    const y = a.y * cP - z * sP;
    z = a.y * sP + z * cP;
    const persp = 1 / (1 + z * 0.05);
    return {
      sx: cx + x * scale * persp,
      sy: cy - y * scale * persp,
      depth: z,
      r: (ELEMENT_RADIUS[a.el] || 12) * persp,
      el: a.el,
    };
  };

  const projected = compound.atoms.map(project);
  // Sort bonds by mean depth so far-side draws first
  const bondsWithDepth = compound.bonds
    .map((b) => ({ b, d: (projected[b[0]].depth + projected[b[1]].depth) / 2 }))
    .sort((a, b) => a.d - b.d);
  const atomsSorted = projected
    .map((p, i) => ({ p, i }))
    .sort((a, b) => a.p.depth - b.p.depth);

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    setDragging(true);
    lastRef.current = { x: e.clientX, y: e.clientY };
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging || !lastRef.current) return;
    const dx = e.clientX - lastRef.current.x;
    const dy = e.clientY - lastRef.current.y;
    setTheta((t) => t + dx * 0.012);
    setPhi((p) => Math.max(-1.2, Math.min(1.2, p + dy * 0.012)));
    lastRef.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = () => {
    setDragging(false);
    lastRef.current = null;
  };

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        className="bg-[#0A1628] cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerUp}
        aria-label={`Ball-and-stick representation of ${compound.name}`}
      >
        {/* schematic grid */}
        <defs>
          <pattern id="moleculeGrid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(13,148,136,0.08)" strokeWidth="1" />
          </pattern>
          <radialGradient id="atomGlow" cx="35%" cy="30%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#moleculeGrid)" />

        {/* corner brackets */}
        {[
          [10, 10, 1, 1],
          [W - 10, 10, -1, 1],
          [10, H - 10, 1, -1],
          [W - 10, H - 10, -1, -1],
        ].map(([x, y, dx, dy], i) => (
          <path
            key={i}
            d={`M ${x} ${y + 16 * dy} L ${x} ${y} L ${x + 16 * dx} ${y}`}
            stroke={compound.profileColor}
            strokeWidth="1.5"
            fill="none"
            opacity="0.6"
          />
        ))}

        {/* bonds (back to front) */}
        {bondsWithDepth.map(({ b }) => {
          const p1 = projected[b[0]];
          const p2 = projected[b[1]];
          const stroke = "#64748B";
          const opacity = 0.45 + Math.min(0.45, (p1.depth + p2.depth) / 12);
          if (b[2] === 2) {
            // Double bond — two parallel lines
            const dx = p2.sy - p1.sy;
            const dy = -(p2.sx - p1.sx);
            const len = Math.hypot(dx, dy) || 1;
            const ox = (dx / len) * 3;
            const oy = (dy / len) * 3;
            return (
              <g key={`${b[0]}-${b[1]}`}>
                <line x1={p1.sx + ox} y1={p1.sy + oy} x2={p2.sx + ox} y2={p2.sy + oy} stroke={stroke} strokeWidth="2.5" opacity={opacity} />
                <line x1={p1.sx - ox} y1={p1.sy - oy} x2={p2.sx - ox} y2={p2.sy - oy} stroke={stroke} strokeWidth="2.5" opacity={opacity} />
              </g>
            );
          }
          return (
            <line
              key={`${b[0]}-${b[1]}`}
              x1={p1.sx} y1={p1.sy} x2={p2.sx} y2={p2.sy}
              stroke={stroke}
              strokeWidth="3"
              opacity={opacity}
              strokeLinecap="round"
            />
          );
        })}

        {/* atoms (back to front) */}
        {atomsSorted.map(({ p, i }) => (
          <g key={i}>
            <circle cx={p.sx} cy={p.sy} r={p.r} fill={ELEMENT_COLOR[p.el] || "#fff"} stroke={compound.profileColor} strokeWidth="1.2" />
            <circle cx={p.sx} cy={p.sy} r={p.r} fill="url(#atomGlow)" />
            {p.el !== "C" && (
              <text x={p.sx} y={p.sy + 4} textAnchor="middle" fill="#0A1628" fontSize="11" fontFamily="var(--font-tf-mono), monospace" fontWeight="700">
                {p.el}
              </text>
            )}
          </g>
        ))}

        {/* HUD strings */}
        <text x="14" y={H - 18} fill={compound.profileColor} fontSize="10" fontFamily="var(--font-tf-mono), monospace" letterSpacing="2">
          {compound.formula} · MW {compound.mw}
        </text>
        <text x={W - 14} y={H - 18} textAnchor="end" fill="#64748B" fontSize="10" fontFamily="var(--font-tf-mono), monospace" letterSpacing="2">
          DRAG · ROTATE
        </text>
      </svg>
    </div>
  );
}
