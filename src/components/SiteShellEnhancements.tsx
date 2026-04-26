"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { commandEntries } from "@/lib/site";

const COMMAND_EVENT = "terpforge:command-palette:open";
const FORGE_SEQUENCE = "forge";

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}

export function openCommandPalette() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(COMMAND_EVENT));
  }
}

export default function SiteShellEnhancements() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const activeSequence = useRef("");
  const forgeTimerRef = useRef<number | null>(null);
  const cursorVisibleRef = useRef(false);
  const pointerTarget = useRef({ x: 0, y: 0 });
  const pointerCurrent = useRef({ x: 0, y: 0 });
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [cursorEnabled, setCursorEnabled] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [forgeActive, setForgeActive] = useState(false);
  const [bootVisible, setBootVisible] = useState(false);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = !needle
      ? commandEntries
      : commandEntries.filter((entry) => {
          const haystack = `${entry.title} ${entry.description} ${entry.keywords.join(" ")}`.toLowerCase();
          return haystack.includes(needle);
        });
    return filtered.slice(0, 12);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const media =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    const pointer =
      typeof window !== "undefined"
        ? window.matchMedia("(pointer: fine)")
        : null;

    const updateCursor = () => {
      setCursorEnabled(Boolean(pointer?.matches) && !media?.matches);
    };

    updateCursor();
    media?.addEventListener("change", updateCursor);
    pointer?.addEventListener("change", updateCursor);

    return () => {
      media?.removeEventListener("change", updateCursor);
      pointer?.removeEventListener("change", updateCursor);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("terpforge.boot-seen") === "1") return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    sessionStorage.setItem("terpforge.boot-seen", "1");
    const showTimer = window.setTimeout(() => setBootVisible(true), 0);
    const timer = window.setTimeout(
      () => setBootVisible(false),
      reduced ? 500 : 1450,
    );

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const onCommand = () => {
      setQuery("");
      setActiveIndex(0);
      setOpen(true);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((curr) => {
          const next = !curr;
          if (next) {
            setQuery("");
            setActiveIndex(0);
          }
          return next;
        });
        return;
      }

      if (event.key === "Escape") {
        setOpen(false);
      }

      if (isEditableTarget(event.target) || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const next = `${activeSequence.current}${event.key.toLowerCase()}`.slice(
        -FORGE_SEQUENCE.length,
      );
      activeSequence.current = next;

      if (next === FORGE_SEQUENCE) {
        setForgeActive(true);
        if (forgeTimerRef.current) {
          window.clearTimeout(forgeTimerRef.current);
        }
        forgeTimerRef.current = window.setTimeout(() => {
          setForgeActive(false);
        }, 1600);
      }
    };

    window.addEventListener(COMMAND_EVENT, onCommand);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      if (forgeTimerRef.current) {
        window.clearTimeout(forgeTimerRef.current);
      }
      window.removeEventListener(COMMAND_EVENT, onCommand);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!cursorEnabled) return;

    let frame = 0;
    const move = (event: PointerEvent) => {
      pointerTarget.current = { x: event.clientX, y: event.clientY };
      if (!cursorVisibleRef.current) {
        cursorVisibleRef.current = true;
        setCursorVisible(true);
      }
    };
    const leave = () => {
      cursorVisibleRef.current = false;
      setCursorVisible(false);
    };

    const tick = () => {
      const el = cursorRef.current;
      if (el) {
        pointerCurrent.current.x += (pointerTarget.current.x - pointerCurrent.current.x) * 0.18;
        pointerCurrent.current.y += (pointerTarget.current.y - pointerCurrent.current.y) * 0.18;
        el.style.transform = `translate3d(${pointerCurrent.current.x}px, ${pointerCurrent.current.y}px, 0)`;
      }
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerleave", leave);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerleave", leave);
    };
  }, [cursorEnabled]);

  const handleSelect = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  const handlePaletteKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((curr) => (curr + 1) % results.length);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((curr) => (curr - 1 + results.length) % results.length);
    }

    if (event.key === "Enter") {
      event.preventDefault();
      handleSelect(results[activeIndex]?.href ?? results[0].href);
    }
  };

  return (
    <>
      {bootVisible && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#050E1A]/96 backdrop-blur-md">
          <div className="glass-panel relative w-[min(32rem,calc(100vw-2rem))] overflow-hidden border border-[#C9A84C]/25 px-6 py-8 text-left">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
            <p className="text-[#0D9488] text-[10px] font-mono tracking-[0.45em] uppercase">
              {"// INITIALIZING TF-SYSTEMS"}
            </p>
            <h2
              className="mt-3 text-2xl font-black uppercase text-[#E8EDF5]"
            >
              Boot Sequence
            </h2>
            <div className="mt-5 h-px bg-[#1E293B]">
              <div className="boot-progress h-full w-full bg-gradient-to-r from-[#0D9488] via-[#C9A84C] to-[#E2C97E]" />
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-[10px] font-mono tracking-[0.3em] uppercase text-[#64748B]">
              <span>Canvas</span>
              <span>Telemetry</span>
              <span>Command Bus</span>
              <span>Manifest</span>
            </div>
          </div>
        </div>
      )}

      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-[80] transition-opacity duration-300 ${forgeActive ? "opacity-100" : "opacity-0"}`}
      >
        <div className="forge-wash absolute inset-0" />
      </div>

      {cursorEnabled && (
        <div
          ref={cursorRef}
          aria-hidden="true"
          className={`pointer-events-none fixed left-0 top-0 z-[70] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200 ${cursorVisible ? "opacity-100" : "opacity-0"}`}
        >
          <div className="cursor-companion" />
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-[85] flex items-start justify-center bg-black/70 px-4 py-20 backdrop-blur-md">
          <button
            type="button"
            aria-label="Close command palette"
            className="absolute inset-0"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="glass-panel relative z-[1] w-full max-w-3xl overflow-hidden border border-[#C9A84C]/25"
          >
            <div className="border-b border-[#C9A84C]/15 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-[#0D9488] text-xs font-mono tracking-[0.3em] uppercase">
                  ⌘K
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(event) => {
                    setActiveIndex(0);
                    setQuery(event.target.value);
                  }}
                  onKeyDown={handlePaletteKeyDown}
                  placeholder="Jump to product, compound, or page section…"
                  className="w-full bg-transparent text-sm text-[#E8EDF5] placeholder-[#64748B] outline-none"
                />
              </div>
            </div>

            <ul className="max-h-[26rem] overflow-y-auto p-2">
              {results.length ? (
                results.map((entry, index) => (
                  <li key={entry.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(entry.href)}
                      className={`flex w-full items-start justify-between gap-4 rounded-sm border px-3 py-3 text-left transition-colors ${
                        index === activeIndex
                          ? "border-[#C9A84C]/40 bg-[#C9A84C]/10"
                          : "border-transparent hover:border-[#C9A84C]/20 hover:bg-[#0F1F3D]/70"
                      }`}
                    >
                      <span>
                        <span className="block text-[10px] font-mono tracking-[0.3em] uppercase text-[#0D9488]">
                          {entry.kind}
                        </span>
                        <span className="mt-1 block text-sm font-bold text-[#E8EDF5]">
                          {entry.title}
                        </span>
                        <span className="mt-1 block text-xs font-mono text-[#64748B]">
                          {entry.description}
                        </span>
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C9A84C]">
                        Open
                      </span>
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-3 py-8 text-center text-xs font-mono uppercase tracking-[0.3em] text-[#64748B]">
                  No matching transmissions
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
