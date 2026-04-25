"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Variant = "up" | "left" | "right" | "scale";

interface RevealProps {
  children: ReactNode;
  variant?: Variant;
  /** Delay before the reveal animation begins, in ms */
  delay?: number;
  /** Optional className passthrough */
  className?: string;
  /** Optional inline styles passthrough */
  style?: CSSProperties;
  /** IntersectionObserver root margin */
  rootMargin?: string;
  /** Element tag — defaults to div */
  as?: "div" | "section" | "li" | "article" | "header";
}

/**
 * IntersectionObserver-based scroll-reveal wrapper.
 * Adds .reveal-init then .reveal-shown when the element enters the viewport.
 * All animation is purely CSS — see globals.css.
 */
export default function Reveal({
  children,
  variant = "up",
  delay = 0,
  className = "",
  style,
  rootMargin = "0px 0px -10% 0px",
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(
    () => typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            obs.disconnect();
            break;
          }
        }
      },
      { rootMargin, threshold: 0.05 },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [rootMargin]);

  const classes = [
    "reveal-init",
    shown ? "reveal-shown" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const composedStyle: CSSProperties = {
    transitionDelay: delay ? `${delay}ms` : undefined,
    ...style,
  };

  return (
    <Tag
      ref={ref as never}
      className={classes}
      data-variant={variant}
      style={composedStyle}
    >
      {children}
    </Tag>
  );
}
