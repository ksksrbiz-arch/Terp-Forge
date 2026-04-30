"use client";

import { useEffect, useMemo, useReducer } from "react";
import {
  RADAR_AXES,
  terpenes,
  type RadarVector,
  type TerpeneCompound,
} from "@/lib/compounds";
import { CompoundChip } from "@/components/lab/CompoundChip";
import { CompoundDropZone } from "@/components/lab/CompoundDropZone";

type AxisKey = (typeof RADAR_AXES)[number]["key"];

const SLOT_COUNT = 4;
const STORAGE_KEY = "terpforge.synergy.v1";

type Slots = (string | null)[];

type SlotsAction =
  | { type: "hydrate"; slots: Slots }
  | { type: "set"; index: number; slug: string | null }
  | { type: "clear" };

function emptySlots(): Slots {
  return Array(SLOT_COUNT).fill(null);
}

function slotsReducer(
  state: { slots: Slots; hydrated: boolean },
  action: SlotsAction,
) {
  switch (action.type) {
    case "hydrate":
      return { slots: action.slots, hydrated: true };
    case "set": {
      const next = [...state.slots];
      // Prevent the same compound occupying two slots.
      if (action.slug !== null) {
        for (let i = 0; i < next.length; i++) {
          if (next[i] === action.slug) next[i] = null;
        }
      }
      next[action.index] = action.slug;
      return { ...state, slots: next };
    }
    case "clear":
      return { ...state, slots: emptySlots() };
  }
}

function readSlots(): Slots {
  if (typeof window === "undefined") return emptySlots();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptySlots();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return emptySlots();
    const out: Slots = emptySlots();
    for (let i = 0; i < SLOT_COUNT; i++) {
      const slug = parsed[i];
      if (typeof slug === "string" && terpenes.some((t) => t.slug === slug)) {
        out[i] = slug;
      }
    }
    return out;
  } catch {
    return emptySlots();
  }
}

/**
 * N-way synergy: per-axis max across contributors, +6 bonus when ≥2 contributors
 * clear 50% on that axis (cap 100). With exactly 2 active slots this matches
 * the V1 formula. With 0 or 1 the synergy hull collapses to 0 / the lone vector.
 */
function computeSynergy(active: TerpeneCompound[]): RadarVector {
  const out: Partial<RadarVector> = {};
  for (const axis of RADAR_AXES) {
    const k = axis.key as AxisKey;
    if (active.length === 0) {
      out[k] = 0;
      continue;
    }
    let max = 0;
    let highCount = 0;
    for (const c of active) {
      const v = c.radar[k];
      if (v > max) max = v;
      if (v > 50) highCount += 1;
    }
    const bonus = highCount >= 2 ? 6 : 0;
    out[k] = Math.min(100, max + bonus);
  }
  return out as RadarVector;
}

