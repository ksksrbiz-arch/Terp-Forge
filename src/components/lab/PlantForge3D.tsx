"use client";

/**
 * PlantForge3D — fully self-contained Three.js experience.
 *
 * A stylized cannabis plant grows inside a moody industrial forge while
 * eight key cannabinoid / terpene molecules fly in from the surrounding
 * darkness and attach to the plant with a glowing "forge" burst.
 *
 *   Spacebar  → pause / resume the animation
 *   R         → reset and replay the full sequence
 *   Mouse / touch drag → orbit the camera (auto-orbit otherwise)
 *   Click TF logo (bottom-left) → spawn a random bonus molecule
 *
 * Design notes:
 *   - Pure procedural geometry (no GLTF / external assets).
 *   - Honors `prefers-reduced-motion`: renders a single static frame.
 *   - All Three.js objects are tracked and disposed on unmount to keep
 *     the GPU clean across navigations.
 */

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  COMPOUNDS,
  FORGE_CANVAS_HEIGHT_CLASS,
  buildMolecule as buildMoleculeShared,
  disposeMolecule as disposeMoleculeShared,
} from "./forge3d";
import type { ForgeCompound } from "./forge3d";

// Per-compound timing (seconds): fly → burst → settle
const PHASE_FLY = 2.6;
const PHASE_BURST = 0.9;
const PHASE_SETTLE = 0.8;
const COMPOUND_DURATION = PHASE_FLY + PHASE_BURST + PHASE_SETTLE; // 4.3s
const TOTAL_DURATION = COMPOUND_DURATION * COMPOUNDS.length;

// ─────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────

interface HudState {
  index: number; // -1 before start
  compound: ForgeCompound | null;
  globalProgress: number; // 0..1 across the whole sequence
  compoundProgress: number; // 0..1 within current compound
  paused: boolean;
  done: boolean;
}

const INITIAL_HUD: HudState = {
  index: -1,
  compound: null,
  globalProgress: 0,
  compoundProgress: 0,
  paused: false,
  done: false,
};

