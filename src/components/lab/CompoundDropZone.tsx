"use client";

import { type ReactNode } from "react";
import { type CompoundDragPayload, useDropZone } from "@/lib/dnd";

interface CompoundDropZoneProps {
  onDrop: (payload: CompoundDragPayload) => void;
  children: ReactNode;
  className?: string;
  /** Optional inline style overrides (e.g. min-height, position). */
  style?: React.CSSProperties;
  /** A11y label for screen readers. */
  ariaLabel?: string;
}

/**
 * Listens for native HTML5 drops carrying TF_DND_MIME and the synthesized
 * `tf:drop` CustomEvent emitted by useTouchDrag. The wrapper sets a
 * `data-tf-hover` attribute while a compound is over it so consumers can
 * style the hover state via CSS.
 */
export function CompoundDropZone({
  onDrop,
  children,
  className,
  style,
  ariaLabel,
}: CompoundDropZoneProps) {
  const { ref, hovering } = useDropZone(onDrop);

  return (
    <div
      ref={ref}
      data-tf-drop="compound"
      data-tf-hover={hovering ? "true" : undefined}
      aria-label={ariaLabel}
      className={className}
      style={style}
    >
      {children}
    </div>
  );
}
