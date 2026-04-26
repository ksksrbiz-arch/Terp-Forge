"use client";

import { useEffect, useState } from "react";

type StreamPlayerProps = {
  /** Cloudflare Stream video UID. When provided, uses the Stream iframe player.
   *  Set NEXT_PUBLIC_CF_STREAM_SUBDOMAIN to your Stream subdomain. */
  videoId?: string;
  /** Fallback MP4 used when no videoId is set or Stream subdomain isn't configured. */
  fallbackSrc: string;
  poster?: string;
  className?: string;
  ariaLabel: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
};

const STREAM_SUBDOMAIN = process.env.NEXT_PUBLIC_CF_STREAM_SUBDOMAIN || "";

export function StreamPlayer({
  videoId,
  fallbackSrc,
  poster,
  className,
  ariaLabel,
  controls = true,
  autoPlay = false,
  loop = false,
  muted = false,
}: StreamPlayerProps) {
  const useStream = Boolean(videoId && STREAM_SUBDOMAIN);
  const [reduceMotion, setReduceMotion] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    m.addEventListener("change", handler);
    return () => m.removeEventListener("change", handler);
  }, []);

  const effectiveAutoPlay = autoPlay && !reduceMotion;

  if (useStream) {
    const params = new URLSearchParams();
    if (effectiveAutoPlay) params.set("autoplay", "true");
    if (loop) params.set("loop", "true");
    if (muted) params.set("muted", "true");
    if (controls) params.set("controls", "true"); else params.set("controls", "false");
    if (poster) params.set("poster", poster);
    return (
      <iframe
        src={`https://${STREAM_SUBDOMAIN}.cloudflarestream.com/${videoId}/iframe?${params.toString()}`}
        className={className}
        title={ariaLabel}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
      />
    );
  }

  return (
    <video
      className={className}
      controls={controls}
      autoPlay={effectiveAutoPlay}
      loop={loop}
      muted={muted}
      playsInline
      preload="metadata"
      poster={poster}
      aria-label={ariaLabel}
    >
      <source src={fallbackSrc} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}
