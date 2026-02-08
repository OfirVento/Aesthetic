import * as THREE from "three";
import type { LandmarkPoint } from "../mediapipe";
import type { SimulationState } from "./types";

export class MeshRenderer {
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private mesh: THREE.Mesh | null = null;
  private material: THREE.MeshBasicMaterial | null = null;
  private texture: THREE.Texture | null = null;
  private landmarks: LandmarkPoint[] | null = null;

  private width: number;
  private height: number;

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    this.width = width;
    this.height = height;

    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x1a1a2e, 1);

    // Setup scene
    this.scene = new THREE.Scene();

    // Orthographic camera for 2D rendering - covers -1 to 1 on both axes
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    this.camera.position.z = 5;
  }

  /**
   * Initialize with face landmarks and image texture
   */
  async initialize(
    imageDataUrl: string,
    landmarks: LandmarkPoint[]
  ): Promise<void> {
    this.landmarks = landmarks;

    // Load texture from data URL
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

    // Create a plane that fills the view
    const geometry = new THREE.PlaneGeometry(2, 2);

    // Use basic material with the texture
    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      side: THREE.FrontSide,
    });

    // Create and add mesh
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.position.z = 0;
    this.scene.add(this.mesh);

    // Render
    this.render();

    console.log("MeshRenderer initialized with", landmarks.length, "landmarks");
  }

  /**
   * Update simulation state
   * TODO: Implement actual mesh deformation when we have proper triangulation
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateSimulation(_state: SimulationState): void {
    // For now, just re-render
    // Future: Apply morph targets and Botox effects
    this.render();
  }

  /**
   * Set global intensity for all effects
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGlobalIntensity(_filler: number, _botox: number): void {
    // TODO: Implement when we have shader-based effects
    this.render();
  }

  /**
   * Render the scene
   */
  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Export the current render as a data URL
   */
  toDataURL(type: string = "image/png"): string {
    this.render();
    return this.renderer.domElement.toDataURL(type);
  }

  /**
   * Resize the renderer
   */
  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height);
    this.render();
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.scene.remove(this.mesh);
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
