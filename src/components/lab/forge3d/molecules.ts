/**
 * forge3d/molecules — pure, scene-agnostic molecule mesh builder.
 *
 * Identical to the original `buildMolecule` inside `PlantForge3D` except
 * the caller is responsible for adding/removing the returned group from
 * its scene. Reused by:
 *   - PlantForge3D            (scripted growth sequence)
 *   - ReceptorDocking3D       (dockable molecules)
 *   - DecarboxylationFurnace  (before/after molecule cross-fade — future)
 *   - EntourageEffectMixer    (compounds dropped into the crucible — future)
 */

import * as THREE from "three";
import type { ForgeCompound } from "./compounds";

export interface BuiltMolecule {
  /** Three.js group; caller adds it to a scene and disposes via `disposeMolecule`. */
  group: THREE.Group;
  /** Glow point light on the molecule, controllable from the animation loop. */
  glow: THREE.PointLight;
  /** Halo billboard ring; caller sets `.lookAt(camera.position)` each frame. */
  halo: THREE.Mesh;
}

/**
 * Build a procedural molecule mesh: hex-ring backbone of carbons + a few
 * branch atoms colored to the compound, a glowing halo billboard, and a
 * small point light. Geometries/materials are owned by the returned group
 * and freed by `disposeMolecule`.
 *
 * Visual quality targets:
 *  - Larger atoms + strong emissive so UnrealBloomPass picks them up.
 *  - Thicker bonds with a slight emissive tint.
 *  - Outer halo ring sized to create a visible corona even before bloom.
 *  - 3-D branch positions so the molecule reads as a real structure, not
 *    a flat disc.
 */
export function buildMolecule(compound: ForgeCompound): BuiltMolecule {
  const group = new THREE.Group();

  // ── Halo (double-ring corona billboard) ───────────────────────────────
  const haloMat = new THREE.MeshBasicMaterial({
    color: compound.color,
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  // Outer ring (larger for dramatic corona during fly-in and burst)
  const halo = new THREE.Mesh(new THREE.RingGeometry(0.65, 1.05, 48), haloMat);
  group.add(halo);
  // Tight inner ring — always slightly visible once attached
  const haloInnerMat = new THREE.MeshBasicMaterial({
    color: compound.color,
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const haloInner = new THREE.Mesh(
    new THREE.RingGeometry(0.3, 0.46, 48),
    haloInnerMat,
  );
  group.add(haloInner);

  // ── Atom cluster ──────────────────────────────────────────────────────
  // Slightly larger radius + high emissive so UnrealBloom picks them up.
  const atomGeo = new THREE.SphereGeometry(0.15, 16, 14);
  const atomMatPrimary = new THREE.MeshStandardMaterial({
    color: compound.color,
    emissive: compound.color,
    emissiveIntensity: 1.8,   // bloom trigger
    roughness: 0.2,
    metalness: 0.55,
  });
  const atomMatCarbon = new THREE.MeshStandardMaterial({
    color: 0xd0dcea,
    emissive: 0x3a4a5c,
    emissiveIntensity: 0.35,
    roughness: 0.35,
    metalness: 0.45,
  });

  const positions: THREE.Vector3[] = [];
  // Hex-ring backbone — placed in a slightly tilted plane for a 3-D read.
  const RING_R = 0.38;
  const TILT = 0.22; // radians of X-tilt on the ring plane
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    positions.push(
      new THREE.Vector3(
        Math.cos(a) * RING_R,
        Math.sin(a) * RING_R * Math.cos(TILT),
        Math.sin(a) * RING_R * Math.sin(TILT),
      ),
    );
  }

  // Branch atoms — spread more in Z so the molecule has genuine depth.
  // Guard: only iterate if the compound has atoms beyond the 6-ring base.
  for (let i = 6; i < compound.atoms; i++) {
    const parent = positions[i % 6];
    if (!parent) continue;
    const dir = parent.clone().normalize();
    const offset = new THREE.Vector3(
      (Math.random() - 0.5) * 0.22,
      (Math.random() - 0.5) * 0.22,
      (Math.random() - 0.5) * 0.44,
    );
    positions.push(parent.clone().add(dir.multiplyScalar(0.38)).add(offset));
  }

  positions.forEach((p, i) => {
    const isBranch = i >= 6 && i % 3 === 0;
    const atom = new THREE.Mesh(
      atomGeo,
      isBranch ? atomMatPrimary : atomMatCarbon,
    );
    atom.position.copy(p);
    atom.scale.setScalar(isBranch ? 1.15 : 0.88);
    group.add(atom);
  });

  // ── Bonds ──────────────────────────────────────────────────────────────
  // Thicker cylinders + slight emissive so they read well under bloom.
  const bondMat = new THREE.MeshStandardMaterial({
    color: 0xb8cce0,
    emissive: 0x1a2a3c,
    emissiveIntensity: 0.4,
    roughness: 0.3,
    metalness: 0.6,
  });
  for (let i = 0; i < 6; i++) {
    const a = positions[i];
    const b = positions[(i + 1) % 6];
    if (!a || !b) continue;
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const len = a.distanceTo(b);
    const bond = new THREE.Mesh(
      new THREE.CylinderGeometry(0.048, 0.048, len, 10),
      bondMat,
    );
    bond.position.copy(mid);
    bond.lookAt(b);
    bond.rotateX(Math.PI / 2);
    group.add(bond);
  }

  // ── Glow point light ───────────────────────────────────────────────────
  // Wider range and higher decay so it illuminates nearby plant geometry.
  const glow = new THREE.PointLight(compound.color, 0, 9, 1.8);
  group.add(glow);

  return { group, glow, halo };
}

/**
 * Free GPU resources owned by a molecule group. Removes from parent if
 * still attached. Safe to call multiple times.
 */
export function disposeMolecule(group: THREE.Group): void {
  if (group.parent) group.parent.remove(group);
  group.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose();
      const mat = obj.material;
      if (Array.isArray(mat)) mat.forEach((mm) => mm.dispose());
      else mat.dispose();
    }
  });
}
