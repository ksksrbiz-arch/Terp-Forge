"use client";

import { useMemo, useState } from "react";
import { terpenes, RADAR_AXES, type RadarVector } from "@/lib/compounds";

type AxisKey = (typeof RADAR_AXES)[number]["key"];

/** Pick two terpenes and visualize the combined effect profile as an
 *  overlapping radar chart. The synergy polygon is the per-axis maximum
 *  of the two contributors with a +6 boost on overlapping axes (caps 100). */
export function SynergyBuilder() {
  const [aSlug, setASlug] = useState(terpenes[0].slug);
  const [bSlug, setBSlug] = useState(terpenes[2].slug);

  const a = terpenes.find((t) => t.slug === aSlug) ?? terpenes[0];
  const b = terpenes.find((t) => t.slug === bSlug) ?? terpenes[1];

  const synergy: RadarVector = useMemo(() => {
    const out: Partial<RadarVector> = {};
    for (const axis of RADAR_AXES) {
      const k = axis.key as AxisKey;
      const va = a.radar[k];
      const vb = b.radar[k];
      const max = Math.max(va, vb);
      const overlap = Math.min(va, vb) > 50 ? 6 : 0;
      out[k] = Math.min(100, max + overlap);
    }
    return out as RadarVector;
  }, [a, b]);

  // Geometry
  const W = 360, H = 360;
  const cx = W / 2, cy = H / 2;
  const R = 130;
  const N = RADAR_AXES.length;
  const pointFor = (idx: number, value: number) => {
    const angle = (idx / N) * Math.PI * 2 - Math.PI / 2;
    const r = (value / 100) * R;
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  };
  const polygonOf = (vec: RadarVector) =>
    RADAR_AXES.map((axis, i) => {
      const p = pointFor(i, vec[axis.key as AxisKey]);
      return `${p.x},${p.y}`;
    }).join(" ");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8 items-start">
      <div className="bg-[#0A1628] border border-[#1E293B] p-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          {/* concentric grid rings */}
          {[0.25, 0.5, 0.75, 1].map((k) => (
            <polygon
              key={k}
              points={RADAR_AXES.map((_, i) => {
                const p = pointFor(i, k * 100);
                return `${p.x},${p.y}`;
              }).join(" ")}
              fill="none"
              stroke="#1E293B"
              strokeWidth="1"
            />
          ))}
          {/* axes */}
          {RADAR_AXES.map((_, i) => {
            const p = pointFor(i, 100);
            return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#1E293B" strokeWidth="1" />;
          })}
          {/* compound A */}
          <polygon
            points={polygonOf(a.radar)}
            fill={`${a.profileColor}33`}
            stroke={a.profileColor}
            strokeWidth="1.5"
          />
          {/* compound B */}
          <polygon
            points={polygonOf(b.radar)}
            fill={`${b.profileColor}33`}
            stroke={b.profileColor}
            strokeWidth="1.5"
          />
          {/* synergy hull */}
          <polygon
            points={polygonOf(synergy)}
            fill="none"
            stroke="#C9A84C"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            opacity="0.95"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="20"
              dur="1.4s"
              repeatCount="indefinite"
            />
          </polygon>
          {/* axis labels */}
          {RADAR_AXES.map((axis, i) => {
            const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
            const lx = cx + Math.cos(angle) * (R + 22);
            const ly = cy + Math.sin(angle) * (R + 22);
            return (
              <text
                key={axis.key}
                x={lx}
                y={ly}
                textAnchor="middle"
                fill="#64748B"
                fontSize="10"
                fontFamily="var(--font-roboto-mono), monospace"
                letterSpacing="2"
                dominantBaseline="middle"
              >
                {axis.label.toUpperCase()}
              </text>
            );
          })}
        </svg>
        <div className="flex justify-between text-[10px] font-mono tracking-widest pt-2">
          <Legend color={a.profileColor} label={`A · ${a.name}`} />
          <Legend color={b.profileColor} label={`B · ${b.name}`} />
          <Legend color="#C9A84C" label="SYNERGY" dashed />
        </div>
      </div>

      <div className="space-y-6">
        <Selector label="Compound A" value={aSlug} onChange={setASlug} disabled={bSlug} />
        <Selector label="Compound B" value={bSlug} onChange={setBSlug} disabled={aSlug} />

        <div className="border-t border-[#1E293B] pt-5">
          <p className="text-[#0D9488] text-[10px] font-mono tracking-[0.4em] uppercase mb-3">
            {"// Synergy summary"}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {RADAR_AXES.map((axis) => {
              const v = synergy[axis.key as AxisKey];
              return (
                <div key={axis.key} className="border border-[#1E293B] p-3 bg-[#0A1628]">
                  <p className="text-[#64748B] text-[9px] font-mono tracking-widest uppercase">
                    {axis.label}
                  </p>
                  <p className="text-2xl font-black text-[#C9A84C] mt-1" style={{ fontFamily: "var(--font-montserrat)" }}>
                    {Math.round(v)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label, dashed = false }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="flex items-center gap-2 text-[#64748B]">
      <span
        className="block w-5 h-0.5"
        style={{
          background: color,
          backgroundImage: dashed ? `linear-gradient(90deg, ${color} 50%, transparent 50%)` : undefined,
          backgroundSize: dashed ? "6px 100%" : undefined,
        }}
      />
      {label}
    </span>
  );
}

function Selector({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled: string;
}) {
  return (
    <div>
      <p className="text-[#64748B] text-[10px] font-mono tracking-[0.4em] uppercase mb-2">
        {label}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {terpenes.map((t) => {
          const isSelected = value === t.slug;
          const isDisabled = disabled === t.slug;
          return (
            <button
              type="button"
              key={t.slug}
              onClick={() => onChange(t.slug)}
              disabled={isDisabled}
              aria-pressed={isSelected}
              className="border px-3 py-3 text-left transition-all"
              style={{
                borderColor: isSelected ? t.profileColor : `${t.profileColor}25`,
                background: isSelected ? `${t.profileColor}18` : "transparent",
                opacity: isDisabled ? 0.3 : 1,
                cursor: isDisabled ? "not-allowed" : "pointer",
              }}
            >
              <p className="text-[#E8EDF5] text-sm font-bold" style={{ fontFamily: "var(--font-montserrat)" }}>
                {t.name}
              </p>
              <p className="text-[10px] font-mono mt-0.5" style={{ color: t.profileColor }}>
                {t.profile}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
