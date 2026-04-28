"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Atom3D, Bond, TerpeneCompound } from "@/lib/compounds";

const ELEMENT_COLOR: Record<Atom3D["el"], string> = {
  C: "#E8EDF5",
  O: "#EF4444",
  N: "#3B82F6",
};
const ELEMENT_NAME: Record<Atom3D["el"], string> = {
  C: "Carbon",
  O: "Oxygen",
  N: "Nitrogen",
};
const ELEMENT_RADIUS: Record<Atom3D["el"], number> = { C: 14, O: 13, N: 13 };

const W = 480;
const H = 380;
const FLOOR_Y = -2.4;
const FLOOR_EXTENT = 3.6;
const FLOOR_DIVISIONS = 6;
const MIN_SCALE = 22;
const MAX_SCALE = 70;
const FRICTION = 0.93;
const VELOCITY_EPSILON = 0.04; // rad/s — below this, momentum yields to idle drift
const IDLE_SPIN = 0.32; // rad/s when nothing else is happening
const DRAG_THRESHOLD = 4;

const clampPhi = (p: number) => Math.max(-1.2, Math.min(1.2, p));

type Projected = { sx: number; sy: number; depth: number; persp: number };

/** Ball-and-stick blueprint viewer with momentum, wheel-zoom, atom pinning,
 *  a projected shadow floor, and a live bond/atom inspector.
 *
 *  - Pure SVG, no deps. Honors prefers-reduced-motion (no idle spin, no
 *    momentum overshoot).
 *  - Drag rotates θ (around Y) and φ (around X) with release momentum.
 *  - Wheel/pinch-equivalent zoom inside the canvas only (page scroll is
 *    suppressed while pointer is over the viewer).
 *  - Click an atom to pin it; the inspector panel locks to that atom and
 *    its neighbors. Hovering a bond previews it.
 */
