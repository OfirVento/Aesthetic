import * as THREE from "three";
import type { LandmarkPoint } from "../mediapipe";
import type { SimulationState } from "./types";
import { FILLER_MORPH_TARGETS } from "./morphTargets";

/**
 * Grid resolution — higher = smoother deformation, more vertices.
 * 80×80 = 6561 vertices — fast enough for real-time.
 */
const GRID_RES = 80;

/**
 * How far (in normalised -1…1 space) a grid vertex can be from a
 * landmark and still be affected by its morph target.
 */
const INFLUENCE_RADIUS = 0.28;

export class MeshRenderer {
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;

  private mesh: THREE.Mesh | null = null;
  private geometry: THREE.PlaneGeometry | null = null;
  private material: THREE.MeshBasicMaterial | null = null;
  private texture: THREE.Texture | null = null;

  // Original flat-grid positions (for reset before each deformation)
  private originalPositions: Float32Array | null = null;

  // Per-landmark position in grid space (precomputed)
  private landmarkXY: { x: number; y: number }[] = [];

  private width: number;
  private height: number;

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    this.width = width;
    this.height = height;

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
    });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0x1a1a2e, 1);

    this.scene = new THREE.Scene();

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    this.camera.position.z = 5;
  }

  // ────────────────────────────────────────────────────────────────────
  //  Initialise with image + landmarks
  // ────────────────────────────────────────────────────────────────────
  async initialize(
    imageDataUrl: string,
    landmarks: LandmarkPoint[]
  ): Promise<void> {
    // Load texture
    const textureLoader = new THREE.TextureLoader();
    this.texture = await new Promise<THREE.Texture>((resolve, reject) => {
      textureLoader.load(
        imageDataUrl,
        (tex) => {
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.needsUpdate = true;
          resolve(tex);
        },
        undefined,
        (err) => reject(err)
      );
    });

    // High-res grid that covers the whole image (-1…1 in both axes)
    this.geometry = new THREE.PlaneGeometry(2, 2, GRID_RES, GRID_RES);

    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);

    // Keep a copy of the original grid positions
    const posArr = this.geometry.getAttribute("position").array as Float32Array;
    this.originalPositions = new Float32Array(posArr);

    // Convert landmark positions to grid space once
    //   landmark x  ∈ [0,1] → grid x ∈ [-1, 1]   (x*2 - 1)
    //   landmark y  ∈ [0,1] → grid y ∈ [ 1,-1]   (-(y*2 - 1))  (Y is flipped)
    this.landmarkXY = landmarks.map((lm) => ({
      x: lm.x * 2 - 1,
      y: -(lm.y * 2 - 1),
    }));

    this.render();

    console.log(
      "[MeshRenderer] Initialised – grid",
      GRID_RES,
      "×",
      GRID_RES,
      "=",
      (GRID_RES + 1) * (GRID_RES + 1),
      "verts,",
      landmarks.length,
      "landmarks"
    );
  }

  // ────────────────────────────────────────────────────────────────────
  //  Apply simulation state  (called on every slider change)
  // ────────────────────────────────────────────────────────────────────
  updateSimulation(state: SimulationState): void {
    if (!this.geometry || !this.originalPositions) {
      console.warn("[MeshRenderer] updateSimulation called but geometry/positions not ready");
      return;
    }

    const posAttr = this.geometry.getAttribute("position") as THREE.BufferAttribute;
    const pos = posAttr.array as Float32Array;
    const vertCount = posAttr.count;

    // Reset to flat grid
    pos.set(this.originalPositions);

    // Debug: log active filler values
    const activeFillers = Object.entries(state.fillerValues).filter(([, v]) => v > 0);
    if (activeFillers.length > 0) {
      console.log("[MeshRenderer] Active fillers:", activeFillers.map(([k, v]) => `${k}=${v.toFixed(2)}`).join(", "));
    }

    let totalVertsMoved = 0;

    // ── Fillers: push grid vertices outward near affected landmarks ──
    for (const target of FILLER_MORPH_TARGETS) {
      const intensity = state.fillerValues[target.name] || 0;
      if (intensity <= 0) continue;

      // Centroid of affected landmarks (in grid space)
      let cx = 0,
        cy = 0,
        lmCount = 0;
      for (const li of target.affectedVertices) {
        if (li >= this.landmarkXY.length) continue;
        cx += this.landmarkXY[li].x;
        cy += this.landmarkXY[li].y;
        lmCount++;
      }
      if (lmCount === 0) continue;
      cx /= lmCount;
      cy /= lmCount;

      // Determine outward direction per-vertex
      const useCustomXY =
        target.deformationType === "custom" &&
        target.customDirection &&
        Math.hypot(target.customDirection.x, target.customDirection.y) > 0.2;

      let customNx = 0,
        customNy = 0;
      if (useCustomXY && target.customDirection) {
        const m = Math.hypot(target.customDirection.x, target.customDirection.y);
        customNx = target.customDirection.x / m;
        customNy = target.customDirection.y / m;
      }

      // Walk every grid vertex – cheap at ~6.5 k verts
      for (let vi = 0; vi < vertCount; vi++) {
        const gx = this.originalPositions[vi * 3];
        const gy = this.originalPositions[vi * 3 + 1];

        // Distance to nearest affected landmark
        let minDist = Infinity;
        for (const li of target.affectedVertices) {
          if (li >= this.landmarkXY.length) continue;
          const dx = gx - this.landmarkXY[li].x;
          const dy = gy - this.landmarkXY[li].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < minDist) minDist = d;
        }

        if (minDist >= INFLUENCE_RADIUS) continue;

        // Smooth falloff (1 at landmark, 0 at INFLUENCE_RADIUS)
        const weight =
          1 - minDist / INFLUENCE_RADIUS;
        const smoothWeight = weight * weight * (3 - 2 * weight); // smoothstep

        const disp = target.maxDisplacement * intensity * smoothWeight;

        if (useCustomXY) {
          pos[vi * 3] += customNx * disp;
          pos[vi * 3 + 1] += customNy * disp;
          totalVertsMoved++;
        } else {
          // Radial outward from region centroid
          const rx = gx - cx;
          const ry = gy - cy;
          const rLen = Math.sqrt(rx * rx + ry * ry);
          if (rLen < 0.001) continue;
          pos[vi * 3] += (rx / rLen) * disp;
          pos[vi * 3 + 1] += (ry / rLen) * disp;
          totalVertsMoved++;
        }
      }
    }

    if (activeFillers.length > 0) {
      console.log("[MeshRenderer] Vertices displaced:", totalVertsMoved, "of", vertCount);
    }

    posAttr.needsUpdate = true;

    // ── Botox: simple brightness lift near wrinkle zones (no shader needed) ──
    // Botox effect is visual smoothing. For now we skip it since
    // MeshBasicMaterial doesn't support custom fragment shaders.
    // TODO: add ShaderMaterial botox pass once filler deformation is confirmed working.

    this.render();
  }

  // ────────────────────────────────────────────────────────────────────
  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  toDataURL(type: string = "image/png"): string {
    this.render();
    return this.renderer.domElement.toDataURL(type);
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height);
    this.render();
  }

  dispose(): void {
    if (this.mesh) {
      this.scene.remove(this.mesh);
    }
    if (this.geometry) {
      this.geometry.dispose();
    }
    if (this.material) {
      this.material.dispose();
    }
    if (this.texture) {
      this.texture.dispose();
    }
    this.renderer.dispose();
  }
}
