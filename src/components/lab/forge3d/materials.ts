/**
 * forge3d/materials — shared palette + material presets for the
 * cinematic industrial-lab aesthetic (navy / teal / gold, sparks, fire,
 * brushed metal). Imported by every Forge 3D experience so the visual
 * language stays consistent.
 */

import * as THREE from "three";

// ── Palette (matches the rest of the site's design tokens) ─────────────
export const PALETTE = {
  navyDeep: 0x05080f,
  navy: 0x0a1628,
  navyLight: 0x0f1f3d,
  teal: 0x0d9488,
  gold: 0xc9a84c,
  goldBright: 0xe9b949,
  ember: 0xff6a1a,
  emberBright: 0xffaa44,
  bone: 0xe8edf5,
  steel: 0x9fb0c8,
  slate: 0x64748b,
} as const;

/** Format a 0xRRGGBB number as a CSS "#rrggbb" string. */
export const cssHex = (color: number): string =>
  "#" + color.toString(16).padStart(6, "0");

// ── Material presets ────────────────────────────────────────────────────
export const brushedNavy = (): THREE.MeshStandardMaterial =>
  new THREE.MeshStandardMaterial({
    color: PALETTE.navyLight,
    metalness: 0.85,
    roughness: 0.45,
  });

export const darkSteel = (): THREE.MeshStandardMaterial =>
  new THREE.MeshStandardMaterial({
    color: 0x141b30,
    metalness: 0.9,
    roughness: 0.45,
  });

export const goldEmissive = (
  intensity = 0.6,
): THREE.MeshStandardMaterial =>
  new THREE.MeshStandardMaterial({
    color: PALETTE.gold,
    emissive: PALETTE.gold,
    emissiveIntensity: intensity,
    metalness: 0.4,
    roughness: 0.3,
  });

export const tealEmissive = (
  intensity = 0.6,
): THREE.MeshStandardMaterial =>
  new THREE.MeshStandardMaterial({
    color: PALETTE.teal,
    emissive: PALETTE.teal,
    emissiveIntensity: intensity,
    metalness: 0.4,
    roughness: 0.3,
  });

/**
 * Detect a likely-mobile / low-power device. Coarse pointer (touch) OR
 * narrow viewport. Captured once per scene mount; rotating doesn't
 * re-tier — that trade-off matches what `PlantForge3D` already does.
 */
export const detectMobile = (): boolean =>
  typeof window !== "undefined" &&
  (window.matchMedia("(pointer: coarse)").matches ||
    window.innerWidth < 768);

export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Shared canvas height for every Forge 3D scene mount. Centralised so
 * the Plant Forge, Receptor Docking, and the lazy-load skeleton stay in
 * lockstep — when a new experience lands it should reuse this class
 * rather than copy-paste responsive heights.
 */
export const FORGE_CANVAS_HEIGHT_CLASS =
  "h-[440px] sm:h-[640px] md:h-[720px]";
