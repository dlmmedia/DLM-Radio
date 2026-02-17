import * as THREE from "three";
import { getAudioData } from "@/hooks/useAudioData";

/**
 * MapLibre GL custom layer that renders audio-reactive pulse rings
 * at the currently playing station's position on the globe.
 *
 * Atmosphere and particle effects are handled separately by AudioVisualOverlay
 * (canvas overlay) because MapLibre's globe projection coordinate system
 * makes it impractical to render screen-space 3D effects via a custom layer.
 */
export class AudioReactiveLayer {
  id = "audio-reactive";
  type = "custom" as const;
  renderingMode = "3d" as const;

  private scene!: THREE.Scene;
  private camera!: THREE.Camera;
  private renderer!: THREE.WebGLRenderer;
  private map: maplibregl.Map | null = null;
  private time = 0;

  private stationLng = 0;
  private stationLat = 0;
  private hasStation = false;

  private pulseMeshes: THREE.Mesh[] = [];

  setStationPosition(lng: number, lat: number) {
    this.stationLng = lng;
    this.stationLat = lat;
    this.hasStation = true;
  }

  onAdd(map: maplibregl.Map, gl: WebGLRenderingContext) {
    this.map = map;
    this.camera = new THREE.Camera();
    this.scene = new THREE.Scene();

    // Pulse rings at station position (3 concentric rings)
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.TorusGeometry(
        0.02 + i * 0.015,
        0.002,
        8,
        64
      );
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0x3b82f6),
        transparent: true,
        opacity: 0.6 - i * 0.15,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.visible = false;
      this.scene.add(ring);
      this.pulseMeshes.push(ring);
    }

    this.renderer = new THREE.WebGLRenderer({
      canvas: map.getCanvas(),
      context: gl,
      antialias: true,
    });
    this.renderer.autoClear = false;
  }

  render(gl: WebGLRenderingContext, args: any) {
    if (!this.map || !this.renderer) return;

    this.time += 0.016;
    const audioData = getAudioData();

    // Position and animate pulse rings at the station location
    if (
      this.hasStation &&
      typeof (this.map.transform as any).getMatrixForModel === "function"
    ) {
      try {
        const modelMatrix = (this.map.transform as any).getMatrixForModel(
          [this.stationLng, this.stationLat],
          0
        );

        for (let i = 0; i < this.pulseMeshes.length; i++) {
          const ring = this.pulseMeshes[i];
          ring.visible = true;

          const audioScale = 1 + audioData.mid * 2 + i * 0.5;
          const scale = audioScale * 5000;
          const mat4 = new THREE.Matrix4().fromArray(modelMatrix);
          mat4.scale(new THREE.Vector3(scale, scale, scale));

          ring.matrixAutoUpdate = false;
          ring.matrix.copy(mat4);
          ring.matrixWorldNeedsUpdate = true;

          const rMat = ring.material as THREE.MeshBasicMaterial;
          rMat.opacity =
            Math.max(0, 0.5 - i * 0.15) * (0.5 + audioData.energy);

          const hue = (this.time * 0.1 + i * 0.1) % 1;
          rMat.color.setHSL(hue, 0.8, 0.6);
        }
      } catch {
        // getMatrixForModel may not be available in all versions
      }
    } else {
      for (const ring of this.pulseMeshes) {
        ring.visible = false;
      }
    }

    // Get the projection matrix from MapLibre
    const mainMatrix =
      args?.defaultProjectionData?.mainMatrix || args?.projectionMatrix;
    if (!mainMatrix) {
      this.map.triggerRepaint();
      return;
    }

    const m = new THREE.Matrix4().fromArray(mainMatrix);
    this.camera.projectionMatrix = m;

    this.renderer.resetState();
    this.renderer.render(this.scene, this.camera);
    this.map.triggerRepaint();
  }
}
