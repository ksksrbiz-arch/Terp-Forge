"use client";

/**
 * ReceptorDocking3D — interactive cannabinoid / terpene docking demo.
 *
 * Two glowing receptor proteins (CB1 = teal, CB2 = gold) float above the
 * forge floor. The user picks a molecule chip; the molecule spawns from
 * the floor, flies along a Bézier into the selected receptor's pocket,
 * and resolves into one of two outcomes:
 *
 *   - success (affinity ≥ 0.5): pocket flares, halo blooms, ember burst,
 *     popup describes the in-body effect (THC → CB1 = euphoria, etc.).
 *   - rejection (affinity < 0.5): molecule wobbles, dims, drifts away —
 *     visualizing weak binding affinity.
 *
 * Built on the shared `forge3d/` toolkit (palette, molecule builder,
 * visibility-aware RAF, HUD chrome). Mobile path: single-receptor tab
 * swap, reduced particle counts, no antialias, shadow maps disabled.
 *
 * Like `PlantForge3D`, this component is fully self-contained: pure
 * procedural geometry, no GLTF / external assets, honors
 * `prefers-reduced-motion`, and disposes every Three.js resource on
 * unmount.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  AFFINITY,
  BINDING_EFFECTS,
  COMPOUNDS,
  PALETTE,
  RECEPTORS,
  buildMolecule,
  cssHex,
  disposeMolecule,
} from "./forge3d";
import type { ForgeCompound, ReceptorId } from "./forge3d";

// ─────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────

/** Affinity threshold for a successful binding; below = rejection. */
const SUCCESS_THRESHOLD = 0.5;

/** Bezier flight duration (seconds). */
const FLIGHT_DURATION = 2.2;
/** Lock-in animation duration on success (seconds). */
const LOCKIN_DURATION = 0.9;
/** Settled-in-pocket dwell before fade-out (seconds). */
const DWELL_DURATION = 4.5;
/** Fade-out duration after dwell (seconds). */
const FADE_DURATION = 1.2;
/** Rejection wobble + drift duration (seconds). */
const REJECT_DURATION = 2.5;

interface DockedMolecule {
  compound: ForgeCompound;
  target: ReceptorId;
  group: THREE.Group;
  glow: THREE.PointLight;
  halo: THREE.Mesh;
  origin: THREE.Vector3;
  control: THREE.Vector3;
  destination: THREE.Vector3;
  affinity: number;
  success: boolean;
  /** Seconds since spawn. */
  age: number;
  /** Phase: "flight" → "lockin"/"reject" → "dwell" → "fade" → done. */
  phase: "flight" | "lockin" | "reject" | "dwell" | "fade" | "done";
  /** Ember burst points (success only). Disposed when molecule disposes. */
  burst?: { points: THREE.Points; velocities: Float32Array; age: number };
}

interface ReceptorRuntime {
  id: ReceptorId;
  group: THREE.Group;
  /** Pocket pulse target and current emissive intensity. */
  pocketRing: THREE.Mesh;
  shell: THREE.Mesh;
  /** Position the molecule snaps to on success. */
  pocketCenter: THREE.Vector3;
  /** Recent binding flash that decays each frame, drives pocket emissive. */
  flash: number;
  /** Reject-flash decay (dimming). */
  dimFlash: number;
}

interface PopupState {
  compoundName: string;
  receptorId: ReceptorId;
  receptorName: string;
  affinity: number;
  success: boolean;
  message: string;
  /** Re-mount key so identical messages still re-trigger the animation. */
  key: number;
}

interface HudState {
  successCount: number;
  totalLaunches: number;
  popup: PopupState | null;
}

const INITIAL_HUD: HudState = {
  successCount: 0,
  totalLaunches: 0,
  popup: null,
};

// ─────────────────────────────────────────────────────────────────────────
// Receptor builder
// ─────────────────────────────────────────────────────────────────────────

/**
 * Build the initial ember field. Module-level helper so the
 * `react-hooks/purity` rule unambiguously sees `Math.random` outside the
 * component render scope.
 */
