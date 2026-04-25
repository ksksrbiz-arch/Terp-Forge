"use client";

import {
  forwardRef,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent,
  type ReactNode,
} from "react";

interface TiltCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Maximum tilt in degrees on either axis. Default 6. */
  maxTilt?: number;
  /** Distance, in pixels, the lit highlight follows the pointer. */
  glow?: boolean;
  /** Highlight color (rgba, ideally semi-transparent). */
  glowColor?: string;
}

/**
 * Pointer-driven 3D tilt card.
 * - Uses CSS variables on the element + a ::before highlight via inline style
 * - Honors prefers-reduced-motion at the global keyframe-kill level (transforms here are not keyframes,
 *   so we additionally short-circuit pointer handling for reduced-motion).
 * - Suppresses tilt on coarse pointers (touch) where parallax feels janky.
 */
const TiltCard = forwardRef<HTMLDivElement, TiltCardProps>(function TiltCard(
  {
    children,
    maxTilt = 6,
    glow = true,
    glowColor = "rgba(201,168,76,0.18)",
    className = "",
    style,
    onPointerMove,
    onPointerLeave,
    onPointerEnter,
    ...rest
  },
  ref,
) {
  const innerRef = useRef<HTMLDivElement | null>(null);

  const reducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = () =>
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const setRefs = (node: HTMLDivElement | null) => {
    innerRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
  };

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(e);
    const node = innerRef.current;
    if (!node || reducedMotion() || !finePointer()) return;
    const rect = node.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0..1
    const py = (e.clientY - rect.top) / rect.height; // 0..1
    const rx = (0.5 - py) * maxTilt * 2;
    const ry = (px - 0.5) * maxTilt * 2;
    node.style.setProperty("--tilt-rx", `${rx.toFixed(2)}deg`);
    node.style.setProperty("--tilt-ry", `${ry.toFixed(2)}deg`);
    node.style.setProperty("--tilt-mx", `${(px * 100).toFixed(2)}%`);
    node.style.setProperty("--tilt-my", `${(py * 100).toFixed(2)}%`);
    node.style.setProperty("--tilt-active", "1");
  };

  const handleLeave = (e: PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(e);
    const node = innerRef.current;
    if (!node) return;
    node.style.setProperty("--tilt-rx", "0deg");
    node.style.setProperty("--tilt-ry", "0deg");
    node.style.setProperty("--tilt-active", "0");
  };

  const handleEnter = (e: PointerEvent<HTMLDivElement>) => {
    onPointerEnter?.(e);
  };

  const composedStyle: CSSProperties = {
    transformStyle: "preserve-3d",
    transform:
      "perspective(900px) rotateX(var(--tilt-rx,0deg)) rotateY(var(--tilt-ry,0deg))",
    transition: "transform 240ms cubic-bezier(0.22, 1, 0.36, 1)",
    ...style,
  };

  return (
    <div
      ref={setRefs}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      onPointerEnter={handleEnter}
      className={`tilt-card relative ${className}`.trim()}
      style={composedStyle}
      {...rest}
    >
      {glow && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
          style={{
            opacity: "var(--tilt-active, 0)",
            background: `radial-gradient(360px circle at var(--tilt-mx, 50%) var(--tilt-my, 50%), ${glowColor}, transparent 60%)`,
            mixBlendMode: "screen",
          }}
        />
      )}
      {children}
    </div>
  );
});

export default TiltCard;
