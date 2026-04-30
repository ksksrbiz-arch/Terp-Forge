"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import Link from "next/link";
import { terpenes } from "@/lib/compounds";
import {
  MoleculeViewer,
  type AxisLock,
  type MoleculeViewerHandle,
} from "@/components/lab/MoleculeViewer";
import { useCompoundTray } from "@/components/CompoundTrayContext";

interface MoleculeDialogProps {
  slug: string;
  onClose: () => void;
}

const PREFS_KEY = "terpforge.viewer-prefs.v1";

interface ViewerPrefs {
  axisLock: AxisLock;
  autoRotate: boolean;
}

const DEFAULT_PREFS: ViewerPrefs = { axisLock: "free", autoRotate: true };

type PrefsAction =
  | { type: "hydrate"; prefs: ViewerPrefs }
  | { type: "set"; prefs: Partial<ViewerPrefs> };

function prefsReducer(
  state: { prefs: ViewerPrefs; hydrated: boolean },
  action: PrefsAction,
) {
  switch (action.type) {
    case "hydrate":
      return { prefs: action.prefs, hydrated: true };
    case "set":
      return { ...state, prefs: { ...state.prefs, ...action.prefs } };
  }
}

function readPrefs(): ViewerPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ViewerPrefs>;
      const lock: AxisLock =
        parsed.axisLock === "horizontal" ||
        parsed.axisLock === "vertical" ||
        parsed.axisLock === "free"
          ? parsed.axisLock
          : "free";
      return {
        axisLock: lock,
        autoRotate: typeof parsed.autoRotate === "boolean" ? parsed.autoRotate : true,
      };
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_PREFS;
}

export function MoleculeDialog({ slug, onClose }: MoleculeDialogProps) {
  const compound = terpenes.find((t) => t.slug === slug);
  const viewerRef = useRef<MoleculeViewerHandle | null>(null);
  const [{ prefs, hydrated }, dispatch] = useReducer(prefsReducer, {
    prefs: DEFAULT_PREFS,
    hydrated: false,
  });
  const [snapping, setSnapping] = useState(false);
  const { pin, unpin, pinned } = useCompoundTray();

  useEffect(() => {
    dispatch({ type: "hydrate", prefs: readPrefs() });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      /* ignore */
    }
  }, [prefs, hydrated]);

  // Esc to close.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll while open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!compound) return null;

  const isPinned = pinned.includes(slug);

  const handleSnapshot = async () => {
    const blob = await viewerRef.current?.snapshot();
    if (!blob) return;
    setSnapping(true);
    window.setTimeout(() => setSnapping(false), 280);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `terpforge-${slug}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  const setAxisLock = (lock: AxisLock) =>
    dispatch({ type: "set", prefs: { axisLock: lock } });
  const toggleAutoRotate = () =>
    dispatch({ type: "set", prefs: { autoRotate: !prefs.autoRotate } });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${compound.name} molecule viewer`}
      className="tf-mol-dialog fixed inset-0 z-[65] flex items-center justify-center px-4"
    >
      <button
        type="button"
        aria-label="Close molecule viewer"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-md tf-mol-dialog__backdrop"
      />
      <div
        className="relative tf-mol-dialog__panel w-full max-w-[640px] bg-[#0A1628] border border-[#C9A84C]/30"
        style={{ boxShadow: `0 0 80px ${compound.profileColor}22` }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E293B]">
          <div>
            <p
              className="text-[10px] font-mono tracking-[0.4em] uppercase"
              style={{ color: compound.profileColor }}
            >
              {`// ${compound.profile} · ${compound.formula}`}
            </p>
            <h3 className="text-xl font-black uppercase text-[#E8EDF5] mt-1">
              {compound.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-[#64748B] hover:text-[#C9A84C] text-2xl leading-none px-2"
          >
            ×
          </button>
        </div>

        <div className="relative">
          <MoleculeViewer
            ref={viewerRef}
            compound={compound}
            autoRotate={prefs.autoRotate}
            axisLock={prefs.axisLock}
          />
          {snapping && (
            <div
              aria-hidden
              className="absolute inset-0 bg-white/40 pointer-events-none tf-mol-dialog__flash"
            />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-t border-[#1E293B] text-[10px] font-mono tracking-[0.3em] uppercase">
          <button
            type="button"
            onClick={toggleAutoRotate}
            aria-pressed={prefs.autoRotate}
            className="border px-2 py-1 transition-colors"
            style={{
              borderColor: prefs.autoRotate ? compound.profileColor : "#1E293B",
              color: prefs.autoRotate ? compound.profileColor : "#64748B",
            }}
          >
            {prefs.autoRotate ? "● AUTO" : "○ AUTO"}
          </button>
          <span className="border border-[#1E293B] flex">
            {(["free", "horizontal", "vertical"] as const).map((lock) => (
              <button
                key={lock}
                type="button"
                onClick={() => setAxisLock(lock)}
                aria-pressed={prefs.axisLock === lock}
                className="px-2 py-1 transition-colors"
                style={{
                  background:
                    prefs.axisLock === lock ? compound.profileColor : "transparent",
                  color: prefs.axisLock === lock ? "#0A1628" : "#64748B",
                }}
              >
                {lock === "free" ? "FREE" : lock === "horizontal" ? "X" : "Y"}
              </button>
            ))}
          </span>
          <button
            type="button"
            onClick={handleSnapshot}
            className="border border-[#1E293B] px-2 py-1 text-[#64748B] hover:text-[#C9A84C] hover:border-[#C9A84C]"
          >
            ↓ SNAPSHOT
          </button>
          <button
            type="button"
            onClick={() => (isPinned ? unpin(slug) : pin(slug))}
            aria-pressed={isPinned}
            className="border px-2 py-1 transition-colors"
            style={{
              borderColor: isPinned ? compound.profileColor : "#1E293B",
              color: isPinned ? compound.profileColor : "#64748B",
            }}
          >
            {isPinned ? "✓ TRAY" : "+ TRAY"}
          </button>
          <Link
            href={`/lab#compound=${slug}`}
            onClick={onClose}
            className="ml-auto border border-[#1E293B] px-2 py-1 text-[#64748B] hover:text-[#C9A84C] hover:border-[#C9A84C]"
          >
            → LAB DEEP-LINK
          </Link>
        </div>
      </div>
    </div>
  );
}
