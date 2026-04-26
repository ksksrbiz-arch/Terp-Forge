/**
 * forge3d — shared toolkit for the Forge 3D experiences.
 *
 * Every cinematic Three.js scene on the Lab page (Plant Forge, Receptor
 * Docking, Decarb Furnace, Entourage Mixer, Trichome Journey, Strain
 * Composer, Walkthrough Explorer) imports from this module so they share
 * one palette, one molecule builder, and one visibility-aware RAF loop.
 */

export {
  PALETTE,
  cssHex,
  brushedNavy,
  darkSteel,
  goldEmissive,
  tealEmissive,
  detectMobile,
  prefersReducedMotion,
  FORGE_CANVAS_HEIGHT_CLASS,
} from "./materials";

export {
  COMPOUNDS,
  RECEPTORS,
  AFFINITY,
  BINDING_EFFECTS,
} from "./compounds";
export type {
  CompoundCategory,
  ForgeCompound,
  ReceptorId,
  Receptor,
} from "./compounds";

export { buildMolecule, disposeMolecule } from "./molecules";
export type { BuiltMolecule } from "./molecules";

export { useVisibilityRaf } from "./useVisibilityRaf";
export type { RafTick, UseVisibilityRafOptions } from "./useVisibilityRaf";

export { HudPanel, HudCaption, HudProgress } from "./Hud";