export function SynergyBuilder() {
  const [state, dispatch] = useReducer(slotsReducer, {
    slots: emptySlots(),
    hydrated: false,
  });
  const { slots, hydrated } = state;

  useEffect(() => {
    dispatch({ type: "hydrate", slots: readSlots() });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
    } catch {
      // localStorage may be disabled; ignore.
    }
  }, [slots, hydrated]);

  const activeCompounds = useMemo(() => {
    return slots
      .map((slug) =>
        slug ? terpenes.find((t) => t.slug === slug) ?? null : null,
      )
      .filter((c): c is TerpeneCompound => c !== null);
  }, [slots]);

  const synergy = useMemo(
    () => computeSynergy(activeCompounds),
    [activeCompounds],
  );

  const setSlot = (index: number, slug: string | null) =>
    dispatch({ type: "set", index, slug });

  const clearAll = () => dispatch({ type: "clear" });

  // Geometry
  const W = 360,
    H = 360;
  const cx = W / 2,
    cy = H / 2;
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
          {RADAR_AXES.map((_, i) => {
            const p = pointFor(i, 100);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={p.x}
                y2={p.y}
                stroke="#1E293B"
                strokeWidth="1"
              />
            );
          })}
          {activeCompounds.map((c) => (
            <polygon
              key={c.slug}
              points={polygonOf(c.radar)}
              fill={`${c.profileColor}33`}
              stroke={c.profileColor}
              strokeWidth="1.5"
              className="tf-synergy-poly"
            />
          ))}
          {activeCompounds.length > 0 && (
            <polygon
              points={polygonOf(synergy)}
              fill="none"
              stroke="#C9A84C"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              opacity="0.95"
              className="tf-synergy-hull"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="20"
                dur="1.4s"
                repeatCount="indefinite"
              />
            </polygon>
          )}
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
                fontFamily="var(--font-tf-mono), monospace"
                letterSpacing="2"
                dominantBaseline="middle"
              >
                {axis.label.toUpperCase()}
              </text>
            );
          })}
        </svg>
        <div className="flex flex-wrap gap-x-4 gap-y-1 justify-between text-[10px] font-mono tracking-widest pt-3">
          {activeCompounds.map((c) => (
            <Legend
              key={c.slug}
              color={c.profileColor}
              label={c.name.toUpperCase()}
            />
          ))}
          {activeCompounds.length > 0 && (
            <Legend color="#C9A84C" label="SYNERGY" dashed />
          )}
          {activeCompounds.length === 0 && (
            <span className="text-[#475569]">{"// DROP COMPOUNDS TO BEGIN"}</span>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[#64748B] text-[10px] font-mono tracking-[0.4em] uppercase">
              {"// Slots · drag a compound or tap to fill"}
            </p>
            <button
              type="button"
              onClick={clearAll}
              disabled={activeCompounds.length === 0}
              className="text-[10px] font-mono tracking-widest uppercase text-[#64748B] hover:text-[#C9A84C] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              CLEAR
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {slots.map((slug, i) => (
              <SlotZone
                key={i}
                index={i}
                slug={slug}
                onDrop={(payload) => setSlot(i, payload.slug)}
                onClear={() => setSlot(i, null)}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-[#64748B] text-[10px] font-mono tracking-[0.4em] uppercase mb-3">
            {"// Palette"}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {terpenes.map((t) => (
              <CompoundChip key={t.slug} slug={t.slug} variant="tile" />
            ))}
          </div>
        </div>

        <div className="border-t border-[#1E293B] pt-5">
          <p className="text-[#0D9488] text-[10px] font-mono tracking-[0.4em] uppercase mb-3">
            {"// Synergy summary"}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {RADAR_AXES.map((axis) => {
              const v = synergy[axis.key as AxisKey];
              return (
                <div key={axis.key} className="border border-[#1E293B] p-2.5 sm:p-3 bg-[#0A1628]">
                  <p className="text-[#64748B] text-[9px] font-mono tracking-widest uppercase">
                    {axis.label}
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-[#C9A84C] mt-1">
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

function SlotZone({
  index,
  slug,
  onDrop,
  onClear,
}: {
  index: number;
  slug: string | null;
  onDrop: (payload: { slug: string; profile: string }) => void;
  onClear: () => void;
}) {
  const compound = slug ? terpenes.find((t) => t.slug === slug) : null;
  return (
    <CompoundDropZone
      onDrop={onDrop}
      ariaLabel={`Synergy slot ${index + 1}`}
      className="tf-slot"
    >
      <div className="tf-slot__inner">
        <span className="tf-slot__label">SLOT {String(index + 1).padStart(2, "0")}</span>
        {compound ? (
          <div className="flex items-center justify-between gap-2 mt-2">
            <div>
              <p className="text-[#E8EDF5] text-sm font-bold">{compound.name}</p>
              <p
                className="text-[10px] font-mono mt-0.5"
                style={{ color: compound.profileColor }}
              >
                {compound.profile}
              </p>
            </div>
            <button
              type="button"
              onClick={onClear}
              className="text-[#64748B] hover:text-[#C9A84C] text-xs font-mono px-2 py-1 border border-[#1E293B]"
              aria-label={`Clear slot ${index + 1}`}
            >
              ✕
            </button>
          </div>
        ) : (
          <p className="text-[#475569] text-[10px] font-mono tracking-widest mt-2 uppercase">
            empty · drop here
          </p>
        )}
      </div>
    </CompoundDropZone>
  );
}

function Legend({
  color,
  label,
  dashed = false,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <span className="flex items-center gap-2 text-[#64748B]">
      <span
        className="block w-5 h-0.5"
        style={{
          background: color,
          backgroundImage: dashed
            ? `linear-gradient(90deg, ${color} 50%, transparent 50%)`
            : undefined,
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
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
              <p className="text-[#E8EDF5] text-sm font-bold">
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
