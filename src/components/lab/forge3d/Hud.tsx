/**
 * forge3d/Hud — small shared HUD building blocks. Lets every Forge 3D
 * scene render a status panel with consistent border/blur/typography
 * without copy-pasting Tailwind classes.
 */

import type { CSSProperties, ReactNode } from "react";
import { cssHex } from "./materials";

interface HudPanelProps {
  /** 0xRRGGBB — used for the border accent. */
  accentColor: number;
  className?: string;
  children: ReactNode;
}

/**
 * Glass-blur status panel, gold/teal accent border. Pointer-events:none
 * by default so it never blocks orbit drags; nested buttons should
 * re-enable pointer events.
 */
export function HudPanel({
  accentColor,
  className = "",
  children,
}: HudPanelProps) {
  const style: CSSProperties = { borderColor: `${cssHex(accentColor)}55` };
  return (
    <div className={`pointer-events-none ${className}`}>
      <div
        className="border bg-[#0A1628]/85 backdrop-blur-sm p-3 sm:p-4 transition-colors"
        style={style}
      >
        {children}
      </div>
    </div>
  );
}

interface HudCaptionProps {
  color: number;
  children: ReactNode;
}

/** "// MODULE NN" tracking-wide caption. */
export function HudCaption({ color, children }: HudCaptionProps) {
  return (
    <p
      className="text-[9px] sm:text-[10px] font-mono tracking-[0.4em] uppercase mb-1"
      style={{ color: cssHex(color) }}
    >
      {children}
    </p>
  );
}

interface HudProgressProps {
  /** 0..1 */
  value: number;
  color: number;
  thin?: boolean;
}

/** Accent progress bar matching the compound color. */
export function HudProgress({ value, color, thin = false }: HudProgressProps) {
  return (
    <div
      className={`bg-[#1E293B] overflow-hidden ${thin ? "h-0.5" : "h-1.5"}`}
    >
      <div
        className="h-full transition-[width] duration-150"
        style={{
          width: `${Math.max(0, Math.min(1, value)) * 100}%`,
          backgroundColor: cssHex(color),
        }}
      />
    </div>
  );
}
