/**
 * Drag-and-drop primitives for the compound system.
 *
 * Native HTML5 DnD does not work on iOS Safari, so chips also support a
 * pointer-event drag fallback via `useTouchDrag`. The body element carries a
 * `data-tf-dragging` attribute with the dragged compound's profile so any
 * page can light up matching drop targets via CSS attribute selectors.
 */
"use client";

import { useEffect, useRef, useState } from "react";

export const TF_DND_MIME = "application/x-tf-compound";

export type CompoundDragPayload = { slug: string; profile: string };

export function serializePayload(p: CompoundDragPayload): string {
  return JSON.stringify(p);
}

export function parsePayload(raw: string | null): CompoundDragPayload | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Partial<CompoundDragPayload>;
    if (typeof v.slug === "string" && typeof v.profile === "string") {
      return { slug: v.slug, profile: v.profile };
    }
  } catch {
    // fall through
  }
  return null;
}

export function setBodyDragging(profile: string | null) {
  if (typeof document === "undefined") return;
  if (profile) {
    document.body.dataset.tfDragging = profile;
  } else {
    delete document.body.dataset.tfDragging;
  }
}

/**
 * Pointer-event-based drag fallback for touch devices.
 *
 * Returns handlers to spread on the source element. On long-press (160 ms) or
 * once movement exceeds an 8-px threshold, a floating "ghost" element is
 * mounted at the cursor and `data-tf-dragging` is set on body. On pointer-up,
 * the element under the cursor is inspected for a `data-tf-drop` attribute;
 * a matching zone receives a synthesized `tf:drop` CustomEvent with the
 * payload. Native HTML5 DnD remains the primary path on desktop.
 */
export function useTouchDrag(payload: CompoundDragPayload, label: string) {
  const stateRef = useRef<{
    pointerId: number | null;
    active: boolean;
    startX: number;
    startY: number;
    ghost: HTMLDivElement | null;
    timer: number | null;
  }>({
    pointerId: null,
    active: false,
    startX: 0,
    startY: 0,
    ghost: null,
    timer: null,
  });

  const cleanup = () => {
    const s = stateRef.current;
    if (s.timer !== null) {
      window.clearTimeout(s.timer);
      s.timer = null;
    }
    if (s.ghost) {
      s.ghost.remove();
      s.ghost = null;
    }
    s.pointerId = null;
    s.active = false;
    setBodyDragging(null);
  };

  useEffect(() => cleanup, []);

  const beginGhost = (x: number, y: number) => {
    const ghost = document.createElement("div");
    ghost.className = "tf-drag-image";
    ghost.textContent = label;
    ghost.style.position = "fixed";
    ghost.style.left = `${x}px`;
    ghost.style.top = `${y}px`;
    ghost.style.pointerEvents = "none";
    ghost.style.zIndex = "9999";
    document.body.appendChild(ghost);
    stateRef.current.ghost = ghost;
    stateRef.current.active = true;
    setBodyDragging(payload.profile);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return; // desktop uses native HTML5 DnD
    const s = stateRef.current;
    s.pointerId = e.pointerId;
    s.startX = e.clientX;
    s.startY = e.clientY;
    s.active = false;
    s.timer = window.setTimeout(() => {
      if (s.pointerId !== null && !s.active) {
        beginGhost(s.startX, s.startY);
      }
    }, 160);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const s = stateRef.current;
    if (s.pointerId !== e.pointerId) return;
    if (!s.active) {
      const dx = e.clientX - s.startX;
      const dy = e.clientY - s.startY;
      if (dx * dx + dy * dy > 64) beginGhost(e.clientX, e.clientY);
      return;
    }
    if (s.ghost) {
      s.ghost.style.left = `${e.clientX}px`;
      s.ghost.style.top = `${e.clientY}px`;
    }
    e.preventDefault();
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const s = stateRef.current;
    if (s.pointerId !== e.pointerId) return;
    if (s.active) {
      const target = document
        .elementFromPoint(e.clientX, e.clientY)
        ?.closest<HTMLElement>("[data-tf-drop]");
      if (target) {
        target.dispatchEvent(
          new CustomEvent("tf:drop", { detail: payload, bubbles: true }),
        );
      }
    }
    cleanup();
  };

  const onPointerCancel = () => cleanup();

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    style: { touchAction: "none" as const },
  };
}

/**
 * Subscribes a drop-zone element to both native HTML5 DnD and the
 * synthesized `tf:drop` CustomEvent emitted by `useTouchDrag`.
 *
 * Usage: const { ref, hovering } = useDropZone(handler);
 */
export function useDropZone(onDrop: (p: CompoundDragPayload) => void) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleDragOver = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes(TF_DND_MIME)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      setHovering(true);
    };
    const handleDragLeave = () => setHovering(false);
    const handleDrop = (e: DragEvent) => {
      const raw = e.dataTransfer?.getData(TF_DND_MIME) ?? null;
      const payload = parsePayload(raw);
      if (payload) {
        e.preventDefault();
        onDrop(payload);
      }
      setHovering(false);
    };
    const handleTfDrop = (e: Event) => {
      const ce = e as CustomEvent<CompoundDragPayload>;
      if (ce.detail?.slug) onDrop(ce.detail);
      setHovering(false);
    };

    el.addEventListener("dragover", handleDragOver);
    el.addEventListener("dragleave", handleDragLeave);
    el.addEventListener("drop", handleDrop);
    el.addEventListener("tf:drop", handleTfDrop);
    return () => {
      el.removeEventListener("dragover", handleDragOver);
      el.removeEventListener("dragleave", handleDragLeave);
      el.removeEventListener("drop", handleDrop);
      el.removeEventListener("tf:drop", handleTfDrop);
    };
  }, [onDrop]);

  return { ref, hovering };
}
