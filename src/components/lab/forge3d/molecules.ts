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
 */
export function buildMolecule(compound: ForgeCompound): BuiltMolecule {
  const group = new THREE.Group();

  // Glowing shell halo (sprite-like billboard ring).
  const haloMat = new THREE.MeshBasicMaterial({
    color: compound.color,
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const halo = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.8, 32), haloMat);
  group.add(halo);

  // Atom cluster: small spheres in a tight 3D arrangement.
  const atomGeo = new THREE.SphereGeometry(0.12, 14, 12);
  const atomMatPrimary = new THREE.MeshStandardMaterial({
    color: compound.color,
    emissive: compound.color,
    emissiveIntensity: 0.55,
    roughness: 0.3,
    metalness: 0.4,
  });
  const atomMatCarbon = new THREE.MeshStandardMaterial({
    color: 0xe8edf5,
    roughness: 0.45,
    metalness: 0.25,
  });

  const positions: THREE.Vector3[] = [];
  // Hex-ring backbone + a few branches to suggest an organic compound.
  for (let i = 0; i < compound.atoms; i++) {
    if (i < 6) {
      const a = (i / 6) * Math.PI * 2;
      positions.push(
        new THREE.Vector3(Math.cos(a) * 0.32, Math.sin(a) * 0.32, 0),
      );
    } else {
      const parent = positions[i % 6];
      const dir = parent.clone().normalize();
      positions.push(
        parent
          .clone()
          .add(dir.multiplyScalar(0.32))
          .add(
            new THREE.Vector3(
              (Math.random() - 0.5) * 0.18,
              (Math.random() - 0.5) * 0.18,
              (Math.random() - 0.5) * 0.32,
            ),
          ),
      );
    }
  }
  positions.forEach((p, i) => {
    const isCarbon = i < 6 || i % 3 !== 0;
    const atom = new THREE.Mesh(
      atomGeo,
      isCarbon ? atomMatCarbon : atomMatPrimary,
    );
    atom.position.copy(p);
    atom.scale.setScalar(isCarbon ? 0.85 : 1.05);
    group.add(atom);
  });

  // Bonds along the ring.
  const bondMat = new THREE.MeshStandardMaterial({
    color: 0x9fb0c8,
    roughness: 0.4,
    metalness: 0.3,
  });
  for (let i = 0; i < 6; i++) {
    const a = positions[i];
    const b = positions[(i + 1) % 6];
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const len = a.distanceTo(b);
    const bond = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, len, 8),
      bondMat,
    );
    bond.position.copy(mid);
    bond.lookAt(b);
    bond.rotateX(Math.PI / 2);
    group.add(bond);
  }

  const glow = new THREE.PointLight(compound.color, 0, 6, 2);
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
