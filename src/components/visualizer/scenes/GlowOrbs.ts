import * as THREE from "three";
import type { AudioData } from "@/lib/types";
import type { ThreeScene } from "./types";
import {
  hexToHSL,
  createStarTexture,
  createBloomComposer,
  getBloomPass,
} from "./utils";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";

const STAR_COUNT = 2500;

export function createGlowOrbs(): ThreeScene {
  let renderer: THREE.WebGLRenderer | null = null;
  let scene: THREE.Scene | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let composer: EffectComposer | null = null;
  let mainSphere: THREE.Mesh | null = null;
  let outerRing: THREE.Mesh | null = null;
  let orbitals: THREE.Mesh[] = [];
  let originalPositions: Float32Array | null = null;

  // Starfield
  let starPoints: THREE.Points | null = null;
  let starSizes: Float32Array | null = null;
  let starBaseSizes: Float32Array | null = null;
  let starColors: Float32Array | null = null;
  let starBaseColors: Float32Array | null = null;
  let starPhases: Float32Array | null = null;
  let starGroup: THREE.Group | null = null;

  // Nebula glow sprite
  let nebulaSprite: THREE.Sprite | null = null;

  return {
    type: "three",

    init(container) {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(
        50,
        container.clientWidth / container.clientHeight,
        0.1,
        1200
      );
      camera.position.z = 80;

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setClearColor(0x000000, 1);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      container.appendChild(renderer.domElement);

      composer = createBloomComposer(renderer, scene, camera, {
        strength: 0.7,
        radius: 0.5,
        threshold: 0.1,
      });

      // --- Starfield background ---
      const starTex = createStarTexture();
      starGroup = new THREE.Group();

      const starPositions = new Float32Array(STAR_COUNT * 3);
      starSizes = new Float32Array(STAR_COUNT);
      starBaseSizes = new Float32Array(STAR_COUNT);
      starColors = new Float32Array(STAR_COUNT * 3);
      starBaseColors = new Float32Array(STAR_COUNT * 3);
      starPhases = new Float32Array(STAR_COUNT);

      for (let i = 0; i < STAR_COUNT; i++) {
        const i3 = i * 3;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = 300 + Math.random() * 200;

        starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        starPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        starPositions[i3 + 2] = radius * Math.cos(phi);

        const baseSize = 0.4 + Math.random() * 2.0;
        starBaseSizes[i] = baseSize;
        starSizes[i] = baseSize;

        // Star color temperature variety
        const temp = Math.random();
        if (temp < 0.3) {
          // Warm white/yellow
          starBaseColors[i3] = 1.0;
          starBaseColors[i3 + 1] = 0.9 + Math.random() * 0.1;
          starBaseColors[i3 + 2] = 0.7 + Math.random() * 0.15;
        } else if (temp < 0.7) {
          // Pure white
          starBaseColors[i3] = 0.9 + Math.random() * 0.1;
          starBaseColors[i3 + 1] = 0.9 + Math.random() * 0.1;
          starBaseColors[i3 + 2] = 0.95 + Math.random() * 0.05;
        } else {
          // Cool blue-white
          starBaseColors[i3] = 0.6 + Math.random() * 0.2;
          starBaseColors[i3 + 1] = 0.7 + Math.random() * 0.2;
          starBaseColors[i3 + 2] = 0.95 + Math.random() * 0.05;
        }

        starColors[i3] = starBaseColors[i3];
        starColors[i3 + 1] = starBaseColors[i3 + 1];
        starColors[i3 + 2] = starBaseColors[i3 + 2];

        starPhases[i] = Math.random() * Math.PI * 2;
      }

      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute(
        "position",
        new THREE.BufferAttribute(starPositions, 3)
      );
      starGeo.setAttribute("size", new THREE.BufferAttribute(starSizes, 1));
      starGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

      const starMat = new THREE.PointsMaterial({
        size: 1.5,
        map: starTex,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      });

      starPoints = new THREE.Points(starGeo, starMat);
      starGroup.add(starPoints);
      scene.add(starGroup);

      // --- Nebula glow sprite (center) ---
      const nebulaCanvas = document.createElement("canvas");
      nebulaCanvas.width = 256;
      nebulaCanvas.height = 256;
      const nCtx = nebulaCanvas.getContext("2d")!;
      const nebulaGrad = nCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
      nebulaGrad.addColorStop(0, "rgba(100, 120, 255, 0.15)");
      nebulaGrad.addColorStop(0.3, "rgba(80, 100, 200, 0.06)");
      nebulaGrad.addColorStop(0.6, "rgba(60, 80, 180, 0.02)");
      nebulaGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      nCtx.fillStyle = nebulaGrad;
      nCtx.fillRect(0, 0, 256, 256);

      const nebulaTex = new THREE.CanvasTexture(nebulaCanvas);
      const nebulaMat = new THREE.SpriteMaterial({
        map: nebulaTex,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      nebulaSprite = new THREE.Sprite(nebulaMat);
      nebulaSprite.scale.set(150, 150, 1);
      scene.add(nebulaSprite);

      // --- Main sphere with displacement ---
      const sphereGeo = new THREE.IcosahedronGeometry(15, 5);
      originalPositions = new Float32Array(
        sphereGeo.attributes.position.array.length
      );
      originalPositions.set(
        sphereGeo.attributes.position.array as Float32Array
      );

      const sphereMat = new THREE.MeshBasicMaterial({
        color: 0x6b7280,
        wireframe: true,
        transparent: true,
        opacity: 0.6,
      });
      mainSphere = new THREE.Mesh(sphereGeo, sphereMat);
      scene.add(mainSphere);

      // Outer ring
      const ringGeo = new THREE.TorusGeometry(25, 0.3, 8, 80);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x6b7280,
        transparent: true,
        opacity: 0.3,
      });
      outerRing = new THREE.Mesh(ringGeo, ringMat);
      scene.add(outerRing);

      // Orbital smaller spheres
      orbitals = [];
      for (let i = 0; i < 6; i++) {
        const orbGeo = new THREE.SphereGeometry(
          1.5 + Math.random() * 1.5,
          12,
          12
        );
        const orbMat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.5,
          blending: THREE.AdditiveBlending,
        });
        const orb = new THREE.Mesh(orbGeo, orbMat);
        scene.add(orb);
        orbitals.push(orb);
      }

      const ambLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambLight);
    },

    update(audio, time, color) {
      if (
        !mainSphere ||
        !outerRing ||
        !camera ||
        !renderer ||
        !scene ||
        !originalPositions ||
        !composer ||
        !starPoints ||
        !starSizes ||
        !starBaseSizes ||
        !starColors ||
        !starBaseColors ||
        !starPhases ||
        !starGroup
      )
        return;

      const { h, s } = hexToHSL(color);
      const threeColor = new THREE.Color().setHSL(h, Math.max(s, 0.5), 0.5);

      // --- Update starfield ---
      const twinkleSpeed = 1.5 + audio.treble * 3.0;
      const starBreathOpacity = 0.6 + audio.energy * 0.35;

      for (let i = 0; i < STAR_COUNT; i++) {
        const i3 = i * 3;
        const phase = starPhases[i];

        // Per-star twinkling
        const twinkle =
          0.5 + 0.5 * Math.sin(time * twinkleSpeed * (0.5 + (i % 7) * 0.15) + phase);
        starSizes[i] = starBaseSizes[i] * (0.6 + twinkle * 0.6);

        // Bass flare: random clusters brighten on bass hits
        const clusterIdx = i % 50;
        const bassFlare =
          audio.bass > 0.5 && clusterIdx < 5
            ? (audio.bass - 0.5) * 1.5
            : 0;

        const brightness = starBreathOpacity * twinkle + bassFlare;
        starColors[i3] = starBaseColors[i3] * Math.min(1, brightness);
        starColors[i3 + 1] = starBaseColors[i3 + 1] * Math.min(1, brightness);
        starColors[i3 + 2] = starBaseColors[i3 + 2] * Math.min(1, brightness);
      }

      const starSizeAttr = starPoints.geometry.getAttribute(
        "size"
      ) as THREE.BufferAttribute;
      starSizeAttr.needsUpdate = true;
      const starColAttr = starPoints.geometry.getAttribute(
        "color"
      ) as THREE.BufferAttribute;
      starColAttr.needsUpdate = true;

      // Slow starfield rotation (independent of orbs)
      starGroup.rotation.y = time * 0.008;
      starGroup.rotation.x = time * 0.003;

      // Nebula pulse on high energy
      if (nebulaSprite) {
        const nebScale = 120 + audio.energy * 80 + audio.bass * 30;
        nebulaSprite.scale.set(nebScale, nebScale, 1);
        (nebulaSprite.material as THREE.SpriteMaterial).opacity =
          0.15 + audio.energy * 0.25;
        (nebulaSprite.material as THREE.SpriteMaterial).color.copy(threeColor);
      }

      // Star material overall opacity
      (starPoints.material as THREE.PointsMaterial).opacity =
        0.5 + audio.energy * 0.4;

      // --- Main sphere vertex displacement ---
      const posArray = mainSphere.geometry.attributes.position
        .array as Float32Array;
      const vertexCount = posArray.length / 3;
      for (let i = 0; i < vertexCount; i++) {
        const i3 = i * 3;
        const ox = originalPositions[i3];
        const oy = originalPositions[i3 + 1];
        const oz = originalPositions[i3 + 2];

        const bandIdx = i % 32;
        const bandVal = audio.raw[bandIdx] || 0;
        const dist = Math.sqrt(ox * ox + oy * oy + oz * oz);
        const nx = ox / dist;
        const ny = oy / dist;
        const nz = oz / dist;

        const displacement = bandVal * 8 + audio.bass * 3;
        posArray[i3] = ox + nx * displacement;
        posArray[i3 + 1] = oy + ny * displacement;
        posArray[i3 + 2] = oz + nz * displacement;
      }
      mainSphere.geometry.attributes.position.needsUpdate = true;

      (mainSphere.material as THREE.MeshBasicMaterial).color.copy(threeColor);
      (mainSphere.material as THREE.MeshBasicMaterial).opacity =
        0.3 + audio.energy * 0.5;

      mainSphere.rotation.y = time * 0.15;
      mainSphere.rotation.x = Math.sin(time * 0.1) * 0.4;

      // Outer ring
      (outerRing.material as THREE.MeshBasicMaterial).color.copy(threeColor);
      outerRing.rotation.x = time * 0.2 + Math.PI / 3;
      outerRing.rotation.z = time * 0.1;
      const ringScale = 1 + audio.bass * 0.3;
      outerRing.scale.set(ringScale, ringScale, ringScale);

      // Orbital spheres
      for (let i = 0; i < orbitals.length; i++) {
        const orb = orbitals[i];
        const angle =
          time * (0.3 + i * 0.1) + (i * Math.PI * 2) / orbitals.length;
        const orbRadius =
          30 + audio.energy * 10 + Math.sin(time * 0.5 + i) * 5;
        const yOff = Math.sin(time * 0.3 + i * 1.5) * 10;

        orb.position.x = Math.cos(angle) * orbRadius;
        orb.position.y = yOff;
        orb.position.z = Math.sin(angle) * orbRadius;

        const bandVal = audio.raw[(i * 5) % 32] || 0;
        const orbScale = 1 + bandVal * 2;
        orb.scale.set(orbScale, orbScale, orbScale);

        (orb.material as THREE.MeshBasicMaterial).color.copy(threeColor);
        (orb.material as THREE.MeshBasicMaterial).opacity = 0.3 + bandVal * 0.5;
      }

      camera.position.z = 80 - audio.energy * 15;
      camera.position.x = Math.sin(time * 0.04) * 3;

      // Dynamic bloom
      const bloomPass = getBloomPass(composer);
      if (bloomPass) {
        bloomPass.strength = 0.5 + audio.energy * 0.8;
      }

      composer.render();
    },

    resize(w, h) {
      if (!renderer || !camera || !composer) return;
      renderer.setSize(w, h);
      composer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    },

    dispose() {
      for (const orb of orbitals) {
        orb.geometry.dispose();
        (orb.material as THREE.Material).dispose();
      }
      if (mainSphere) {
        mainSphere.geometry.dispose();
        (mainSphere.material as THREE.Material).dispose();
      }
      if (outerRing) {
        outerRing.geometry.dispose();
        (outerRing.material as THREE.Material).dispose();
      }
      if (starPoints) {
        starPoints.geometry.dispose();
        const mat = starPoints.material as THREE.PointsMaterial;
        if (mat.map) mat.map.dispose();
        mat.dispose();
      }
      if (nebulaSprite) {
        const mat = nebulaSprite.material as THREE.SpriteMaterial;
        if (mat.map) mat.map.dispose();
        mat.dispose();
      }
      if (composer) {
        composer.dispose();
      }
      if (renderer) {
        renderer.dispose();
        renderer.domElement.remove();
      }
      renderer = null;
      scene = null;
      camera = null;
      composer = null;
      mainSphere = null;
      outerRing = null;
      orbitals = [];
      originalPositions = null;
      starPoints = null;
      starSizes = null;
      starBaseSizes = null;
      starColors = null;
      starBaseColors = null;
      starPhases = null;
      starGroup = null;
      nebulaSprite = null;
    },
  };
}
