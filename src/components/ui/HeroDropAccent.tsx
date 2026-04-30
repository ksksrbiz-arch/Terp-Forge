"use client";

import { useEffect, useState } from "react";
import { terpenes } from "@/lib/compounds";
import { useDropZone } from "@/lib/dnd";
import HeroForgeScene from "@/components/ui/HeroForgeScene";

const TELEMETRY_DURATION_MS = 2400;

/**
 * Client wrapper around HeroForgeScene. Adds a transparent drop zone layer
 * over the canvas: dropping a compound chip tints the scene's molecules
 * toward that compound's profile color (~1.5s decay) and surfaces a
 * telemetry line announcing the accepted compound.
 *
 * On touch devices the same effect is reachable by tapping a chip in the
 * tray and confirming via the "tap-to-accept" hint that surfaces during
 * an active touch drag (handled by useTouchDrag → tf:drop event path).
 */
export function HeroDropAccent() {
  const [accentSlug, setAccentSlug] = useState<string | undefined>(undefined);
  const [telemetry, setTelemetry] = useState<string>("");

  const { ref, hovering } = useDropZone((payload) => {
    const compound = terpenes.find((t) => t.slug === payload.slug);
    if (!compound) return;
    setAccentSlug(compound.slug);
    setTelemetry(`COMPOUND ACCEPTED · ${compound.name.toUpperCase()}`);
  });

  useEffect(() => {
    if (!telemetry) return;
    const t = window.setTimeout(() => setTelemetry(""), TELEMETRY_DURATION_MS);
    return () => window.clearTimeout(t);
  }, [telemetry]);

  return (
    <>
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <HeroForgeScene accentSlug={accentSlug} />
      </div>
      {/* Transparent drop layer — captures HTML5 dragover/drop and the
          synthesized tf:drop CustomEvent. Sits behind the hero's
          foreground content (buttons, headline) so clicks pass through
          to those interactive children stacked later in the DOM. */}
      <div
        ref={ref}
        data-tf-drop="compound"
        data-tf-hover={hovering ? "true" : undefined}
        aria-hidden
        className={`tf-hero-dropzone absolute inset-0 transition-shadow ${
          hovering ? "tf-hero-dropzone--hover" : ""
        }`}
      />
      {/* Telemetry line — narrow, subdued, sits under the headline. */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="absolute top-24 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
      >
        {telemetry && (
          <p className="tf-hero-telemetry text-[10px] font-mono tracking-[0.4em] uppercase text-[#C9A84C] border border-[#C9A84C]/40 bg-[#0A1628]/60 backdrop-blur-sm px-3 py-1">
            {`// ${telemetry}`}
          </p>
        )}
      </div>
    </>
  );
}
