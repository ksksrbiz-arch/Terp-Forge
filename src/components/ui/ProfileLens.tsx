"use client";

interface ProfileLensProps {
  /** When non-null, the lens is active and tinted with this accent color. */
  color: string | null;
}

/**
 * Full-viewport tinted overlay that activates when a terpene profile is
 * focused. Renders as a fixed, non-interactive radial vignette in the active
 * accent color so the page reads as "viewed through that compound's lens".
 *
 * - `mix-blend-mode: screen` lifts highlights instead of darkening them.
 * - Always pointer-events: none.
 * - `prefers-reduced-motion` is handled via the global transition kill.
 */
export default function ProfileLens({ color }: ProfileLensProps) {
  const active = Boolean(color);
  const tint = color ?? "#0D9488";
  return (
    <div
      aria-hidden="true"
      className="profile-lens"
      data-active={active ? "true" : "false"}
      style={{
        background: `radial-gradient(ellipse at 50% 0%, ${tint}22 0%, ${tint}10 35%, transparent 70%)`,
      }}
    />
  );
}
