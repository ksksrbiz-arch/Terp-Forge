"use client";

import { useEffect } from "react";
import Link from "next/link";
import { terpenes } from "@/lib/compounds";
import { useCompoundTray, TRAY_MAX } from "@/components/CompoundTrayContext";
import { CompoundChip } from "@/components/lab/CompoundChip";

/**
 * Persistent bottom-edge dock holding pinned compounds. Collapsed by
 * default (a 48-px bar with chip avatars). Expands into a panel that
 * surfaces the chips themselves (drag-source) plus a deep link to the
 * Synergy Mixer.
 */
export function CompoundTray() {
  const { pinned, hydrated, isOpen, pulse, unpin, clear, toggleOpen, close } =
    useCompoundTray();

  // Close on Escape when expanded.
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  // Push body padding so the collapsed dock doesn't cover footer content.
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (hydrated && pinned.length > 0) {
      document.body.dataset.tfTray = "true";
    } else {
      delete document.body.dataset.tfTray;
    }
    return () => {
      delete document.body.dataset.tfTray;
    };
  }, [hydrated, pinned.length]);

  if (!hydrated || pinned.length === 0) return null;

  const compounds = pinned
    .map((slug) => terpenes.find((t) => t.slug === slug))
    .filter((c): c is (typeof terpenes)[number] => Boolean(c));

  return (
    <div
      className={[
        "tf-tray fixed left-0 right-0 bottom-0 transition-[height] duration-200 ease-out",
          isOpen ? "h-[260px] z-[55]" : "h-12 z-40",
          pulse ? "tf-tray--pulse" : "",
        ].join(" ")}
        role="region"
        aria-label="Compound tray"
        data-tf-tray-open={isOpen ? "true" : "false"}
      >
        {/* Collapsed bar */}
        <button
          type="button"
          onClick={toggleOpen}
          aria-expanded={isOpen}
          aria-controls="tf-tray-panel"
          className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-4 bg-[#0A1628]/95 border-t border-[#C9A84C]/30 backdrop-blur-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A84C]"
        >
          <span className="flex items-center gap-3">
            <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-[#0D9488]">
              {"// TRAY"}
            </span>
            <span className="flex items-center gap-1.5">
              {compounds.map((c) => (
                <span
                  key={c.slug}
                  className="block w-2.5 h-2.5"
                  style={{ background: c.profileColor }}
                  aria-hidden
                />
              ))}
              {Array.from({ length: TRAY_MAX - compounds.length }).map((_, i) => (
                <span
                  key={`empty-${i}`}
                  className="block w-2.5 h-2.5 border border-[#1E293B]"
                  aria-hidden
                />
              ))}
            </span>
            <span className="text-[10px] font-mono tracking-widest text-[#64748B]">
              {compounds.length} / {TRAY_MAX}
            </span>
          </span>
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#64748B]">
            {isOpen ? "COLLAPSE ▾" : "EXPAND ▴"}
          </span>
        </button>

        {/* Expanded panel */}
        <div
          id="tf-tray-panel"
          aria-hidden={!isOpen}
          className={`absolute top-12 left-0 right-0 bottom-0 bg-[#0A1628]/97 border-t border-[#C9A84C]/20 backdrop-blur-sm overflow-hidden transition-opacity duration-200 ${
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 py-4 h-full flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-[#64748B]">
                {"// Pinned compounds · drag onto any drop zone"}
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="/lab#synergy"
                  onClick={close}
                  className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#C9A84C] hover:text-[#E8EDF5] border border-[#C9A84C]/40 px-3 py-1.5"
                >
                  → Open Synergy Mixer
                </Link>
                <button
                  type="button"
                  onClick={clear}
                  className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#64748B] hover:text-[#C9A84C]"
                >
                  CLEAR ALL
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {compounds.map((c) => (
                <div
                  key={c.slug}
                  className="relative border border-[#1E293B] p-2 bg-[#0A1628]"
                >
                  <CompoundChip slug={c.slug} variant="tile" />
                  <button
                    type="button"
                    onClick={() => unpin(c.slug)}
                    aria-label={`Unpin ${c.name}`}
                    className="absolute top-1 right-1 text-[10px] font-mono text-[#64748B] hover:text-[#C9A84C] px-1.5 py-0.5"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
}
