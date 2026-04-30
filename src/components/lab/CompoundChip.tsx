"use client";

import { type DragEvent, useCallback } from "react";
import { terpenes, type TerpeneCompound } from "@/lib/compounds";
import {
  TF_DND_MIME,
  serializePayload,
  setBodyDragging,
  useTouchDrag,
} from "@/lib/dnd";

type Variant = "chip" | "tile";

interface CompoundChipProps {
  slug: string;
  variant?: Variant;
  onClick?: (compound: TerpeneCompound) => void;
  className?: string;
}

/**
 * Universal draggable terpene chip. Source for all DnD operations on the
 * compound system. Click triggers `onClick` (typically opens MoleculeDialog).
 */
export function CompoundChip({
  slug,
  variant = "chip",
  onClick,
  className,
}: CompoundChipProps) {
  const compound = terpenes.find((t) => t.slug === slug);
  const touchHandlers = useTouchDrag(
    { slug, profile: compound?.profile ?? "" },
    compound?.name ?? slug,
  );

  const onDragStart = useCallback(
    (e: DragEvent<HTMLButtonElement>) => {
      if (!compound) return;
      e.dataTransfer.effectAllowed = "copy";
      e.dataTransfer.setData(
        TF_DND_MIME,
        serializePayload({ slug, profile: compound.profile }),
      );
      setBodyDragging(compound.profile);
    },
    [compound, slug],
  );

  const onDragEnd = useCallback(() => setBodyDragging(null), []);

  if (!compound) return null;

  const isTile = variant === "tile";
  const { style: touchStyle, ...touchEvents } = touchHandlers;

  return (
    <button
      type="button"
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={() => onClick?.(compound)}
      data-profile={compound.profile}
      data-tf-chip={slug}
      aria-label={`${compound.name} · ${compound.profile} · drag to a slot or click to inspect`}
      className={[
        "relative text-left transition-colors cursor-grab active:cursor-grabbing",
        "border focus:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A84C]",
        isTile ? "px-3 py-3 block w-full" : "px-3 py-2 inline-flex items-center gap-2",
        className ?? "",
      ].join(" ")}
      style={{
        borderColor: `${compound.profileColor}55`,
        background: `${compound.profileColor}12`,
        ...touchStyle,
      }}
      {...touchEvents}
    >
      <span
        aria-hidden
        className="block w-2 h-2 shrink-0"
        style={{ background: compound.profileColor }}
      />
      <span className="flex-1">
        <span className="block text-[#E8EDF5] text-sm font-bold leading-none">
          {compound.name}
        </span>
        <span
          className="block text-[10px] font-mono mt-1 tracking-widest"
          style={{ color: compound.profileColor }}
        >
          {compound.profile}
        </span>
      </span>
    </button>
  );
}
