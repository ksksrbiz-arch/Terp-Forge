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
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import {
  COMPOUNDS,
  FORGE_CANVAS_HEIGHT_CLASS,
  PALETTE,
  HudPanel,
  HudCaption,
  HudProgress,
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
    // Physically-based tone mapping amplifies the molten/forge aesthetic.
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isMobile ? 0.85 : 1.0;
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

    // ── Post-processing composer (desktop only for perf) ─────────────────
    const cw = mount.clientWidth;
    const ch = mount.clientHeight;
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    if (!isMobile) {
      const bloom = new UnrealBloomPass(
        new THREE.Vector2(cw, ch),
        /* strength */ 1.35,
        /* radius   */ 0.55,
        /* threshold */ 0.05,
      );
      composer.addPass(bloom);
    }
    composer.addPass(new OutputPass());

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
    // Slightly stronger hemisphere to fill shadows on the plant.
    const hemi = new THREE.HemisphereLight(0x7090d0, 0x0a0a14, 0.5);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xffe4b5, 1.4);
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
      const rimLight = new THREE.DirectionalLight(0x0d9488, 0.9);
      rimLight.position.set(-8, 6, -6);
      scene.add(rimLight);
      // Second fill from below to catch the underside of leaves.
      const fillLight = new THREE.DirectionalLight(0xff8c00, 0.4);
      fillLight.position.set(0, -4, 4);
      scene.add(fillLight);
    }

    // Pulsing forge fire — stronger so the bloom picks it up dramatically.
    const forgeLight = new THREE.PointLight(0xff6a1a, 3.5, 22, 1.5);
    forgeLight.position.set(0, 0.6, 0);
    scene.add(forgeLight);
    // Secondary cooler forge light for color contrast.
    const forgeLightBlue = new THREE.PointLight(0x3060ff, 1.2, 12, 2);
    forgeLightBlue.position.set(0, 1.2, 0);
    scene.add(forgeLightBlue);

    // ── Forge environment ───────────────────────────────────────────────
    // Floor: dark brushed-metal plane (fewer segments on mobile).
    const floorGeo = new THREE.CircleGeometry(18, isMobile ? 32 : 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0a1628,
      metalness: 0.92,
      roughness: 0.38,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = !isMobile;
    scene.add(floor);

    // Glowing concentric floor rings — additive blending so the bloom
    // turns them into luminous halos on the floor surface.
    if (!isMobile) {
      const floorRingRadii = [2.2, 4.5, 7.2, 10.8];
      const floorRingColors = [0xc9a84c, 0x0d9488, 0xc9a84c, 0x0d3060];
      floorRingRadii.forEach((r, ri) => {
        const points: THREE.Vector3[] = [];
        const segs = 96;
        for (let i = 0; i <= segs; i++) {
          const a = (i / segs) * Math.PI * 2;
          points.push(new THREE.Vector3(Math.cos(a) * r, 0.012, Math.sin(a) * r));
        }
        const rGeo = new THREE.BufferGeometry().setFromPoints(points);
        const rMat = new THREE.LineBasicMaterial({
          color: floorRingColors[ri] ?? 0xc9a84c,
          transparent: true,
          opacity: ri === 0 ? 0.75 : 0.35 - ri * 0.06,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        scene.add(new THREE.Line(rGeo, rMat));
      });
    }

    // Forge fire pit — a glowing cone at the center of the pedestal base.
    // The emissive material feeds the bloom for a proper fire-glow look.
    const firePitGeo = new THREE.ConeGeometry(0.7, 0.55, isMobile ? 12 : 24, 1, true);
    const firePitMat = new THREE.MeshStandardMaterial({
      color: 0xff4400,
      emissive: 0xff6a1a,
      emissiveIntensity: 2.5,
      metalness: 0.0,
      roughness: 1.0,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.7,
    });
    const firePit = new THREE.Mesh(firePitGeo, firePitMat);
    firePit.position.set(0, 0.28, 0);
    firePit.rotation.y = Math.PI / 8;
    scene.add(firePit);

    // Inner fire glow disc.
    const fireDiscGeo = new THREE.CircleGeometry(0.55, isMobile ? 16 : 32);
    const fireDiscMat = new THREE.MeshBasicMaterial({
      color: 0xff9933,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const fireDisc = new THREE.Mesh(fireDiscGeo, fireDiscMat);
    fireDisc.rotation.x = -Math.PI / 2;
    fireDisc.position.y = 0.02;
    scene.add(fireDisc);

    // Anvil-like pedestal under the plant
    const pedestalGroup = new THREE.Group();
    const pedTop = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.35, 2.0),
      new THREE.MeshStandardMaterial({
        color: 0x1a2540,
        metalness: 0.92,
        roughness: 0.3,
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
        metalness: 0.92,
        roughness: 0.4,
      }),
    );
    pedNeck.position.y = 0.3;
    pedNeck.castShadow = !isMobile;
    pedestalGroup.add(pedNeck);

    // Glowing emission ring on top of pedestal — high emissive for bloom.
    const ringGeo = new THREE.RingGeometry(0.85, 1.05, isMobile ? 24 : 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffd060,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.93;
    pedestalGroup.add(ring);
    // Second, wider ring for a double-halo look.
    const ringOuter = new THREE.Mesh(
      new THREE.RingGeometry(1.1, 1.22, isMobile ? 24 : 64),
      new THREE.MeshBasicMaterial({
        color: 0x0d9488,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    ringOuter.rotation.x = -Math.PI / 2;
    ringOuter.position.y = 0.91;
    pedestalGroup.add(ringOuter);
    scene.add(pedestalGroup);

    // Distant pillars to suggest a forge hall (fewer on mobile).
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x080e1e,
      emissive: 0x040810,
      emissiveIntensity: 0.5,
      metalness: 0.85,
      roughness: 0.55,
    });
    const pillarCapMat = new THREE.MeshStandardMaterial({
      color: 0x0d9488,
      emissive: 0x0d9488,
      emissiveIntensity: 0.8,
      metalness: 0.5,
      roughness: 0.3,
    });
    const pillarCount = isMobile ? 4 : 8;
    for (let i = 0; i < pillarCount; i++) {
      const a = (i / pillarCount) * Math.PI * 2;
      const r = 13;
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 10, 0.55),
        pillarMat,
      );
      pillar.position.set(Math.cos(a) * r, 5, Math.sin(a) * r);
      pillar.castShadow = !isMobile;
      scene.add(pillar);
      // Glowing cap on each pillar — feeds bloom for a corridor-of-lights look.
      if (!isMobile) {
        const cap = new THREE.Mesh(
          new THREE.BoxGeometry(0.7, 0.18, 0.7),
          pillarCapMat,
        );
        cap.position.set(Math.cos(a) * r, 10.1, Math.sin(a) * r);
        scene.add(cap);
      }
    }

    // ── Embers (point particle system around the forge) ─────────────────
    // More embers, 2x size so they register under bloom.
    const emberCount = isMobile ? 100 : 320;
    const emberPositions = new Float32Array(emberCount * 3);
    const emberSeeds = new Float32Array(emberCount);
    const emberSizes = new Float32Array(emberCount);
    for (let i = 0; i < emberCount; i++) {
      const r = 0.4 + Math.random() * 7;
      const a = Math.random() * Math.PI * 2;
      emberPositions[i * 3] = Math.cos(a) * r;
      emberPositions[i * 3 + 1] = Math.random() * 9;
      emberPositions[i * 3 + 2] = Math.sin(a) * r;
      emberSeeds[i] = Math.random();
      // Varied sizes: a few bright sparks mixed with tiny embers.
      emberSizes[i] = 0.06 + Math.random() * 0.18;
    }
    const emberGeo = new THREE.BufferGeometry();
    emberGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(emberPositions, 3),
    );
    const emberMat = new THREE.PointsMaterial({
      color: 0xffcc55,
      size: 0.13,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const embers = new THREE.Points(emberGeo, emberMat);
    scene.add(embers);

    // Secondary cooler-colored sparks (teal/blue) for color variety.
    if (!isMobile) {
      const sparkCount = 80;
      const sparkPos = new Float32Array(sparkCount * 3);
      const sparkSeeds = new Float32Array(sparkCount);
      for (let i = 0; i < sparkCount; i++) {
        const r = 1.2 + Math.random() * 4.5;
        const a = Math.random() * Math.PI * 2;
        sparkPos[i * 3] = Math.cos(a) * r;
        sparkPos[i * 3 + 1] = Math.random() * 7;
        sparkPos[i * 3 + 2] = Math.sin(a) * r;
        sparkSeeds[i] = Math.random();
      }
      const sparkGeo = new THREE.BufferGeometry();
      sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));
      const sparkMat = new THREE.PointsMaterial({
        color: 0x40e0d0,
        size: 0.09,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const sparks = new THREE.Points(sparkGeo, sparkMat);
      scene.add(sparks);
      // Animate sparks with same drift logic as embers (closure captures refs).
      // Store reference for tick loop to animate.
      scene.userData.sparks = sparks;
      scene.userData.sparkSeeds = sparkSeeds;
      scene.userData.sparkCount = sparkCount;
    }

    // ── Cannabis plant (procedural, stylized) ───────────────────────────
    const plantGroup = new THREE.Group();
    plantGroup.position.y = 0.93;
    scene.add(plantGroup);

    // Stem — slightly emissive so the bloom adds a subtle green aura.
    const stemHeight = 4.2;
    const stemMat = new THREE.MeshStandardMaterial({
      color: 0x3d6e32,
      emissive: 0x0f2209,
      emissiveIntensity: 0.6,
      roughness: 0.75,
      metalness: 0.05,
    });
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.13, stemHeight, 14),
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
      const geo = new THREE.ShapeGeometry(shape, 10);
      geo.computeVertexNormals();
      return geo;
    };
    const leafGeo = buildLeafGeometry();
    // Two leaf materials with subtle emissive for bloom pickup.
    const leafMatA = new THREE.MeshStandardMaterial({
      color: 0x3d7a36,
      emissive: 0x0d2208,
      emissiveIntensity: 0.5,
      roughness: 0.65,
      metalness: 0.02,
      side: THREE.DoubleSide,
    });
    const leafMatB = new THREE.MeshStandardMaterial({
      color: 0x4f9a45,
      emissive: 0x0d2a08,
      emissiveIntensity: 0.55,
      roughness: 0.65,
      metalness: 0.02,
      side: THREE.DoubleSide,
    });

    // Midrib (central vein) geometry — a single line per leaf.
    // Gets added to the plantGroup directly but positioned when the leaf is.
    const midribMat = new THREE.LineBasicMaterial({
      color: 0x7dca5a,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
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
        leaf.rotation.set(-Math.PI / 2 + 0.35, rot, 0);
        // Larger leaves lower, smaller higher.
        const scale = 1.05 - t * 0.55;
        leaf.scale.setScalar(scale * 1.4);
        leaf.castShadow = !isMobile;
        leaves.push(leaf);
        plantGroup.add(leaf);

        // Midrib vein — add in leaf local space via a child.
        if (!isMobile) {
          const leafLen = (scale * 1.4) * 1.35; // approximate visible length
          const veinPts = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, leafLen * 0.85, 0),
          ];
          const veinGeo = new THREE.BufferGeometry().setFromPoints(veinPts);
          const vein = new THREE.Line(veinGeo, midribMat);
          leaf.add(vein);
        }
      }
    }

    // Top cola: dense cluster of frosted "buds" — high emissive for bloom.
    const budGroup = new THREE.Group();
    budGroup.position.y = stemHeight - 0.1;
    plantGroup.add(budGroup);
    const budGeo = new THREE.IcosahedronGeometry(0.19, 1);
    const budMat = new THREE.MeshStandardMaterial({
      color: 0x6fb348,
      emissive: 0x28520d,
      emissiveIntensity: 1.0,
      roughness: 0.45,
      metalness: 0.08,
    });
    for (let i = 0; i < 18; i++) {
      const bud = new THREE.Mesh(budGeo, budMat);
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.36;
      bud.position.set(
        Math.cos(a) * r,
        Math.random() * 0.85,
        Math.sin(a) * r,
      );
      bud.scale.setScalar(0.55 + Math.random() * 0.95);
      bud.castShadow = !isMobile;
      budGroup.add(bud);
    }

    // Trichome glow — a point cloud of tiny emissive dots around the bud
    // cluster. Under bloom these read as a frosty crystalline aura.
    if (!isMobile) {
      const trichCount = 120;
      const trichPos = new Float32Array(trichCount * 3);
      for (let i = 0; i < trichCount; i++) {
        const a = Math.random() * Math.PI * 2;
        const elev = Math.random() * Math.PI;
        const r = 0.55 + Math.random() * 0.35;
        trichPos[i * 3] = Math.sin(elev) * Math.cos(a) * r;
        trichPos[i * 3 + 1] = 0.25 + Math.cos(elev) * r * 0.5;
        trichPos[i * 3 + 2] = Math.sin(elev) * Math.sin(a) * r;
      }
      const trichGeo = new THREE.BufferGeometry();
      trichGeo.setAttribute("position", new THREE.BufferAttribute(trichPos, 3));
      const trichMat = new THREE.PointsMaterial({
        color: 0xeaf5d0,
        size: 0.055,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      });
      budGroup.add(new THREE.Points(trichGeo, trichMat));
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
      /** Streak trail behind the molecule during fly-in. */
      trail: THREE.Line;
      trailPositions: Float32Array;
      trailHead: number;
      /** Expanding ring shockwave that fires on burst. */
      shock: THREE.Mesh;
    }

    /** Number of trail samples kept per molecule. Lower on mobile. */
    const TRAIL_LEN = isMobile ? 18 : 32;

    const buildMolecule = (
      compound: ForgeCompound,
      anchor: THREE.Vector3,
      origin: THREE.Vector3,
    ): MoleculeRuntime => {
      const built = buildMoleculeShared(compound);
      built.group.position.copy(origin);
      scene.add(built.group);

      // Trail — a Line whose buffer is rotated as the head advances. Starts
      // collapsed at the origin so the first frame doesn't draw a streak from
      // (0,0,0). Additive blending sells the "molten" look.
      const trailPositions = new Float32Array(TRAIL_LEN * 3);
      for (let i = 0; i < TRAIL_LEN; i++) {
        trailPositions[i * 3] = origin.x;
        trailPositions[i * 3 + 1] = origin.y;
        trailPositions[i * 3 + 2] = origin.z;
      }
      const trailGeo = new THREE.BufferGeometry();
      trailGeo.setAttribute(
        "position",
        new THREE.BufferAttribute(trailPositions, 3),
      );
      const trailMat = new THREE.LineBasicMaterial({
        color: compound.color,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const trail = new THREE.Line(trailGeo, trailMat);
      scene.add(trail);

      // Shockwave ring — sits on the molecule's anchor, scales up + fades
      // out across the burst phase. Disabled (scale 0) until burst begins.
      const shockGeo = new THREE.RingGeometry(0.4, 0.55, 48);
      const shockMat = new THREE.MeshBasicMaterial({
        color: compound.color,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const shock = new THREE.Mesh(shockGeo, shockMat);
      shock.scale.setScalar(0.0001);
      scene.add(shock);

      return {
        group: built.group,
        compound,
        anchor: anchor.clone(),
        origin: origin.clone(),
        glow: built.glow,
        halo: built.halo,
        bobSeed: Math.random() * Math.PI * 2,
        attached: false,
        trail,
        trailPositions,
        trailHead: 0,
        shock,
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
      // Free trail + shockwave that we own (not part of the shared molecule).
      scene.remove(m.trail);
      m.trail.geometry.dispose();
      (m.trail.material as THREE.Material).dispose();
      scene.remove(m.shock);
      m.shock.geometry.dispose();
      (m.shock.material as THREE.Material).dispose();
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
          // Ramp glow higher so it feeds the bloom strongly during approach.
          m.glow.intensity = 0.8 + t * 3.5;
          (m.halo.material as THREE.MeshBasicMaterial).opacity = 0.15 + t * 0.55;
          m.halo.scale.setScalar(0.7 + t * 0.8);
          m.halo.lookAt(camera.position);

          // Trail: rotate the buffer so the head is at the molecule's current
          // position; older samples drift away. Brightest at the head, fading
          // toward the tail (line color is uniform — opacity is what we drive).
          const trailMat = m.trail.material as THREE.LineBasicMaterial;
          trailMat.opacity = 0.4 + t * 0.55;
          const tp = m.trailPositions;
          for (let i = 0; i < TRAIL_LEN - 1; i++) {
            tp[i * 3] = tp[(i + 1) * 3];
            tp[i * 3 + 1] = tp[(i + 1) * 3 + 1];
            tp[i * 3 + 2] = tp[(i + 1) * 3 + 2];
          }
          tp[(TRAIL_LEN - 1) * 3] = m.group.position.x;
          tp[(TRAIL_LEN - 1) * 3 + 1] = m.group.position.y;
          tp[(TRAIL_LEN - 1) * 3 + 2] = m.group.position.z;
          (m.trail.geometry.getAttribute("position") as THREE.BufferAttribute)
            .needsUpdate = true;
        } else if (mt <= PHASE_FLY + PHASE_BURST) {
          // Burst on contact: flash + halo expansion + shockwave ring + flash.
          const t = (mt - PHASE_FLY) / PHASE_BURST;
          m.group.position.copy(m.anchor);
          // Higher peak so bloom flares dramatically on contact.
          m.glow.intensity = 12.0 * (1 - t) + 1.2;
          const haloMat = m.halo.material as THREE.MeshBasicMaterial;
          haloMat.opacity = 0.9 * (1 - t);
          m.halo.scale.setScalar(1.2 + t * 3.5);
          m.halo.lookAt(camera.position);
          m.group.rotation.x += dt * 0.8;
          m.group.rotation.y += dt * 1.1;
          m.attached = true;

          // Trail rapidly thins out during the burst.
          const trailMat = m.trail.material as THREE.LineBasicMaterial;
          trailMat.opacity = Math.max(0, 0.95 * (1 - t * 1.6));

          // Shockwave: expand from anchor, fade as it grows.
          m.shock.position.copy(m.anchor);
          m.shock.lookAt(camera.position);
          const shockScale = 0.5 + t * 6.0;
          m.shock.scale.setScalar(shockScale);
          (m.shock.material as THREE.MeshBasicMaterial).opacity =
            0.9 * (1 - t);
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
          // Steady glow with a heartbeat pulse — high enough for bloom.
          m.glow.intensity = 1.5 + Math.sin(bobT * 2.0) * 0.55;
          (m.halo.material as THREE.MeshBasicMaterial).opacity = 0.0;
          // Trail + shock are spent — make sure they're invisible.
          (m.trail.material as THREE.LineBasicMaterial).opacity = 0;
          (m.shock.material as THREE.MeshBasicMaterial).opacity = 0;
          m.attached = true;
        }

        // Bonus molecules expire after ~12s to avoid clutter.
        if (typeof bonusStart === "number" && mt > 12) {
          disposeMolecule(m);
          return false;
        }
        return true;
      });

      // Forge light flicker — increased range so bloom picks up the floor.
      forgeLight.intensity =
        3.0 + Math.sin(elapsed * 7.3) * 0.8 + Math.sin(elapsed * 13.1) * 0.45;
      forgeLightBlue.intensity =
        1.0 + Math.sin(elapsed * 5.1 + 1.0) * 0.35;

      // Embers drift up
      const posAttr = embers.geometry.getAttribute(
        "position",
      ) as THREE.BufferAttribute;
      for (let i = 0; i < emberCount; i++) {
        const idx = i * 3 + 1;
        let y = posAttr.array[idx] as number;
        y += dt * (0.5 + emberSeeds[i] * 0.9);
        if (y > 9) y = 0.1;
        (posAttr.array as Float32Array)[idx] = y;
      }
      posAttr.needsUpdate = true;

      // Animate secondary sparks if they exist.
      if (scene.userData.sparks) {
        const sp = scene.userData.sparks as THREE.Points;
        const spAttr = sp.geometry.getAttribute("position") as THREE.BufferAttribute;
        const spSeeds = scene.userData.sparkSeeds as Float32Array;
        const spCount = scene.userData.sparkCount as number;
        for (let i = 0; i < spCount; i++) {
          const idx = i * 3 + 1;
          let y = spAttr.array[idx] as number;
          y += dt * (0.3 + spSeeds[i] * 0.6);
          if (y > 7) y = 0.1;
          (spAttr.array as Float32Array)[idx] = y;
        }
        spAttr.needsUpdate = true;
      }

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
      composer.render();
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
      composer.render();
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
      composer.setSize(w, h);
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
        } else if (obj instanceof THREE.Line) {
          obj.geometry.dispose();
          (obj.material as THREE.Material).dispose();
        }
      });
      composer.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  // ── React HUD (overlay) ─────────────────────────────────────────────────
  const hudAccentColor = hud.compound?.color ?? PALETTE.teal;
  const categoryLabel = hud.compound
    ? hud.compound.category === "acid"
      ? "PRECURSOR ACID"
      : hud.compound.category === "cannabinoid"
      ? "CANNABINOID"
      : "TERPENE"
    : null;

  return (
    <div className={`relative w-full ${FORGE_CANVAS_HEIGHT_CLASS} border border-[#C9A84C]/20 bg-[#05080F] overflow-hidden select-none`}>
      {/* 3D canvas mount */}
      <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />

      {/* Top-left status panel */}
      <HudPanel
        accentColor={hudAccentColor}
        className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-auto sm:max-w-xs"
      >
        <HudCaption color={hudAccentColor}>
          {hud.done
            ? "// SYNTHESIS COMPLETE"
            : hud.compound
              ? "// BINDING COMPOUND"
              : "// INITIALIZING FORGE"}
        </HudCaption>
        <div className="flex items-baseline gap-2 mt-0.5">
          <p className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#E8EDF5] leading-none">
            {hud.compound?.name ?? (hud.done ? "FULL SPECTRUM" : "—")}
          </p>
          {categoryLabel && (
            <span
              className="text-[9px] font-mono tracking-wider uppercase px-1.5 py-0.5 border"
              style={{
                color: `#${hudAccentColor.toString(16).padStart(6, "0")}`,
                borderColor: `#${hudAccentColor.toString(16).padStart(6, "0")}55`,
              }}
            >
              {categoryLabel}
            </span>
          )}
        </div>
        {hud.compound ? (
          <p className="text-[#64748B] text-[10px] sm:text-[11px] font-mono mt-1.5 truncate">
            <span className="hidden sm:inline">
              {hud.compound.formula} · {hud.compound.description}
            </span>
            <span className="sm:hidden">{hud.compound.formula}</span>
          </p>
        ) : (
          <p className="text-[#64748B] text-[10px] sm:text-[11px] font-mono mt-1.5">
            {hud.done
              ? "All 8 compounds bound. Press ⟲ to replay."
              : "Warming the forge..."}
          </p>
        )}

        {/* Compound progress bar */}
        <div className="mt-3">
          <HudProgress value={hud.compoundProgress} color={hudAccentColor} />
        </div>
        {/* Global progress */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[#64748B] text-[9px] font-mono tracking-widest tabular-nums">
            {String(Math.min(hud.index + 1, COMPOUNDS.length)).padStart(2, "0")}
            {" / "}
            {String(COMPOUNDS.length).padStart(2, "0")}
          </span>
          <div className="flex-1">
            <HudProgress value={hud.globalProgress} color={PALETTE.gold} thin />
          </div>
        </div>
      </HudPanel>

      {/* Top-right controls hint */}
      <HudPanel
        accentColor={PALETTE.teal}
        className="absolute top-4 right-4 hidden sm:block"
      >
        <div className="text-right">
          <HudCaption color={PALETTE.teal}>{"// CONTROLS"}</HudCaption>
          <ul className="text-[#64748B] text-[10px] font-mono space-y-1.5 mt-2">
            <li>
              <span className="text-[#E8EDF5]">DRAG</span> · orbit
            </li>
            <li>
              <span className="text-[#E8EDF5]">SPACE</span> · pause
            </li>
            <li>
              <span className="text-[#E8EDF5]">R</span> · replay
            </li>
          </ul>
        </div>
      </HudPanel>

      {/* Pause indicator */}
      {hud.paused && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="border border-[#C9A84C]/50 bg-[#0A1628]/85 backdrop-blur-sm px-8 py-4">
            <p className="text-[#C9A84C] text-xs font-mono tracking-[0.5em] uppercase">
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
          className="pointer-events-auto group flex items-center gap-2 sm:gap-3 border border-[#C9A84C]/40 hover:border-[#C9A84C] bg-[#0A1628]/90 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-2.5 min-h-[44px] transition-all duration-300 hover:bg-[#0F1F3D]/90 hover:shadow-[0_0_18px_rgba(201,168,76,0.25)]"
          aria-label="Spawn a bonus molecule"
        >
          <span
            className="inline-block w-5 h-5 sm:w-6 sm:h-6 border border-[#C9A84C] rotate-45 group-hover:rotate-[225deg] transition-transform duration-700"
            aria-hidden
          >
            <span className="block w-full h-full bg-[#C9A84C]/25" />
          </span>
          <span className="flex flex-col items-start leading-none">
            <span className="text-[#C9A84C] text-sm font-black tracking-widest uppercase">
              TF
            </span>
            <span className="text-[#64748B] text-[9px] font-mono tracking-widest uppercase mt-0.5">
              + compound
            </span>
          </span>
        </button>

        {/* On-screen controls */}
        <div className="pointer-events-auto flex gap-2">
          <button
            type="button"
            onClick={togglePaused}
            aria-label={hud.paused ? "Resume animation" : "Pause animation"}
            className="border border-[#0D9488]/40 hover:border-[#0D9488] bg-[#0A1628]/90 backdrop-blur-sm px-3 py-2 sm:px-4 min-h-[44px] min-w-[44px] text-[#0D9488] text-[10px] font-mono tracking-widest uppercase transition-all hover:shadow-[0_0_14px_rgba(13,148,136,0.2)]"
          >
            {hud.paused ? "▶ Resume" : "▌▌ Pause"}
          </button>
          <button
            type="button"
            onClick={triggerReset}
            aria-label="Reset animation"
            className="border border-[#C9A84C]/40 hover:border-[#C9A84C] bg-[#0A1628]/90 backdrop-blur-sm px-3 py-2 sm:px-4 min-h-[44px] min-w-[44px] text-[#C9A84C] text-[10px] font-mono tracking-widest uppercase transition-all hover:shadow-[0_0_14px_rgba(201,168,76,0.2)]"
          >
            ⟲ Replay
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlantForge3D;
