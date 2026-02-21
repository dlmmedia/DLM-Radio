import * as THREE from "three";
import type { AudioData } from "@/lib/types";
import type { ThreeScene } from "./types";
import { hexToRGB, createStarTexture, createBloomComposer, getBloomPass } from "./utils";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";

const PARTICLE_COUNT = 4000;
const SMOOTH_FACTOR = 0.08;
const SMOOTH_FACTOR_FAST = 0.14;

const enum Layer {
  Near = 0,
  Mid = 1,
  Far = 2,
}

export function createParticleField(): ThreeScene {
  let renderer: THREE.WebGLRenderer | null = null;
  let scene: THREE.Scene | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let composer: EffectComposer | null = null;
  let points: THREE.Points | null = null;
  let positions: Float32Array;
  let basePositions: Float32Array;
  let baseColors: Float32Array;
  let sizes: Float32Array;
  let colorAttr: Float32Array;
  let alphas: Float32Array;
  let layers: Uint8Array;

  // Smoothed audio values to prevent jerkiness
  let sBass = 0;
  let sEnergy = 0;
  let sMid = 0;
  let sHigh = 0;
  let sSub = 0;
  let sBloom = 0.4;
  let sCamZ = 120;
  let sCamX = 0;
  let sCamY = 0;
  const sRaw = new Float32Array(32);

  return {
    type: "three",

    init(container) {
      sBass = 0;
      sEnergy = 0;
      sMid = 0;
      sHigh = 0;
      sSub = 0;
      sBloom = 0.4;
      sCamZ = 120;
      sCamX = 0;
      sCamY = 0;
      sRaw.fill(0);

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      camera.position.z = 120;

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setClearColor(0x000000, 1);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);

      composer = createBloomComposer(renderer, scene, camera, {
        strength: 0.6,
        radius: 0.5,
        threshold: 0.15,
      });

      const starTex = createStarTexture();

      positions = new Float32Array(PARTICLE_COUNT * 3);
      basePositions = new Float32Array(PARTICLE_COUNT * 3);
      baseColors = new Float32Array(PARTICLE_COUNT * 3);
      sizes = new Float32Array(PARTICLE_COUNT);
      colorAttr = new Float32Array(PARTICLE_COUNT * 3);
      alphas = new Float32Array(PARTICLE_COUNT);
      layers = new Uint8Array(PARTICLE_COUNT);

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        const rand = Math.random();
        let layer: Layer;
        let rDist: number;
        if (rand < 0.4) {
          layer = Layer.Far;
          rDist = 70 + Math.random() * 50;
        } else if (rand < 0.75) {
          layer = Layer.Mid;
          rDist = 30 + Math.random() * 45;
        } else {
          layer = Layer.Near;
          rDist = 10 + Math.random() * 25;
        }
        layers[i] = layer;

        positions[i3] = rDist * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = rDist * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = rDist * Math.cos(phi);

        basePositions[i3] = positions[i3];
        basePositions[i3 + 1] = positions[i3 + 1];
        basePositions[i3 + 2] = positions[i3 + 2];

        if (layer === Layer.Near) {
          baseColors[i3] = 1.0;
          baseColors[i3 + 1] = 0.9 + Math.random() * 0.1;
          baseColors[i3 + 2] = 0.6 + Math.random() * 0.2;
          sizes[i] = 2.5 + Math.random() * 2.5;
        } else if (layer === Layer.Mid) {
          baseColors[i3] = 0.8 + Math.random() * 0.2;
          baseColors[i3 + 1] = 0.8 + Math.random() * 0.2;
          baseColors[i3 + 2] = 0.9 + Math.random() * 0.1;
          sizes[i] = 1.5 + Math.random() * 2;
        } else {
          baseColors[i3] = 0.5 + Math.random() * 0.3;
          baseColors[i3 + 1] = 0.6 + Math.random() * 0.3;
          baseColors[i3 + 2] = 0.9 + Math.random() * 0.1;
          sizes[i] = 0.8 + Math.random() * 1.2;
        }

        colorAttr[i3] = baseColors[i3];
        colorAttr[i3 + 1] = baseColors[i3 + 1];
        colorAttr[i3 + 2] = baseColors[i3 + 2];
        alphas[i] = 0.5 + Math.random() * 0.5;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
      geometry.setAttribute("color", new THREE.BufferAttribute(colorAttr, 3));

      const material = new THREE.PointsMaterial({
        size: 2.5,
        map: starTex,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      });

      points = new THREE.Points(geometry, material);
      scene.add(points);
    },

    update(audio, time, color) {
      if (!points || !camera || !renderer || !scene || !composer) return;

      // Smooth all audio values with exponential moving average
      sBass += (audio.bass - sBass) * SMOOTH_FACTOR;
      sEnergy += (audio.energy - sEnergy) * SMOOTH_FACTOR;
      sMid += (audio.mid - sMid) * SMOOTH_FACTOR_FAST;
      sHigh += (audio.high - sHigh) * SMOOTH_FACTOR_FAST;
      sSub += (audio.sub - sSub) * SMOOTH_FACTOR;
      for (let i = 0; i < 32; i++) {
        sRaw[i] += ((audio.raw[i] || 0) - sRaw[i]) * SMOOTH_FACTOR_FAST;
      }

      const { r: cr, g: cg, b: cb } = hexToRGB(color);
      const bassExpand = 1 + sBass * 0.6;

      // Fixed base oscillation speed — audio only modulates amplitude, not frequency
      const baseSpeed = 0.4;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const bx = basePositions[i3];
        const by = basePositions[i3 + 1];
        const bz = basePositions[i3 + 2];
        const layer = layers[i];
        const band = i % 32;
        const rawVal = sRaw[band];

        let speedMult: number;
        let reactivity: number;
        if (layer === Layer.Near) {
          speedMult = 1.5;
          reactivity = 1.2;
        } else if (layer === Layer.Mid) {
          speedMult = 1.0;
          reactivity = 0.8;
        } else {
          speedMult = 0.5;
          reactivity = 0.4;
        }

        positions[i3] =
          bx * bassExpand +
          Math.sin(time * baseSpeed * speedMult + i * 0.01) *
            sMid *
            5 *
            reactivity;
        positions[i3 + 1] =
          by * bassExpand +
          Math.cos(time * baseSpeed * speedMult + i * 0.013) *
            sHigh *
            3 *
            reactivity;
        positions[i3 + 2] =
          bz * bassExpand +
          Math.sin(time * 0.5 * speedMult + i * 0.007) *
            sSub *
            4 *
            reactivity;

        // Tint toward genre color from base colors (not cumulative)
        const tintStrength = 0.25 + rawVal * 0.3;
        colorAttr[i3] = Math.min(1, baseColors[i3] * (1 - tintStrength) + cr * tintStrength + rawVal * 0.15);
        colorAttr[i3 + 1] = Math.min(1, baseColors[i3 + 1] * (1 - tintStrength) + cg * tintStrength + rawVal * 0.08);
        colorAttr[i3 + 2] = Math.min(1, baseColors[i3 + 2] * (1 - tintStrength) + cb * tintStrength + rawVal * 0.12);

        sizes[i] =
          (layer === Layer.Near
            ? 2.5 + rawVal * 4
            : layer === Layer.Mid
              ? 1.5 + rawVal * 3
              : 0.8 + rawVal * 1.5) *
          (1 + sEnergy * 0.4);
      }

      const posAttr = points.geometry.getAttribute(
        "position"
      ) as THREE.BufferAttribute;
      posAttr.needsUpdate = true;
      const colAttr = points.geometry.getAttribute(
        "color"
      ) as THREE.BufferAttribute;
      colAttr.needsUpdate = true;
      const sizeAttr = points.geometry.getAttribute(
        "size"
      ) as THREE.BufferAttribute;
      sizeAttr.needsUpdate = true;

      points.rotation.y = time * 0.04;
      points.rotation.x = Math.sin(time * 0.025) * 0.25;
      points.rotation.z = Math.cos(time * 0.015) * 0.1;

      // Smooth camera transitions
      const targetCamZ = 120 - sEnergy * 25;
      const targetCamX = Math.sin(time * 0.05) * 5;
      const targetCamY = Math.cos(time * 0.03) * 3;
      sCamZ += (targetCamZ - sCamZ) * SMOOTH_FACTOR;
      sCamX += (targetCamX - sCamX) * SMOOTH_FACTOR_FAST;
      sCamY += (targetCamY - sCamY) * SMOOTH_FACTOR_FAST;
      camera.position.z = sCamZ;
      camera.position.x = sCamX;
      camera.position.y = sCamY;

      // Smooth bloom strength
      const targetBloom = 0.4 + sEnergy * 1.2;
      sBloom += (targetBloom - sBloom) * SMOOTH_FACTOR;
      const bloomPass = getBloomPass(composer);
      if (bloomPass) {
        bloomPass.strength = sBloom;
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
      if (points) {
        points.geometry.dispose();
        const mat = points.material as THREE.PointsMaterial;
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
      points = null;
    },
  };
}
