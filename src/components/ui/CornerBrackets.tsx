interface CornerBracketsProps {
  /** Bracket length in pixels. Defaults to 14. */
  size?: number;
  /** Stroke color. Defaults to brand gold. */
  color?: string;
  /** Inset distance from the parent edge in pixels. Defaults to -1 (sit on the border). */
  inset?: number;
  className?: string;
}

/**
 * Decorative schematic corner brackets. Place inside any positioned parent.
 * Pointer-events are disabled so it never interferes with hit testing.
 */
export default function CornerBrackets({
  size = 14,
  color = "#C9A84C",
  inset = -1,
  className = "",
}: CornerBracketsProps) {
  const common = "absolute pointer-events-none";
  const style = { width: size, height: size, borderColor: color } as const;
  return (
    <span className={`contents ${className}`.trim()} aria-hidden="true">
      <span className={common} style={{ ...style, top: inset, left: inset, borderTop: `1px solid ${color}`, borderLeft: `1px solid ${color}` }} />
      <span className={common} style={{ ...style, top: inset, right: inset, borderTop: `1px solid ${color}`, borderRight: `1px solid ${color}` }} />
      <span className={common} style={{ ...style, bottom: inset, left: inset, borderBottom: `1px solid ${color}`, borderLeft: `1px solid ${color}` }} />
      <span className={common} style={{ ...style, bottom: inset, right: inset, borderBottom: `1px solid ${color}`, borderRight: `1px solid ${color}` }} />
    </span>
  );
}