function makeEmberArrays(count: number): {
  positions: Float32Array;
  seeds: Float32Array;
} {
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const r = 0.5 + Math.random() * 5.5;
    const a = Math.random() * Math.PI * 2;
    positions[i * 3] = Math.cos(a) * r;
    positions[i * 3 + 1] = Math.random() * 7;
    positions[i * 3 + 2] = Math.sin(a) * r;
    seeds[i] = Math.random();
  }
  return { positions, seeds };
}

function buildReceptor(
  id: ReceptorId,
  color: number,
  isMobile: boolean,
): ReceptorRuntime {
  const group = new THREE.Group();

  // Outer protein shell: a noisy icosahedron, semi-transparent emissive.
  // Lower poly on mobile to keep draw calls cheap.
  const detail = isMobile ? 1 : 2;
  const shellGeo = new THREE.IcosahedronGeometry(1.1, detail);
  // Displace vertices to give a lumpy, organic protein silhouette.
  const pos = shellGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const noise =
      0.15 *
      (Math.sin(x * 3.2 + y * 1.7) +
        Math.cos(z * 2.1 - y * 2.6) +
        Math.sin((x + z) * 4.3));
    const scale = 1 + noise * 0.18;
    pos.setXYZ(i, x * scale, y * scale, z * scale);
  }
  shellGeo.computeVertexNormals();

  const shellMat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.35,
    metalness: 0.25,
    roughness: 0.55,
    transparent: true,
    opacity: 0.78,
    side: THREE.DoubleSide,
  });
  const shell = new THREE.Mesh(shellGeo, shellMat);
  shell.castShadow = !isMobile;
  shell.receiveShadow = !isMobile;
  group.add(shell);

  // Inner emissive core for an "alive" glow.
  const coreGeo = new THREE.IcosahedronGeometry(0.55, 1);
  const coreMat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // Binding pocket: a flattened ring on the front face. Molecules dock here.
  const pocketRingGeo = new THREE.TorusGeometry(0.55, 0.06, 8, 32);
  const pocketRingMat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const pocketRing = new THREE.Mesh(pocketRingGeo, pocketRingMat);
  // Pocket faces +Z (toward the camera).
  pocketRing.position.set(0, 0, 1.05);
  group.add(pocketRing);

  // SDF-ish pocket: small cluster of inverted spheres inside the ring,
  // suggesting a concavity carved into the protein.
  const pocketCellGeo = new THREE.SphereGeometry(0.18, 12, 10);
  const pocketCellMat = new THREE.MeshStandardMaterial({
    color: 0x0a1424,
    emissive: color,
    emissiveIntensity: 0.25,
    roughness: 0.6,
    metalness: 0.2,
  });
  const pocketGroup = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const r = i === 0 ? 0 : 0.32;
    const cell = new THREE.Mesh(pocketCellGeo, pocketCellMat);
    cell.position.set(Math.cos(a) * r, Math.sin(a) * r, 0);
    cell.scale.setScalar(i === 0 ? 0.85 : 0.6);
    pocketGroup.add(cell);
  }
  pocketGroup.position.set(0, 0, 1.0);
  group.add(pocketGroup);

  return {
    id,
    group,
    pocketRing,
    shell,
    // World-space pocket position is updated when the receptor is positioned;
    // recompute via group.localToWorld at spawn time.
    pocketCenter: new THREE.Vector3(0, 0, 1.0),
    flash: 0,
    dimFlash: 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────

export function ReceptorDocking3D() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [hud, setHud] = useState<HudState>(INITIAL_HUD);
  /**
   * Which receptor receives the next launch. On mobile this is also the
   * single visible receptor (the other is hidden to halve draw calls).
   */
  const [target, setTarget] = useState<ReceptorId>("CB1");

  // Imperative bridges into the RAF loop.
  const launchRef = useRef<{ compound: ForgeCompound; target: ReceptorId } | null>(
    null,
  );
  const clearRef = useRef(false);
  /**
   * The RAF loop installs a callback here so React state changes for the
   * target receptor can be mirrored into the scene (mobile receptor swap).
   */
  const targetSyncRef = useRef<((next: ReceptorId) => void) | null>(null);

  const launch = (compound: ForgeCompound) => {
    launchRef.current = { compound, target };
  };
  const clearScene = () => {
    clearRef.current = true;
  };

  // ── Scene setup (runs once per mount) ───────────────────────────────────
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Match PlantForge3D's stable per-mount detection inline so the
    // react-hooks/purity rule can statically prove these reads are
    // outside render scope.
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobileLocal =
      typeof window !== "undefined" &&
      (window.matchMedia("(pointer: coarse)").matches ||
        window.innerWidth < 768);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobileLocal,
      alpha: false,
      powerPreference: isMobileLocal ? "low-power" : "high-performance",
    });
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, isMobileLocal ? 1.25 : 2),
    );
    renderer.setSize(mount.clientWidth, mount.clientHeight, false);
    renderer.setClearColor(PALETTE.navyDeep, 1);
    renderer.shadowMap.enabled = !isMobileLocal;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.touchAction = "none";

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(PALETTE.navyDeep, 0.03);

    const camera = new THREE.PerspectiveCamera(
      isMobileLocal ? 55 : 45,
      mount.clientWidth / mount.clientHeight,
      0.1,
      200,
    );
    camera.position.set(0, 4.5, isMobileLocal ? 11 : 9.5);
    camera.lookAt(0, 2.4, 0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 2.4, 0);
    controls.minDistance = 6;
    controls.maxDistance = 22;
    controls.minPolarAngle = Math.PI * 0.2;
    controls.maxPolarAngle = Math.PI * 0.55;
    controls.enablePan = false;
    controls.autoRotate = !reduceMotion;
    controls.autoRotateSpeed = 0.35;

    let userInteractedAt = -Infinity;
    controls.addEventListener("start", () => {
      userInteractedAt = performance.now();
      controls.autoRotate = false;
    });
    controls.addEventListener("end", () => {
      userInteractedAt = performance.now();
    });

    // Lighting — same forge mood as PlantForge3D
    scene.add(new THREE.HemisphereLight(0x6b89c4, 0x0a0a14, 0.4));
    const keyLight = new THREE.DirectionalLight(0xffe4b5, 1.0);
    keyLight.position.set(6, 12, 8);
    keyLight.castShadow = !isMobileLocal;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);
    const forgeLight = new THREE.PointLight(PALETTE.ember, 1.6, 16, 1.6);
    forgeLight.position.set(0, 0.4, 0);
    scene.add(forgeLight);

    // Floor
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(16, isMobileLocal ? 32 : 64),
      new THREE.MeshStandardMaterial({
        color: PALETTE.navyLight,
        metalness: 0.85,
        roughness: 0.45,
      }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = !isMobileLocal;
    scene.add(floor);

    // Distant pillars (same mood device used in PlantForge3D)
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x0a1224,
      metalness: 0.8,
      roughness: 0.6,
    });
    const pillarCount = isMobileLocal ? 4 : 6;
    for (let i = 0; i < pillarCount; i++) {
      const a = (i / pillarCount) * Math.PI * 2;
      const r = 12;
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 8.5, 0.45),
        pillarMat,
      );
      pillar.position.set(Math.cos(a) * r, 4.2, Math.sin(a) * r);
      pillar.castShadow = !isMobileLocal;
      scene.add(pillar);
    }

    // Embers
    const emberCount = isMobileLocal ? 60 : 180;
    const { positions: emberPositions, seeds: emberSeeds } =
      makeEmberArrays(emberCount);
    const emberGeo = new THREE.BufferGeometry();
    emberGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(emberPositions, 3),
    );
    const embers = new THREE.Points(
      emberGeo,
      new THREE.PointsMaterial({
        color: PALETTE.emberBright,
        size: 0.08,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    scene.add(embers);

    // ── Receptors ──────────────────────────────────────────────────────────
    // Desktop: both visible side-by-side. Mobile: only the targeted one
    // is visible at a time — saves the cost of a second receptor mesh.
    const cb1 = buildReceptor("CB1", PALETTE.teal, isMobileLocal);
    const cb2 = buildReceptor("CB2", PALETTE.gold, isMobileLocal);
    if (isMobileLocal) {
      cb1.group.position.set(0, 2.6, 0);
      cb2.group.position.set(0, 2.6, 0);
      cb2.group.visible = false; // start with CB1 (default target).
    } else {
      cb1.group.position.set(-2.6, 2.6, 0);
      cb2.group.position.set(2.6, 2.6, 0);
    }
    scene.add(cb1.group, cb2.group);

    const receptors: Record<ReceptorId, ReceptorRuntime> = {
      CB1: cb1,
      CB2: cb2,
    };

    // ── State ──────────────────────────────────────────────────────────────
    const docked: DockedMolecule[] = [];

    // Targeted receptor. Mutated by an effect below when `target` state
    // changes; capture initial value here.
    targetSyncRef.current = (next: ReceptorId) => {
      if (isMobileLocal) {
        cb1.group.visible = next === "CB1";
        cb2.group.visible = next === "CB2";
      }
    };

    const spawnMolecule = (compound: ForgeCompound, t: ReceptorId) => {
      const built = buildMolecule(compound);
      // Spawn near the floor in front of the receptors.
      const origin = new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        0.6,
        4 + Math.random() * 1.5,
      );
      built.group.position.copy(origin);
      built.group.scale.setScalar(0.0001); // start tiny, scale up during flight
      scene.add(built.group);

      const receptor = receptors[t];
      // World-space pocket position (group local +Z is the pocket).
      const destination = new THREE.Vector3();
      receptor.group.localToWorld(destination.copy(receptor.pocketCenter));

      // Bezier control point: lifted high so molecules arc over instead of
      // skimming the floor.
      const control = origin
        .clone()
        .lerp(destination, 0.5)
        .add(new THREE.Vector3(0, 3.2 + Math.random() * 0.8, 0));

      const aff = AFFINITY[compound.name]?.[t] ?? 0.2;
      const success = aff >= SUCCESS_THRESHOLD;

      docked.push({
        compound,
        target: t,
        group: built.group,
        glow: built.glow,
        halo: built.halo,
        origin,
        control,
        destination,
        affinity: aff,
        success,
        age: 0,
        phase: "flight",
      });

      setHud((prev) => ({
        ...prev,
        totalLaunches: prev.totalLaunches + 1,
      }));
    };

    const announceResult = (m: DockedMolecule) => {
      const receptor = RECEPTORS.find((r) => r.id === m.target);
      const message =
        BINDING_EFFECTS[m.compound.name]?.[m.target] ??
        (m.success
          ? "Successful interaction with the receptor."
          : "Weak fit — molecule drifts away without binding.");
      setHud((prev) => ({
        successCount: prev.successCount + (m.success ? 1 : 0),
        totalLaunches: prev.totalLaunches,
        popup: {
          compoundName: m.compound.name,
          receptorId: m.target,
          receptorName: receptor?.name ?? m.target,
          affinity: m.affinity,
          success: m.success,
          message,
          key: performance.now(),
        },
      }));
    };

    /** Spawn a small additive-points burst at a world position. */
    const spawnBurst = (pos: THREE.Vector3, color: number, count: number) => {
      const positions = new Float32Array(count * 3);
      const velocities = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = pos.x;
        positions[i * 3 + 1] = pos.y;
        positions[i * 3 + 2] = pos.z;
        // Spherical velocity, biased upward.
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const speed = 1.2 + Math.random() * 1.8;
        velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
        velocities[i * 3 + 1] = Math.cos(phi) * speed + 0.6;
        velocities[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({
        color,
        size: 0.12,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const points = new THREE.Points(geo, mat);
      scene.add(points);
      return { points, velocities, age: 0 };
    };

    // ── Animation loop ─────────────────────────────────────────────────────
    let raf = 0;
    // performance.now() invoked via a tiny helper so the static purity
    // analyzer doesn't misclassify this effect-scope read as render-scope.
    const nowMs = (): number => performance.now();
    let last = nowMs();
    let elapsed = 0;
    let running = false;
    let onScreen = true;
    let tabVisible =
      typeof document === "undefined" || !document.hidden;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      elapsed += dt;

      // Auto-rotate resume after 2.5s of no user interaction.
      if (
        !reduceMotion &&
        !controls.autoRotate &&
        now - userInteractedAt > 2500
      ) {
        controls.autoRotate = true;
      }

      // Drain pending launch / clear requests from React.
      const pending = launchRef.current;
      if (pending) {
        launchRef.current = null;
        spawnMolecule(pending.compound, pending.target);
      }
      if (clearRef.current) {
        clearRef.current = false;
        for (const m of docked) {
          if (m.burst) {
            scene.remove(m.burst.points);
            m.burst.points.geometry.dispose();
            (m.burst.points.material as THREE.Material).dispose();
          }
          disposeMolecule(m.group);
        }
        docked.length = 0;
        setHud(INITIAL_HUD);
      }

      // Forge flicker
      forgeLight.intensity =
        1.3 + Math.sin(elapsed * 7.3) * 0.3 + Math.sin(elapsed * 13.1) * 0.18;

      // Embers drift up
      const posAttr = embers.geometry.getAttribute(
        "position",
      ) as THREE.BufferAttribute;
      for (let i = 0; i < emberCount; i++) {
        const idx = i * 3 + 1;
        let y = posAttr.array[idx] as number;
        y += dt * (0.35 + emberSeeds[i] * 0.7);
        if (y > 8) y = 0.1;
        (posAttr.array as Float32Array)[idx] = y;
      }
      posAttr.needsUpdate = true;

      // Receptor pulse + flash decay
      for (const r of [cb1, cb2]) {
        if (!r.group.visible) continue;
        // Slow idle rotation
        r.group.rotation.y += dt * 0.18;
        // Pulse the pocket emissive
        const basePulse = 0.6 + Math.sin(elapsed * 2.2 + (r.id === "CB1" ? 0 : 1)) * 0.25;
        const flashBoost = r.flash;
        const dim = r.dimFlash;
        const ringMat = r.pocketRing.material as THREE.MeshBasicMaterial;
        ringMat.opacity = Math.max(0, Math.min(1, basePulse + flashBoost - dim * 0.4));
        const shellMat = r.shell.material as THREE.MeshStandardMaterial;
        shellMat.emissiveIntensity = Math.max(
          0.1,
          0.35 + flashBoost * 0.6 - dim * 0.25,
        );
        r.flash = Math.max(0, r.flash - dt * 1.2);
        r.dimFlash = Math.max(0, r.dimFlash - dt * 1.6);
      }

      // Animate docked molecules
      for (let i = docked.length - 1; i >= 0; i--) {
        const m = docked[i];
        m.age += dt;
        const haloMat = m.halo.material as THREE.MeshBasicMaterial;

        // Always face halo at the camera.
        m.halo.lookAt(camera.position);

        if (m.phase === "flight") {
          const t = Math.min(1, m.age / FLIGHT_DURATION);
          // Quadratic bezier
          const oneMinus = 1 - t;
          const x =
            oneMinus * oneMinus * m.origin.x +
            2 * oneMinus * t * m.control.x +
            t * t * m.destination.x;
          const y =
            oneMinus * oneMinus * m.origin.y +
            2 * oneMinus * t * m.control.y +
            t * t * m.destination.y;
          const z =
            oneMinus * oneMinus * m.origin.z +
            2 * oneMinus * t * m.control.z +
            t * t * m.destination.z;
          m.group.position.set(x, y, z);
          // Scale up + spin during flight.
          const s = 0.2 + 0.8 * t;
          m.group.scale.setScalar(s);
          m.group.rotation.x += dt * 1.6;
          m.group.rotation.y += dt * 2.0;
          m.glow.intensity = 0.6 + t * 1.8;
          haloMat.opacity = 0.15 + t * 0.45;
          m.halo.scale.setScalar(0.6 + t * 0.6);

          if (t >= 1) {
            m.phase = m.success ? "lockin" : "reject";
            m.age = 0;
            const receptor = receptors[m.target];
            if (m.success) {
              receptor.flash = 1.0;
              const burstCount = isMobileLocal ? 24 : 60;
              m.burst = spawnBurst(
                m.destination.clone(),
                m.compound.color,
                burstCount,
              );
            } else {
              receptor.dimFlash = 1.0;
            }
            announceResult(m);
          }
        } else if (m.phase === "lockin") {
          const t = Math.min(1, m.age / LOCKIN_DURATION);
          // Stay at destination, halo blooms then collapses, glow flares.
          m.group.position.copy(m.destination);
          m.group.rotation.x += dt * 0.6;
          m.group.rotation.y += dt * 0.9;
          m.glow.intensity = 4.0 * (1 - t) + 1.2;
          haloMat.opacity = 0.85 * (1 - t);
          m.halo.scale.setScalar(1 + t * 2.6);
          if (t >= 1) {
            m.phase = "dwell";
            m.age = 0;
          }
        } else if (m.phase === "reject") {
          // Wobble + drift up & away from the receptor.
          const t = Math.min(1, m.age / REJECT_DURATION);
          const wobble = Math.sin(m.age * 18) * 0.12 * (1 - t);
          const drift = m.destination
            .clone()
            .sub(m.origin)
            .normalize()
            .multiplyScalar(-1) // away from receptor
            .multiplyScalar(t * 1.8);
          m.group.position.set(
            m.destination.x + wobble + drift.x,
            m.destination.y + t * 1.5 + Math.sin(m.age * 6) * 0.08,
            m.destination.z + drift.z,
          );
          m.group.rotation.x += dt * 0.8;
          m.group.rotation.y += dt * 1.1;
          m.glow.intensity = (1 - t) * 1.2;
          haloMat.opacity = 0.2 * (1 - t);
          m.halo.scale.setScalar(1 + t * 0.5);
          // Fade the molecule itself by scaling down.
          m.group.scale.setScalar(1 - t * 0.6);
          if (t >= 1) {
            m.phase = "fade";
            m.age = 0;
          }
        } else if (m.phase === "dwell") {
          // Settled inside the pocket — gentle bob + spin.
          const bob = Math.sin(m.age * 1.6) * 0.04;
          m.group.position.set(
            m.destination.x,
            m.destination.y + bob,
            m.destination.z,
          );
          m.group.rotation.y += dt * 0.5;
          m.glow.intensity = 0.9 + Math.sin(m.age * 2.0) * 0.2;
          haloMat.opacity = 0;
          if (m.age >= DWELL_DURATION) {
            m.phase = "fade";
            m.age = 0;
          }
        } else if (m.phase === "fade") {
          const t = Math.min(1, m.age / FADE_DURATION);
          m.group.scale.setScalar(Math.max(0.0001, m.group.scale.x * (1 - dt * 1.2)));
          m.glow.intensity *= 1 - dt * 2;
          haloMat.opacity *= 1 - dt * 2;
          if (t >= 1) {
            m.phase = "done";
          }
        }

        // Animate ember burst, if any.
        if (m.burst) {
          m.burst.age += dt;
          const bp = m.burst.points.geometry.getAttribute(
            "position",
          ) as THREE.BufferAttribute;
          const arr = bp.array as Float32Array;
          for (let p = 0; p < arr.length; p += 3) {
            arr[p] += m.burst.velocities[p] * dt;
            arr[p + 1] += m.burst.velocities[p + 1] * dt;
            arr[p + 2] += m.burst.velocities[p + 2] * dt;
            // Gravity-ish pull
            m.burst.velocities[p + 1] -= dt * 1.6;
          }
          bp.needsUpdate = true;
          const burstMat = m.burst.points.material as THREE.PointsMaterial;
          burstMat.opacity = Math.max(0, 1 - m.burst.age / 1.4);
          if (m.burst.age > 1.6) {
            scene.remove(m.burst.points);
            m.burst.points.geometry.dispose();
            burstMat.dispose();
            m.burst = undefined;
          }
        }

        // Cleanup
        if (m.phase === "done") {
          if (m.burst) {
            scene.remove(m.burst.points);
            m.burst.points.geometry.dispose();
            (m.burst.points.material as THREE.Material).dispose();
          }
          disposeMolecule(m.group);
          docked.splice(i, 1);
        }
      }

      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };

    // Visibility-aware loop (matches PlantForge3D's pattern).
    const startLoop = () => {
      if (running || reduceMotion) return;
      if (!onScreen || !tabVisible) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stopLoop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    };

    if (reduceMotion) {
      controls.update();
      renderer.render(scene, camera);
    } else {
      startLoop();
    }

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e) return;
        onScreen = e.isIntersecting;
        if (onScreen) startLoop();
        else stopLoop();
      },
      { threshold: 0.01 },
    );
    io.observe(mount);
    const onVis = () => {
      tabVisible = !document.hidden;
      if (tabVisible) startLoop();
      else stopLoop();
    };
    document.addEventListener("visibilitychange", onVis);

    const ro = new ResizeObserver(() => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      running = false;
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      controls.dispose();
      // Dispose any in-flight molecules (and their bursts).
      for (const m of docked) {
        if (m.burst) {
          scene.remove(m.burst.points);
          m.burst.points.geometry.dispose();
          (m.burst.points.material as THREE.Material).dispose();
        }
        disposeMolecule(m.group);
      }
      docked.length = 0;
      // Dispose receptors + everything else in the scene.
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const mat = obj.material;
          if (Array.isArray(mat)) mat.forEach((mm) => mm.dispose());
          else mat.dispose();
        } else if (obj instanceof THREE.Points) {
          obj.geometry.dispose();
          (obj.material as THREE.Material).dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
      // Clear the target bridge so a stale closure can't fire after unmount.
      targetSyncRef.current = null;
    };
  }, []);

  // Bridge target state changes into the RAF closure (installed inside
  // the effect above). Skipped if the scene hasn't mounted yet.
  useEffect(() => {
    targetSyncRef.current?.(target);
  }, [target]);

  // Pre-compute hex strings for the HUD.
  const palette = useMemo(
    () => ({
      CB1: cssHex(PALETTE.teal),
      CB2: cssHex(PALETTE.gold),
    }),
    [],
  );
  const targetHex = palette[target];

  // ── HUD layer ─────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-[480px] sm:h-[640px] md:h-[720px] border border-[#0D9488]/20 bg-[#05080F] overflow-hidden select-none">
      <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />

      {/* Top-left: receptor info card */}
      <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-auto sm:max-w-sm pointer-events-none">
        <div
          className="border bg-[#0A1628]/85 backdrop-blur-sm p-3 sm:p-4 transition-colors"
          style={{ borderColor: `${targetHex}55` }}
        >
          <p
            className="text-[9px] sm:text-[10px] font-mono tracking-[0.4em] uppercase mb-1"
            style={{ color: targetHex }}
          >
            {"// TARGET RECEPTOR"}
          </p>
          <p
            className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#E8EDF5]"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            {RECEPTORS.find((r) => r.id === target)?.name ?? target}
          </p>
          <p className="text-[#64748B] text-[10px] sm:text-[11px] font-mono mt-1">
            {RECEPTORS.find((r) => r.id === target)?.location}
          </p>
          <p className="hidden sm:block text-[#94A3B8] text-[11px] mt-2 leading-snug">
            {RECEPTORS.find((r) => r.id === target)?.blurb}
          </p>
          <div className="mt-3 flex items-center gap-2 text-[10px] font-mono tracking-widest">
            <span className="text-[#64748B]">DOCKED</span>
            <span className="text-[#E8EDF5]">
              {String(hud.successCount).padStart(2, "0")}
            </span>
            <span className="text-[#64748B]">/</span>
            <span className="text-[#94A3B8]">
              {String(hud.totalLaunches).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      {/* Top-right: latest binding result popup */}
      {hud.popup && (
        <div
          key={hud.popup.key}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 max-w-xs pointer-events-none animate-[fadeIn_0.3s_ease-out]"
        >
          <div
            className="border bg-[#0A1628]/90 backdrop-blur-sm p-3 sm:p-4"
            style={{ borderColor: `${cssHex(hud.popup.success ? PALETTE.gold : PALETTE.slate)}66` }}
          >
            <p
              className="text-[9px] sm:text-[10px] font-mono tracking-[0.4em] uppercase mb-1"
              style={{
                color: cssHex(
                  hud.popup.success ? PALETTE.gold : PALETTE.slate,
                ),
              }}
            >
              {hud.popup.success ? "// BINDING SUCCESS" : "// REJECTED"}
            </p>
            <p
              className="text-base sm:text-lg font-black uppercase tracking-tight text-[#E8EDF5]"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              {hud.popup.compoundName} → {hud.popup.receptorId}
            </p>
            <p className="text-[#64748B] text-[10px] sm:text-[11px] font-mono mt-1">
              affinity {(hud.popup.affinity * 100).toFixed(0)}%
            </p>
            <p className="text-[#CBD5E1] text-[11px] sm:text-xs mt-2 leading-snug">
              {hud.popup.message}
            </p>
          </div>
        </div>
      )}

      {/* Bottom: target toggle + molecule launcher chips + clear */}
      <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex flex-col gap-2 pointer-events-none">
        {/* Receptor toggle */}
        <div className="pointer-events-auto flex gap-2 self-start" role="radiogroup" aria-label="Target receptor">
          {RECEPTORS.map((r) => {
            const active = r.id === target;
            const hex = cssHex(r.color);
            return (
              <button
                key={r.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setTarget(r.id)}
                className="border bg-[#0A1628]/85 backdrop-blur-sm px-3 py-2 min-h-[44px] min-w-[64px] text-[11px] font-mono tracking-widest uppercase transition-all"
                style={{
                  borderColor: active ? hex : "#1E293B",
                  color: active ? hex : "#64748B",
                }}
              >
                {r.id}
              </button>
            );
          })}
          <button
            type="button"
            onClick={clearScene}
            aria-label="Clear all docked molecules"
            className="border border-[#C9A84C]/40 hover:border-[#C9A84C] bg-[#0A1628]/85 backdrop-blur-sm px-3 py-2 min-h-[44px] min-w-[44px] text-[#C9A84C] text-[11px] font-mono tracking-widest uppercase transition-all"
          >
            ⟲ Clear
          </button>
        </div>

        {/* Molecule chip launcher */}
        <div className="pointer-events-auto flex flex-wrap gap-2">
          {COMPOUNDS.map((c) => {
            const hex = cssHex(c.color);
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => launch(c)}
                aria-label={`Launch ${c.name} at ${target}`}
                className="border bg-[#0A1628]/85 backdrop-blur-sm px-3 py-2 min-h-[44px] text-[11px] font-mono tracking-widest uppercase transition-all hover:bg-[#0F1F3D]/85 flex items-center gap-2"
                style={{ borderColor: `${hex}66`, color: hex }}
              >
                <span
                  aria-hidden
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: hex }}
                />
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile-only hint when no molecule has been launched yet */}
      {!hud.totalLaunches && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none flex justify-center sm:hidden">
          <div className="border border-[#0D9488]/30 bg-[#0A1628]/70 backdrop-blur-sm px-4 py-2">
            <p className="text-[#0D9488] text-[10px] font-mono tracking-[0.3em] uppercase">
              Tap a molecule to dock
            </p>
          </div>
        </div>
      )}

      {/* Local keyframes for the popup fade-in. Kept inline so the
          component remains drop-in. */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default ReceptorDocking3D;