export function MoleculeViewer({ compound }: { compound: TerpeneCompound }) {
  const [theta, setTheta] = useState(0);
  const [phi, setPhi] = useState(-0.25);
  const [scale, setScale] = useState(38);
  const [pinned, setPinned] = useState<number | null>(null);
  const [hoverBond, setHoverBond] = useState<number | null>(null);
  // Track the slug we last rendered against so we can reset selection state
  // when the parent swaps compounds. This is the React-recommended pattern
  // for "reset state on prop change" — adjusting state during render avoids
  // the cascading-renders warning fired by react-hooks/set-state-in-effect.
  const [prevSlug, setPrevSlug] = useState(compound.slug);
  if (prevSlug !== compound.slug) {
    setPrevSlug(compound.slug);
    setPinned(null);
    setHoverBond(null);
  }

  const draggingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const downRef = useRef<{ x: number; y: number } | null>(null);
  const velocityRef = useRef({ theta: 0, phi: 0 });
  const rafRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  // Single RAF loop driving momentum-decayed drift + idle auto-spin.
  useEffect(() => {
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!draggingRef.current) {
        const v = velocityRef.current;
        const vmag = Math.hypot(v.theta, v.phi);
        if (vmag > VELOCITY_EPSILON) {
          setTheta((t) => t + v.theta * dt);
          setPhi((p) => clampPhi(p + v.phi * dt));
          const decay = Math.pow(FRICTION, dt * 60);
          velocityRef.current = {
            theta: v.theta * decay,
            phi: v.phi * decay,
          };
        } else if (!reducedMotionRef.current && pinned === null) {
          setTheta((t) => t + dt * IDLE_SPIN);
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [pinned]);

  // Wheel zoom must be non-passive so we can keep the page from scrolling
  // while the user is dollying through the viewer.
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.92 : 1.08;
      setScale((s) => Math.max(MIN_SCALE, Math.min(MAX_SCALE, s * factor)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // ── Projection pipeline ────────────────────────────────────────────────
  const cx = W / 2;
  const cy = H / 2 - 28; // lift the molecule so the shadow floor has room
  const cT = Math.cos(theta);
  const sT = Math.sin(theta);
  const cP = Math.cos(phi);
  const sP = Math.sin(phi);

  const project = (x: number, y: number, z: number): Projected => {
    const x1 = x * cT + z * sT;
    let z1 = -x * sT + z * cT;
    const y1 = y * cP - z1 * sP;
    z1 = y * sP + z1 * cP;
    const persp = 1 / (1 + z1 * 0.05);
    return {
      sx: cx + x1 * scale * persp,
      sy: cy - y1 * scale * persp,
      depth: z1,
      persp,
    };
  };

  const projected = compound.atoms.map((a) => {
    const p = project(a.x, a.y, a.z);
    return {
      ...p,
      r: (ELEMENT_RADIUS[a.el] ?? 12) * p.persp,
      el: a.el,
    };
  });

  // Atoms projected onto the blueprint floor plane (y = FLOOR_Y).
  const shadows = compound.atoms.map((a) => {
    const p = project(a.x, FLOOR_Y, a.z);
    const lift = a.y - FLOOR_Y;
    return {
      ...p,
      r: (ELEMENT_RADIUS[a.el] ?? 12) * 0.55 * p.persp,
      // Higher atoms cast softer shadows.
      opacity: Math.max(0.08, 0.32 - lift * 0.04),
    };
  });

  // Floor grid lines: a square mesh at FLOOR_Y. Project both endpoints once
  // per render and depth-sort so far cells draw first.
  const floorLines = useMemo(() => {
    const lines: Array<[number, number, number, number]> = [];
    const step = (FLOOR_EXTENT * 2) / FLOOR_DIVISIONS;
    for (let i = 0; i <= FLOOR_DIVISIONS; i++) {
      const v = -FLOOR_EXTENT + i * step;
      lines.push([-FLOOR_EXTENT, v, FLOOR_EXTENT, v]);
      lines.push([v, -FLOOR_EXTENT, v, FLOOR_EXTENT]);
    }
    return lines;
  }, []);

  const projectedFloor = floorLines
    .map(([x1, z1, x2, z2]) => {
      const p1 = project(x1, FLOOR_Y, z1);
      const p2 = project(x2, FLOOR_Y, z2);
      return { p1, p2, d: (p1.depth + p2.depth) / 2 };
    })
    .sort((a, b) => a.d - b.d);

  const bondsWithDepth = compound.bonds
    .map((b, idx) => ({
      b,
      idx,
      d: (projected[b[0]].depth + projected[b[1]].depth) / 2,
    }))
    .sort((a, b) => a.d - b.d);

  const atomsSorted = projected
    .map((p, i) => ({ p, i }))
    .sort((a, b) => a.p.depth - b.p.depth);

  // ── Pointer interaction ────────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    draggingRef.current = true;
    velocityRef.current = { theta: 0, phi: 0 };
    lastRef.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    downRef.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingRef.current || !lastRef.current) return;
    const now = performance.now();
    const dt = Math.max(0.008, (now - lastRef.current.t) / 1000);
    const dx = e.clientX - lastRef.current.x;
    const dy = e.clientY - lastRef.current.y;
    const dTheta = dx * 0.012;
    const dPhi = dy * 0.012;
    setTheta((t) => t + dTheta);
    setPhi((p) => clampPhi(p + dPhi));
    velocityRef.current = {
      theta: reducedMotionRef.current ? 0 : dTheta / dt,
      phi: reducedMotionRef.current ? 0 : dPhi / dt,
    };
    lastRef.current = { x: e.clientX, y: e.clientY, t: now };
  };
  const onPointerUp = () => {
    draggingRef.current = false;
    lastRef.current = null;
  };

  const wasDrag = (e: React.MouseEvent) => {
    if (!downRef.current) return false;
    const dx = e.clientX - downRef.current.x;
    const dy = e.clientY - downRef.current.y;
    return Math.hypot(dx, dy) > DRAG_THRESHOLD;
  };

  const onAtomClick = (i: number) => (e: React.MouseEvent) => {
    if (wasDrag(e)) return;
    e.stopPropagation();
    setPinned((p) => (p === i ? null : i));
  };
  const onCanvasClick = (e: React.MouseEvent) => {
    if (wasDrag(e)) return;
    setPinned(null);
  };

  // ── Inspector data ─────────────────────────────────────────────────────
  const inspector = useMemo(() => {
    if (pinned !== null) {
      const a = compound.atoms[pinned];
      const neighbors = compound.bonds
        .map((b, idx) => ({ b, idx }))
        .filter(({ b }) => b[0] === pinned || b[1] === pinned)
        .map(({ b, idx }) => ({
          other: b[0] === pinned ? b[1] : b[0],
          order: b[2],
          length: bondLength(compound.bonds[idx], compound.atoms),
        }));
      return {
        kind: "atom" as const,
        atomIndex: pinned,
        element: a.el,
        elementName: ELEMENT_NAME[a.el],
        coords: [a.x, a.y, a.z] as const,
        neighbors,
      };
    }
    if (hoverBond !== null && compound.bonds[hoverBond]) {
      const b = compound.bonds[hoverBond];
      const a0 = compound.atoms[b[0]];
      const a1 = compound.atoms[b[1]];
      return {
        kind: "bond" as const,
        bondIndex: hoverBond,
        from: { idx: b[0], el: a0.el },
        to: { idx: b[1], el: a1.el },
        order: b[2],
        length: bondLength(b, compound.atoms),
      };
    }
    return { kind: "idle" as const };
  }, [pinned, hoverBond, compound]);

  const pinnedAtom = pinned !== null ? projected[pinned] : null;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        className="bg-[#0A1628] cursor-grab active:cursor-grabbing block"
        style={{ touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerUp}
        onClick={onCanvasClick}
        aria-label={`Ball-and-stick representation of ${compound.name}. Drag to rotate, scroll to zoom, click an atom to pin.`}
      >
        <defs>
          <pattern
            id="moleculeGrid"
            width="30"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 30 0 L 0 0 0 30"
              fill="none"
              stroke="rgba(13,148,136,0.08)"
              strokeWidth="1"
            />
          </pattern>
          <radialGradient id="atomGlow" cx="35%" cy="30%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="floorVignette" cx="50%" cy="100%" r="65%">
            <stop offset="0%" stopColor="rgba(13,148,136,0.18)" />
            <stop offset="100%" stopColor="rgba(13,148,136,0)" />
          </radialGradient>
        </defs>

        <rect width={W} height={H} fill="url(#moleculeGrid)" />
        <rect
          x={0}
          y={H * 0.55}
          width={W}
          height={H * 0.45}
          fill="url(#floorVignette)"
        />

        {/* Schematic corner brackets */}
        {(
          [
            [10, 10, 1, 1],
            [W - 10, 10, -1, 1],
            [10, H - 10, 1, -1],
            [W - 10, H - 10, -1, -1],
          ] as const
        ).map(([x, y, dx, dy], i) => (
          <path
            key={i}
            d={`M ${x} ${y + 16 * dy} L ${x} ${y} L ${x + 16 * dx} ${y}`}
            stroke={compound.profileColor}
            strokeWidth="1.5"
            fill="none"
            opacity="0.6"
          />
        ))}

        {/* Blueprint shadow floor — projected mesh + cast atom shadows */}
        <g opacity="0.85">
          {projectedFloor.map(({ p1, p2 }, i) => (
            <line
              key={`f-${i}`}
              x1={p1.sx}
              y1={p1.sy}
              x2={p2.sx}
              y2={p2.sy}
              stroke="rgba(13,148,136,0.32)"
              strokeWidth="0.7"
              strokeLinecap="round"
            />
          ))}
          {shadows.map((s, i) => (
            <ellipse
              key={`s-${i}`}
              cx={s.sx}
              cy={s.sy}
              rx={s.r}
              ry={s.r * 0.32}
              fill="#000"
              opacity={s.opacity}
            />
          ))}
        </g>

        {/* Bonds — back to front, double bonds rendered as parallel lines */}
        {bondsWithDepth.map(({ b, idx }) => {
          const p1 = projected[b[0]];
          const p2 = projected[b[1]];
          const isHover = hoverBond === idx;
          const touchesPinned =
            pinned !== null && (b[0] === pinned || b[1] === pinned);
          const stroke = isHover || touchesPinned ? compound.profileColor : "#64748B";
          const baseOpacity = 0.45 + Math.min(0.45, (p1.depth + p2.depth) / 12);
          const opacity = isHover || touchesPinned ? 0.95 : baseOpacity;
          const onEnter = () => setHoverBond(idx);
          const onLeave = () =>
            setHoverBond((curr) => (curr === idx ? null : curr));

          if (b[2] === 2) {
            const dx = p2.sy - p1.sy;
            const dy = -(p2.sx - p1.sx);
            const len = Math.hypot(dx, dy) || 1;
            const ox = (dx / len) * 3;
            const oy = (dy / len) * 3;
            return (
              <g
                key={`b-${idx}`}
                onMouseEnter={onEnter}
                onMouseLeave={onLeave}
                style={{ cursor: "help" }}
              >
                {/* Wide invisible hit band keeps double bonds easy to hover */}
                <line
                  x1={p1.sx}
                  y1={p1.sy}
                  x2={p2.sx}
                  y2={p2.sy}
                  stroke="transparent"
                  strokeWidth="14"
                />
                <line
                  x1={p1.sx + ox}
                  y1={p1.sy + oy}
                  x2={p2.sx + ox}
                  y2={p2.sy + oy}
                  stroke={stroke}
                  strokeWidth={isHover || touchesPinned ? 3 : 2.5}
                  opacity={opacity}
                />
                <line
                  x1={p1.sx - ox}
                  y1={p1.sy - oy}
                  x2={p2.sx - ox}
                  y2={p2.sy - oy}
                  stroke={stroke}
                  strokeWidth={isHover || touchesPinned ? 3 : 2.5}
                  opacity={opacity}
                />
              </g>
            );
          }
          return (
            <g
              key={`b-${idx}`}
              onMouseEnter={onEnter}
              onMouseLeave={onLeave}
              style={{ cursor: "help" }}
            >
              <line
                x1={p1.sx}
                y1={p1.sy}
                x2={p2.sx}
                y2={p2.sy}
                stroke="transparent"
                strokeWidth="14"
              />
              <line
                x1={p1.sx}
                y1={p1.sy}
                x2={p2.sx}
                y2={p2.sy}
                stroke={stroke}
                strokeWidth={isHover || touchesPinned ? 3.6 : 3}
                opacity={opacity}
                strokeLinecap="round"
              />
            </g>
          );
        })}

        {/* Atoms — back to front, with pin halo for the active selection */}
        {atomsSorted.map(({ p, i }) => {
          const isPinned = pinned === i;
          return (
            <g
              key={`a-${i}`}
              onClick={onAtomClick(i)}
              style={{ cursor: "pointer" }}
            >
              {isPinned && (
                <>
                  <circle
                    cx={p.sx}
                    cy={p.sy}
                    r={p.r + 8}
                    fill="none"
                    stroke={compound.profileColor}
                    strokeWidth="1"
                    opacity="0.4"
                  />
                  <circle
                    cx={p.sx}
                    cy={p.sy}
                    r={p.r + 4}
                    fill="none"
                    stroke={compound.profileColor}
                    strokeWidth="1.5"
                    opacity="0.8"
                  />
                </>
              )}
              <circle
                cx={p.sx}
                cy={p.sy}
                r={p.r}
                fill={ELEMENT_COLOR[p.el] ?? "#fff"}
                stroke={isPinned ? compound.profileColor : compound.profileColor}
                strokeWidth={isPinned ? 2 : 1.2}
              />
              <circle
                cx={p.sx}
                cy={p.sy}
                r={p.r}
                fill="url(#atomGlow)"
                pointerEvents="none"
              />
              {p.el !== "C" && (
                <text
                  x={p.sx}
                  y={p.sy + 4}
                  textAnchor="middle"
                  fill="#0A1628"
                  fontSize="11"
                  fontFamily="var(--font-tf-mono), monospace"
                  fontWeight="700"
                  pointerEvents="none"
                >
                  {p.el}
                </text>
              )}
            </g>
          );
        })}

        {/* Pinned atom callout — leader line + label */}
        {pinnedAtom && pinned !== null && (
          <g pointerEvents="none">
            <line
              x1={pinnedAtom.sx}
              y1={pinnedAtom.sy}
              x2={pinnedAtom.sx + 28}
              y2={pinnedAtom.sy - 28}
              stroke={compound.profileColor}
              strokeWidth="1"
              opacity="0.7"
            />
            <line
              x1={pinnedAtom.sx + 28}
              y1={pinnedAtom.sy - 28}
              x2={pinnedAtom.sx + 96}
              y2={pinnedAtom.sy - 28}
              stroke={compound.profileColor}
              strokeWidth="1"
              opacity="0.7"
            />
            <text
              x={pinnedAtom.sx + 32}
              y={pinnedAtom.sy - 32}
              fill={compound.profileColor}
              fontSize="9"
              fontFamily="var(--font-tf-mono), monospace"
              letterSpacing="2"
            >
              {`${compound.atoms[pinned].el}#${pinned + 1} · PINNED`}
            </text>
          </g>
        )}

        {/* HUD strings */}
        <text
          x="14"
          y={H - 18}
          fill={compound.profileColor}
          fontSize="10"
          fontFamily="var(--font-tf-mono), monospace"
          letterSpacing="2"
        >
          {compound.formula} · MW {compound.mw}
        </text>
        <text
          x={W - 14}
          y={H - 18}
          textAnchor="end"
          fill="#64748B"
          fontSize="10"
          fontFamily="var(--font-tf-mono), monospace"
          letterSpacing="2"
        >
          DRAG · SCROLL · CLICK
        </text>
        <text
          x={W - 14}
          y={20}
          textAnchor="end"
          fill="#64748B"
          fontSize="9"
          fontFamily="var(--font-tf-mono), monospace"
          letterSpacing="2"
          opacity="0.7"
        >
          {`ZOOM ${Math.round((scale / 38) * 100)}%`}
        </text>
      </svg>

      <Inspector
        data={inspector}
        compound={compound}
        onClear={() => setPinned(null)}
      />
    </div>
  );
}

function bondLength(b: Bond, atoms: Atom3D[]): number {
  const a = atoms[b[0]];
  const c = atoms[b[1]];
  return Math.hypot(a.x - c.x, a.y - c.y, a.z - c.z);
}

type InspectorData =
  | { kind: "idle" }
  | {
      kind: "atom";
      atomIndex: number;
      element: Atom3D["el"];
      elementName: string;
      coords: readonly [number, number, number];
      neighbors: Array<{ other: number; order: 1 | 2; length: number }>;
    }
  | {
      kind: "bond";
      bondIndex: number;
      from: { idx: number; el: Atom3D["el"] };
      to: { idx: number; el: Atom3D["el"] };
      order: 1 | 2;
      length: number;
    };

function Inspector({
  data,
  compound,
  onClear,
}: {
  data: InspectorData;
  compound: TerpeneCompound;
  onClear: () => void;
}) {
  const profileColor = compound.profileColor;
  return (
    <div className="border-t border-[#1E293B] bg-[#070F1F] px-4 py-3 font-mono text-[11px]">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span
          className="tracking-[0.35em] uppercase text-[10px]"
          style={{ color: profileColor }}
        >
          {data.kind === "atom"
            ? "// ATOM PINNED"
            : data.kind === "bond"
              ? "// BOND PREVIEW"
              : "// INSPECTOR · IDLE"}
        </span>
        {data.kind === "atom" && (
          <button
            type="button"
            onClick={onClear}
            className="text-[9px] tracking-[0.3em] uppercase text-[#64748B] hover:text-[#E8EDF5] transition-colors"
          >
            Unpin
          </button>
        )}
      </div>

      {data.kind === "idle" && (
        <p className="text-[#64748B] leading-relaxed">
          Hover a bond to inspect its order and length. Click an atom to pin
          it and reveal its neighbor map. Scroll to dolly in.
        </p>
      )}

      {data.kind === "bond" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <Stat label="Bond" value={data.order === 2 ? "Double" : "Single"} accent={profileColor} />
          <Stat
            label="Atoms"
            value={`${data.from.el}#${data.from.idx + 1} ↔ ${data.to.el}#${data.to.idx + 1}`}
          />
          <Stat
            label="Length"
            value={`${data.length.toFixed(2)} Å`}
            accent={profileColor}
          />
        </div>
      )}

      {data.kind === "atom" && (
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <Stat
              label="Element"
              value={`${data.element} · ${data.elementName}`}
              accent={profileColor}
            />
            <Stat label="Index" value={`#${data.atomIndex + 1}`} />
            <Stat
              label="Coord"
              value={`${data.coords[0].toFixed(1)}, ${data.coords[1].toFixed(1)}, ${data.coords[2].toFixed(1)}`}
            />
          </div>
          <div>
            <p className="text-[9px] tracking-[0.3em] uppercase text-[#64748B] mb-1">
              Neighbors ({data.neighbors.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.neighbors.length === 0 && (
                <span className="text-[#64748B]">No bonded neighbors</span>
              )}
              {data.neighbors.map((n) => {
                const other = compound.atoms[n.other];
                return (
                  <span
                    key={n.other}
                    className="px-1.5 py-0.5 border text-[10px]"
                    style={{
                      borderColor: `${profileColor}55`,
                      color: "#E8EDF5",
                    }}
                  >
                    {other.el}#{n.other + 1}
                    <span className="text-[#64748B]">
                      {" "}
                      · {n.order === 2 ? "=" : "—"} {n.length.toFixed(2)}Å
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div>
      <p className="text-[9px] tracking-[0.3em] uppercase text-[#64748B]">
        {label}
      </p>
      <p
        className="font-bold mt-0.5"
        style={{ color: accent ?? "#E8EDF5" }}
      >
        {value}
      </p>
    </div>
  );
}