export function PlantForge3D() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const pausedRef = useRef(false);
  const resetRef = useRef(false);
  const bonusRef = useRef(0); // counter consumed by RAF loop
  const [hud, setHud] = useState<HudState>(INITIAL_HUD);

  // Imperative controls bridged through refs so RAF closure stays stable.
  const togglePaused = () => {
    pausedRef.current = !pausedRef.current;
    setHud((h) => ({ ...h, paused: pausedRef.current }));
  };
  const triggerReset = () => {
    resetRef.current = true;
  };
  const triggerBonus = () => {
    bonusRef.current += 1;
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Mobile / low-power detection — stable for the lifetime of this effect.
    // Coarse pointer (touch) OR a narrow viewport implies a phone/tablet,
    // where we trade visual fidelity for frame rate and battery.
    const isMobile =
      typeof window !== "undefined" &&
      (window.matchMedia("(pointer: coarse)").matches ||
        window.innerWidth < 768);

    // ── Renderer ────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      // Antialias is expensive on mobile GPUs; rely on additive lighting and
      // the dark fog backdrop to hide aliasing instead.
      antialias: !isMobile,
      alpha: false,
      powerPreference: isMobile ? "low-power" : "high-performance",
    });
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, isMobile ? 1.25 : 2),
    );
    renderer.setSize(mount.clientWidth, mount.clientHeight, false);
    renderer.setClearColor(0x05080f, 1);
    // Shadow maps are the single biggest mobile cost; turn them off there.
    renderer.shadowMap.enabled = !isMobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.touchAction = "none";

    // ── Scene & camera ──────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05080f, 0.025);

    const camera = new THREE.PerspectiveCamera(
      // Wider FOV on portrait so the tall plant fits without manual zoom.
      isMobile ? 55 : 45,
      mount.clientWidth / mount.clientHeight,
      0.1,
      200,
    );
    // Pull the camera back a bit on mobile so the full plant + pedestal
    // are framed in landscape too.
    if (isMobile) camera.position.set(9, 6.5, 14);
    else camera.position.set(8, 6, 12);
    camera.lookAt(0, 3, 0);

    // ── Controls (orbit, also supports touch) ───────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 3, 0);
    controls.minDistance = 6;
    controls.maxDistance = 28;
    controls.minPolarAngle = Math.PI * 0.15;
    controls.maxPolarAngle = Math.PI * 0.55;
    controls.enablePan = false;
    controls.autoRotate = !reduceMotion;
    controls.autoRotateSpeed = 0.45;

    // User dragging temporarily suspends auto-rotate.
    let userInteractedAt = -Infinity;
    controls.addEventListener("start", () => {
      userInteractedAt = performance.now();
      controls.autoRotate = false;
    });
    controls.addEventListener("end", () => {
      userInteractedAt = performance.now();
    });

    // ── Lighting (industrial forge mood) ────────────────────────────────
    const hemi = new THREE.HemisphereLight(0x6b89c4, 0x0a0a14, 0.35);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xffe4b5, 1.1);
    keyLight.position.set(6, 12, 8);
    keyLight.castShadow = !isMobile;
    // Smaller shadow map on desktop too keeps GPU memory reasonable;
    // shadows are entirely disabled on mobile.
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -12;
    keyLight.shadow.camera.right = 12;
    keyLight.shadow.camera.top = 12;
    keyLight.shadow.camera.bottom = -2;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 40;
    keyLight.shadow.bias = -0.0008;
    scene.add(keyLight);

    // Rim light is purely aesthetic; skip it on mobile to halve directional
    // light cost.
    if (!isMobile) {
      const rimLight = new THREE.DirectionalLight(0x0d9488, 0.7);
      rimLight.position.set(-8, 6, -6);
      scene.add(rimLight);
    }

    // Pulsing forge fire — point light below the plant
    const forgeLight = new THREE.PointLight(0xff6a1a, 1.8, 18, 1.6);
    forgeLight.position.set(0, 0.6, 0);
    scene.add(forgeLight);

    // ── Forge environment ───────────────────────────────────────────────
    // Floor: dark brushed-metal plane (fewer segments on mobile).
    const floorGeo = new THREE.CircleGeometry(18, isMobile ? 32 : 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f1f3d,
      metalness: 0.85,
      roughness: 0.45,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = !isMobile;
    scene.add(floor);

    // Anvil-like pedestal under the plant
    const pedestalGroup = new THREE.Group();
    const pedTop = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.35, 2.0),
      new THREE.MeshStandardMaterial({
        color: 0x1a2540,
        metalness: 0.9,
        roughness: 0.35,
      }),
    );
    pedTop.position.y = 0.75;
    pedTop.castShadow = !isMobile;
    pedTop.receiveShadow = !isMobile;
    pedestalGroup.add(pedTop);

    const pedNeck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.95, 0.6, isMobile ? 12 : 16),
      new THREE.MeshStandardMaterial({
        color: 0x141b30,
        metalness: 0.9,
        roughness: 0.45,
      }),
    );
    pedNeck.position.y = 0.3;
    pedNeck.castShadow = !isMobile;
    pedestalGroup.add(pedNeck);

    // Glowing emission ring on top of pedestal
    const ringGeo = new THREE.RingGeometry(0.85, 1.05, isMobile ? 24 : 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xc9a84c,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.93;
    pedestalGroup.add(ring);
    scene.add(pedestalGroup);

    // Distant pillars to suggest a forge hall (fewer on mobile).
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x0a1224,
      metalness: 0.8,
      roughness: 0.6,
    });
    const pillarCount = isMobile ? 4 : 6;
    for (let i = 0; i < pillarCount; i++) {
      const a = (i / pillarCount) * Math.PI * 2;
      const r = 13;
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 9, 0.5),
        pillarMat,
      );
      pillar.position.set(Math.cos(a) * r, 4.5, Math.sin(a) * r);
      pillar.castShadow = !isMobile;
      scene.add(pillar);
    }

    // ── Embers (point particle system around the forge) ─────────────────
    const emberCount = isMobile ? 80 : 220;
    const emberPositions = new Float32Array(emberCount * 3);
    const emberSeeds = new Float32Array(emberCount);
    for (let i = 0; i < emberCount; i++) {
      const r = 0.5 + Math.random() * 6;
      const a = Math.random() * Math.PI * 2;
      emberPositions[i * 3] = Math.cos(a) * r;
      emberPositions[i * 3 + 1] = Math.random() * 8;
      emberPositions[i * 3 + 2] = Math.sin(a) * r;
      emberSeeds[i] = Math.random();
    }
    const emberGeo = new THREE.BufferGeometry();
    emberGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(emberPositions, 3),
    );
    const emberMat = new THREE.PointsMaterial({
      color: 0xffaa44,
      size: 0.08,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const embers = new THREE.Points(emberGeo, emberMat);
    scene.add(embers);

    // ── Cannabis plant (procedural, stylized) ───────────────────────────
    const plantGroup = new THREE.Group();
    plantGroup.position.y = 0.93;
    scene.add(plantGroup);

    // Stem
    const stemHeight = 4.2;
    const stemMat = new THREE.MeshStandardMaterial({
      color: 0x355c2c,
      roughness: 0.85,
      metalness: 0.0,
    });
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.12, stemHeight, 12),
      stemMat,
    );
    stem.position.y = stemHeight / 2;
    stem.castShadow = !isMobile;
    plantGroup.add(stem);

    // Build a stylized 7-finger cannabis-leaf geometry once (re-used).
    const buildLeafGeometry = (): THREE.BufferGeometry => {
      const shape = new THREE.Shape();
      // Fingers radiate from origin (leaf base) along +Y axis fan.
      // Tip lengths shaped like a classic 7-finger fan leaf.
      const fingerLengths = [0.55, 0.85, 1.15, 1.35, 1.15, 0.85, 0.55];
      const angleSpread = Math.PI * 0.78; // ~140°
      const n = fingerLengths.length;
      shape.moveTo(0, 0);
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        const angle = -angleSpread / 2 + t * angleSpread + Math.PI / 2;
        const len = fingerLengths[i];
        const tipX = Math.cos(angle) * len;
        const tipY = Math.sin(angle) * len;
        // Side control points create the serrated finger silhouette.
        const sideAngleA = angle - 0.18;
        const sideAngleB = angle + 0.18;
        const sideLenA = len * 0.35;
        const sideLenB = len * 0.35;
        if (i === 0) {
          shape.lineTo(
            Math.cos(sideAngleA) * sideLenA,
            Math.sin(sideAngleA) * sideLenA,
          );
        }
        shape.quadraticCurveTo(
          Math.cos(sideAngleA) * sideLenA,
          Math.sin(sideAngleA) * sideLenA,
          tipX,
          tipY,
        );
        shape.quadraticCurveTo(
          Math.cos(sideAngleB) * sideLenB,
          Math.sin(sideAngleB) * sideLenB,
          0,
          0,
        );
      }
      const geo = new THREE.ShapeGeometry(shape, 8);
      geo.computeVertexNormals();
      return geo;
    };
    const leafGeo = buildLeafGeometry();
    const leafMatA = new THREE.MeshStandardMaterial({
      color: 0x3d7a36,
      roughness: 0.7,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });
    const leafMatB = new THREE.MeshStandardMaterial({
      color: 0x4f9a45,
      roughness: 0.7,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });

    // Place leaf nodes at varying heights, alternating sides.
    const leaves: THREE.Mesh[] = [];
    const NODE_COUNT = 7;
    for (let i = 0; i < NODE_COUNT; i++) {
      const t = (i + 1) / (NODE_COUNT + 1);
      const yPos = t * stemHeight * 0.95;
      const baseRot = (i % 2 === 0 ? 0 : Math.PI) + (i * 0.4);
      // Two leaves per node (opposite phyllotaxy).
      for (let s = 0; s < 2; s++) {
        const leaf = new THREE.Mesh(
          leafGeo,
          i % 2 === 0 ? leafMatA : leafMatB,
        );
        const rot = baseRot + s * Math.PI;
        leaf.position.set(
          Math.cos(rot) * 0.05,
          yPos,
          Math.sin(rot) * 0.05,
        );
        // Pitch leaves outward & slightly down; stylized fan look.
        leaf.rotation.set(
          -Math.PI / 2 + 0.35,
          rot,
          0,
        );
        // Larger leaves lower, smaller higher.
        const scale = 1.05 - t * 0.55;
        leaf.scale.setScalar(scale * 1.4);
        leaf.castShadow = !isMobile;
        leaves.push(leaf);
        plantGroup.add(leaf);
      }
    }

    // Top cola: cluster of frosted "buds" (icosahedrons w/ emissive trim).
    const budGroup = new THREE.Group();
    budGroup.position.y = stemHeight - 0.1;
    plantGroup.add(budGroup);
    const budGeo = new THREE.IcosahedronGeometry(0.18, 0);
    const budMat = new THREE.MeshStandardMaterial({
      color: 0x6fb348,
      roughness: 0.5,
      metalness: 0.1,
      emissive: 0x1a3a18,
      emissiveIntensity: 0.6,
    });
    for (let i = 0; i < 14; i++) {
      const bud = new THREE.Mesh(budGeo, budMat);
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.3;
      bud.position.set(
        Math.cos(a) * r,
        Math.random() * 0.7,
        Math.sin(a) * r,
      );
      bud.scale.setScalar(0.6 + Math.random() * 0.8);
      bud.castShadow = !isMobile;
      budGroup.add(bud);
    }

    // Anchor points on the plant where molecules attach.
    const anchors: THREE.Vector3[] = [];
    for (let i = 0; i < COMPOUNDS.length; i++) {
      const t = (i + 0.5) / COMPOUNDS.length;
      const yLocal = 0.6 + t * (stemHeight - 0.6);
      const a = i * 2.39996; // golden angle for nice spread
      const r = 0.7 + Math.random() * 0.2;
      anchors.push(
        new THREE.Vector3(
          Math.cos(a) * r,
          plantGroup.position.y + yLocal,
          Math.sin(a) * r,
        ),
      );
    }

    // ── Molecule builder ────────────────────────────────────────────────
    interface MoleculeRuntime {
      group: THREE.Group;
      compound: ForgeCompound;
      anchor: THREE.Vector3;
      origin: THREE.Vector3; // spawn point
      glow: THREE.PointLight;
      halo: THREE.Mesh;
      bobSeed: number;
      attached: boolean;
    }

    const buildMolecule = (
      compound: ForgeCompound,
      anchor: THREE.Vector3,
      origin: THREE.Vector3,
    ): MoleculeRuntime => {
      const built = buildMoleculeShared(compound);
      built.group.position.copy(origin);
      scene.add(built.group);

      return {
        group: built.group,
        compound,
        anchor: anchor.clone(),
        origin: origin.clone(),
        glow: built.glow,
        halo: built.halo,
        bobSeed: Math.random() * Math.PI * 2,
        attached: false,
      };
    };

    const randomSpawnPoint = (): THREE.Vector3 => {
      const a = Math.random() * Math.PI * 2;
      const elev = 0.4 + Math.random() * 0.9; // mostly above
      const r = 14 + Math.random() * 6;
      return new THREE.Vector3(
        Math.cos(a) * r,
        plantGroup.position.y + elev * 4,
        Math.sin(a) * r,
      );
    };

    let molecules: MoleculeRuntime[] = [];

    const startSequence = () => {
      // Dispose any in-flight molecules.
      molecules.forEach((m) => disposeMolecule(m));
      molecules = [];
    };
    startSequence();

    const disposeMolecule = (m: MoleculeRuntime) => {
      disposeMoleculeShared(m.group);
    };

    // ── Animation loop ──────────────────────────────────────────────────
    let raf = 0;
    let last = performance.now();
    let elapsed = 0; // seconds since sequence start
    let lastIndex = -1;

    const easeInOut = (t: number) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // Resume auto-rotate after 2.5s of no user interaction.
      if (
        !reduceMotion &&
        !controls.autoRotate &&
        now - userInteractedAt > 2500
      ) {
        controls.autoRotate = true;
      }

      // Reset request
      if (resetRef.current) {
        resetRef.current = false;
        elapsed = 0;
        lastIndex = -1;
        molecules.forEach((m) => disposeMolecule(m));
        molecules = [];
        setHud((h) => ({ ...INITIAL_HUD, paused: h.paused }));
      }

      // Bonus molecule request (consume counter)
      while (bonusRef.current > 0) {
        bonusRef.current -= 1;
        const compound =
          COMPOUNDS[Math.floor(Math.random() * COMPOUNDS.length)];
        const anchor = new THREE.Vector3(
          (Math.random() - 0.5) * 1.4,
          plantGroup.position.y + 0.8 + Math.random() * stemHeight * 0.8,
          (Math.random() - 0.5) * 1.4,
        );
        const m = buildMolecule(compound, anchor, randomSpawnPoint());
        // Bonus molecules animate independently with their own clock.
        // We tag with negative spawnAt offset relative to elapsed.
        (m as MoleculeRuntime & { bonusStart: number }).bonusStart = elapsed;
        molecules.push(m);
      }

      const isPaused = pausedRef.current;
      if (!isPaused && !reduceMotion) {
        elapsed += dt;
      }

      // Determine current compound index in the main sequence.
      let mainIndex = Math.floor(elapsed / COMPOUND_DURATION);
      const sequenceDone = mainIndex >= COMPOUNDS.length;
      if (sequenceDone) mainIndex = COMPOUNDS.length - 1;
      const localT = sequenceDone
        ? 1
        : (elapsed - mainIndex * COMPOUND_DURATION) / COMPOUND_DURATION;

      // Spawn the next compound when index advances.
      if (!sequenceDone && mainIndex !== lastIndex) {
        lastIndex = mainIndex;
        const compound = COMPOUNDS[mainIndex];
        const m = buildMolecule(
          compound,
          anchors[mainIndex],
          randomSpawnPoint(),
        );
        molecules.push(m);
      }

      // Animate each molecule.
      molecules = molecules.filter((m) => {
        // Determine local timing: scripted vs bonus
        const bonusStart = (m as MoleculeRuntime & { bonusStart?: number })
          .bonusStart;
        let mt: number;
        if (typeof bonusStart === "number") {
          mt = elapsed - bonusStart;
        } else {
          // Scripted: belongs to its compound's slot in the main sequence.
          const slot = COMPOUNDS.indexOf(m.compound);
          mt =
            slot >= 0 && slot < COMPOUNDS.length
              ? elapsed - slot * COMPOUND_DURATION
              : elapsed;
        }
        if (mt < 0) {
          m.group.visible = false;
          return true;
        }
        m.group.visible = true;

        // Phase: fly-in
        if (mt <= PHASE_FLY) {
          const t = easeInOut(THREE.MathUtils.clamp(mt / PHASE_FLY, 0, 1));
          m.group.position.lerpVectors(m.origin, m.anchor, t);
          m.group.rotation.x += dt * 1.3;
          m.group.rotation.y += dt * 1.7;
          m.glow.intensity = 0.6 + t * 1.6;
          (m.halo.material as THREE.MeshBasicMaterial).opacity = 0.15 + t * 0.4;
          m.halo.scale.setScalar(0.6 + t * 0.6);
          m.halo.lookAt(camera.position);
        } else if (mt <= PHASE_FLY + PHASE_BURST) {
          // Burst on contact: flash + ring expansion.
          const t = (mt - PHASE_FLY) / PHASE_BURST;
          m.group.position.copy(m.anchor);
          m.glow.intensity = 4.0 * (1 - t) + 0.8;
          const haloMat = m.halo.material as THREE.MeshBasicMaterial;
          haloMat.opacity = 0.85 * (1 - t);
          m.halo.scale.setScalar(1 + t * 2.4);
          m.halo.lookAt(camera.position);
          m.group.rotation.x += dt * 0.8;
          m.group.rotation.y += dt * 1.1;
          m.attached = true;
        } else {
          // Settle: subtle bob + rotation while attached.
          const bobT = (mt - PHASE_FLY - PHASE_BURST + m.bobSeed) % 1000;
          const bob = Math.sin(bobT * 1.4) * 0.04;
          m.group.position.set(
            m.anchor.x,
            m.anchor.y + bob,
            m.anchor.z,
          );
          m.group.rotation.y += dt * 0.6;
          m.glow.intensity = 0.9 + Math.sin(bobT * 2.0) * 0.25;
          (m.halo.material as THREE.MeshBasicMaterial).opacity = 0.0;
          m.attached = true;
        }

        // Bonus molecules expire after ~12s to avoid clutter.
        if (typeof bonusStart === "number" && mt > 12) {
          disposeMolecule(m);
          return false;
        }
        return true;
      });

      // Forge light flicker
      forgeLight.intensity =
        1.4 + Math.sin(elapsed * 7.3) * 0.35 + Math.sin(elapsed * 13.1) * 0.2;

      // Embers drift up
      const posAttr = embers.geometry.getAttribute(
        "position",
      ) as THREE.BufferAttribute;
      for (let i = 0; i < emberCount; i++) {
        const idx = i * 3 + 1;
        let y = posAttr.array[idx] as number;
        y += dt * (0.4 + emberSeeds[i] * 0.8);
        if (y > 9) y = 0.1;
        (posAttr.array as Float32Array)[idx] = y;
      }
      posAttr.needsUpdate = true;

      // Plant breathing: gentle vertical scale + sway
      const breathe = 1 + Math.sin(elapsed * 0.9) * 0.012;
      plantGroup.scale.set(1, breathe, 1);
      plantGroup.rotation.y = Math.sin(elapsed * 0.25) * 0.04;

      // HUD update (throttled to ~10/sec is fine; React batches)
      const hudCompound = sequenceDone
        ? null
        : COMPOUNDS[mainIndex] ?? null;
      const globalProgress = THREE.MathUtils.clamp(
        elapsed / TOTAL_DURATION,
        0,
        1,
      );
      const compoundProgress = sequenceDone ? 1 : THREE.MathUtils.clamp(localT, 0, 1);
      setHud((prev) => {
        if (
          prev.index === (sequenceDone ? COMPOUNDS.length : mainIndex) &&
          prev.done === sequenceDone &&
          Math.abs(prev.compoundProgress - compoundProgress) < 0.01 &&
          Math.abs(prev.globalProgress - globalProgress) < 0.005 &&
          prev.paused === isPaused
        ) {
          return prev;
        }
        return {
          ...prev,
          index: sequenceDone ? COMPOUNDS.length : mainIndex,
          compound: hudCompound,
          globalProgress,
          compoundProgress,
          paused: isPaused,
          done: sequenceDone,
        };
      });

      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };

    // Visibility-aware RAF: pause the loop entirely when the canvas is
    // off-screen or the tab is hidden. This is critical on mobile where
    // a hidden WebGL canvas still drains battery.
    let running = false;
    let onScreen = true;
    let tabVisible =
      typeof document === "undefined" || !document.hidden;
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
      // Single static render for reduced-motion users.
      controls.update();
      renderer.render(scene, camera);
      // Defer state update to avoid a synchronous setState during the effect
      // (which would trigger a cascading render).
      queueMicrotask(() =>
        setHud({
          index: -1,
          compound: null,
          globalProgress: 0,
          compoundProgress: 0,
          paused: true,
          done: false,
        }),
      );
    } else {
      startLoop();
    }

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        onScreen = entry.isIntersecting;
        if (onScreen) startLoop();
        else stopLoop();
      },
      { threshold: 0.01 },
    );
    io.observe(mount);

    const onVisibility = () => {
      tabVisible = !document.hidden;
      if (tabVisible) startLoop();
      else stopLoop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // ── Resize handling ─────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(mount);

    // ── Keyboard controls (scoped: only when canvas is in viewport) ─────
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable) {
          return;
        }
      }
      // Only handle keys when component is at least partially visible.
      const rect = mount.getBoundingClientRect();
      const visible =
        rect.bottom > 0 &&
        rect.top < window.innerHeight &&
        rect.right > 0 &&
        rect.left < window.innerWidth;
      if (!visible) return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePaused();
      } else if (e.key === "r" || e.key === "R") {
        triggerReset();
      }
    };
    window.addEventListener("keydown", onKey);

    // ── Cleanup ─────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(raf);
      running = false;
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
      ro.disconnect();
      controls.dispose();
      molecules.forEach((m) => disposeMolecule(m));
      molecules = [];
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
    };
  }, []);

  // ── React HUD (overlay) ─────────────────────────────────────────────────
  const compoundColorHex = hud.compound
    ? "#" + hud.compound.color.toString(16).padStart(6, "0")
    : "#0D9488";

  return (
    <div className={`relative w-full ${FORGE_CANVAS_HEIGHT_CLASS} border border-[#C9A84C]/20 bg-[#05080F] overflow-hidden select-none`}>
      {/* 3D canvas mount */}
      <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />

      {/* Top-left status panel */}
      <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-auto sm:max-w-sm pointer-events-none">
        <div
          className="border bg-[#0A1628]/85 backdrop-blur-sm p-3 sm:p-4 transition-colors"
          style={{ borderColor: `${compoundColorHex}55` }}
        >
          <p
            className="text-[9px] sm:text-[10px] font-mono tracking-[0.4em] uppercase mb-1"
            style={{ color: compoundColorHex }}
          >
            {hud.done
              ? "// SEQUENCE COMPLETE"
              : hud.compound
                ? "// FORGING COMPOUND"
                : "// INITIALIZING FORGE"}
          </p>
          <p
            className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#E8EDF5]"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            {hud.compound?.name ?? (hud.done ? "FULL SPECTRUM" : "—")}
          </p>
          {hud.compound ? (
            <p className="text-[#64748B] text-[10px] sm:text-[11px] font-mono mt-1 truncate">
              <span className="hidden sm:inline">
                {hud.compound.formula} · {hud.compound.description}
              </span>
              <span className="sm:hidden">{hud.compound.formula}</span>
            </p>
          ) : (
            <p className="text-[#64748B] text-[10px] sm:text-[11px] font-mono mt-1">
              {hud.done
                ? "All eight compounds attached. Tap ⟲ to replay."
                : "Spinning up the forge..."}
            </p>
          )}

          {/* Compound progress bar */}
          <div className="mt-3 h-1.5 bg-[#1E293B] overflow-hidden">
            <div
              className="h-full transition-[width] duration-150"
              style={{
                width: `${hud.compoundProgress * 100}%`,
                backgroundColor: compoundColorHex,
              }}
            />
          </div>
          {/* Global progress bar */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[#64748B] text-[9px] font-mono tracking-widest">
              {String(Math.min(hud.index + 1, COMPOUNDS.length)).padStart(
                2,
                "0",
              )}
              /{String(COMPOUNDS.length).padStart(2, "0")}
            </span>
            <div className="flex-1 h-0.5 bg-[#1E293B] overflow-hidden">
              <div
                className="h-full bg-[#C9A84C] transition-[width] duration-150"
                style={{ width: `${hud.globalProgress * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top-right controls hint */}
      <div className="absolute top-4 right-4 pointer-events-none hidden sm:block">
        <div className="border border-[#0D9488]/30 bg-[#0A1628]/85 backdrop-blur-sm p-3 text-right">
          <p className="text-[#0D9488] text-[9px] font-mono tracking-[0.3em] uppercase mb-2">
            {"// CONTROLS"}
          </p>
          <ul className="text-[#64748B] text-[10px] font-mono space-y-1">
            <li>
              <span className="text-[#E8EDF5]">SPACE</span> · pause
            </li>
            <li>
              <span className="text-[#E8EDF5]">R</span> · reset
            </li>
            <li>
              <span className="text-[#E8EDF5]">DRAG</span> · orbit
            </li>
          </ul>
        </div>
      </div>

      {/* Pause indicator */}
      {hud.paused && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="border border-[#C9A84C]/40 bg-[#0A1628]/80 backdrop-blur-sm px-6 py-3">
            <p
              className="text-[#C9A84C] text-xs font-mono tracking-[0.4em] uppercase"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              ▌▌ PAUSED
            </p>
          </div>
        </div>
      )}

      {/* Bottom action row */}
      <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex flex-wrap items-end justify-between gap-2 sm:gap-3 pointer-events-none">
        {/* Logo button — click to spawn bonus molecule */}
        <button
          type="button"
          onClick={triggerBonus}
          className="pointer-events-auto group flex items-center gap-2 sm:gap-3 border border-[#C9A84C]/40 hover:border-[#C9A84C] bg-[#0A1628]/85 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-2.5 min-h-[44px] transition-all hover:bg-[#0F1F3D]/85"
          aria-label="Spawn a bonus molecule"
        >
          <span
            className="inline-block w-5 h-5 sm:w-6 sm:h-6 border border-[#C9A84C] rotate-45 group-hover:rotate-[225deg] transition-transform duration-700"
            aria-hidden
          >
            <span className="block w-full h-full bg-[#C9A84C]/30" />
          </span>
          <span className="flex flex-col items-start leading-none">
            <span
              className="text-[#C9A84C] text-sm font-black tracking-widest uppercase"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              TF
            </span>
            <span className="text-[#64748B] text-[9px] font-mono tracking-widest uppercase mt-0.5">
              + bonus
            </span>
          </span>
        </button>

        {/* On-screen controls (primary on touch, supplemental on desktop) */}
        <div className="pointer-events-auto flex gap-2">
          <button
            type="button"
            onClick={togglePaused}
            aria-label={hud.paused ? "Resume animation" : "Pause animation"}
            className="border border-[#0D9488]/40 hover:border-[#0D9488] bg-[#0A1628]/85 backdrop-blur-sm px-3 py-2 sm:px-4 min-h-[44px] min-w-[44px] text-[#0D9488] text-[10px] font-mono tracking-widest uppercase transition-all"
          >
            {hud.paused ? "▶ Resume" : "▌▌ Pause"}
          </button>
          <button
            type="button"
            onClick={triggerReset}
            aria-label="Reset animation"
            className="border border-[#C9A84C]/40 hover:border-[#C9A84C] bg-[#0A1628]/85 backdrop-blur-sm px-3 py-2 sm:px-4 min-h-[44px] min-w-[44px] text-[#C9A84C] text-[10px] font-mono tracking-widest uppercase transition-all"
          >
            ⟲ Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlantForge3D;
