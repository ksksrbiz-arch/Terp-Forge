"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Cinematic route-transition wrapper.
 *
 * On every pathname change a fresh subtree mounts (keyed on the path), which
 * replays the CSS-driven scan-line sweep + staggered fade-up defined in
 * `globals.css`. No View Transitions API runtime — pure CSS keyframes —
 * so the static export contract holds and the effect works in every
 * evergreen browser. Reduced-motion users get an instant swap via the
 * `prefers-reduced-motion` guard in the stylesheet.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-transition" data-path={pathname}>
      <span aria-hidden="true" className="page-scan-sweep" />
      <div className="page-transition-content">{children}</div>
    </div>
  );
}
