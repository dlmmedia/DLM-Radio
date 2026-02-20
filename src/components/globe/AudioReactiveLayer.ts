import * as THREE from "three";
import { getAudioData } from "@/hooks/useAudioData";

/**
 * MapLibre GL custom layer that renders an audio-reactive glow point
 * at the currently playing station's position on the globe.
 *
 * Replaces the old concentric torus rings with a single subtle glowing
 * sphere that pulses with bass/energy, keeping the map unobstructed.
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

  private glowMesh!: THREE.Mesh;
  private glowHaloMesh!: THREE.Mesh;

  /** Genre-based hue in the 0-1 range */
  private genreHue = 0.6;

  /** Whether we're in dark mode (affects blending and brightness) */
  private isDarkMode = true;

  setStationPosition(lng: number, lat: number) {
    this.stationLng = lng;
    this.stationLat = lat;
    this.hasStation = true;
  }

  setGenreHue(hue: number) {
    this.genreHue = hue;
  }

  setDarkMode(isDark: boolean) {
    this.isDarkMode = isDark;
    if (this.glowMesh) {
      const mat = this.glowMesh.material as THREE.MeshBasicMaterial;
      mat.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
    }
    if (this.glowHaloMesh) {
      const mat = this.glowHaloMesh.material as THREE.MeshBasicMaterial;
      mat.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
    }
  }

  onAdd(map: maplibregl.Map, gl: WebGLRenderingContext) {
    this.map = map;
    this.camera = new THREE.Camera();
    this.scene = new THREE.Scene();

    // Small glowing sphere at station location
    const sphereGeo = new THREE.SphereGeometry(0.008, 16, 16);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x3b82f6),
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.glowMesh = new THREE.Mesh(sphereGeo, sphereMat);
    this.glowMesh.visible = false;
    this.scene.add(this.glowMesh);

    // Larger soft halo around the glow point
    const haloGeo = new THREE.SphereGeometry(0.025, 16, 16);
    const haloMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x3b82f6),
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.glowHaloMesh = new THREE.Mesh(haloGeo, haloMat);
    this.glowHaloMesh.visible = false;
    this.scene.add(this.glowHaloMesh);

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

    if (
      this.hasStation &&
      typeof (this.map.transform as any).getMatrixForModel === "function"
    ) {
      try {
        const modelMatrix = (this.map.transform as any).getMatrixForModel(
          [this.stationLng, this.stationLat],
          0
        );

        // Glow point - pulses subtly with bass
        const bassPulse = 1 + audioData.bass * 0.8;
        const glowScale = bassPulse * 5000;
        const mat4 = new THREE.Matrix4().fromArray(modelMatrix);
        mat4.scale(new THREE.Vector3(glowScale, glowScale, glowScale));

        this.glowMesh.visible = true;
        this.glowMesh.matrixAutoUpdate = false;
        this.glowMesh.matrix.copy(mat4);
        this.glowMesh.matrixWorldNeedsUpdate = true;

        const glowMat = this.glowMesh.material as THREE.MeshBasicMaterial;
        glowMat.opacity = 0.5 + audioData.energy * 0.4;
        glowMat.color.setHSL(this.genreHue, 0.7, 0.6);

        // Halo - breathes with energy
        const haloScale = (1 + audioData.energy * 1.5) * 5000;
        const haloMat4 = new THREE.Matrix4().fromArray(modelMatrix);
        haloMat4.scale(new THREE.Vector3(haloScale, haloScale, haloScale));

        this.glowHaloMesh.visible = true;
        this.glowHaloMesh.matrixAutoUpdate = false;
        this.glowHaloMesh.matrix.copy(haloMat4);
        this.glowHaloMesh.matrixWorldNeedsUpdate = true;

        const haloMaterial = this.glowHaloMesh
          .material as THREE.MeshBasicMaterial;
        haloMaterial.opacity =
          0.08 +
          audioData.energy * 0.1 +
          Math.sin(this.time * 2) * 0.02;
        haloMaterial.color.setHSL(this.genreHue, 0.5, 0.5);
      } catch {
        // getMatrixForModel may not be available in all versions
      }
    } else {
      this.glowMesh.visible = false;
      this.glowHaloMesh.visible = false;
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
