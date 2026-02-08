import * as THREE from "three";
import type { LandmarkPoint } from "../mediapipe";
import type { SimulationState } from "./types";
import { buildFaceMesh } from "./meshBuilder";
import { FILLER_MORPH_TARGETS, BOTOX_ZONES } from "./morphTargets";
import {
  fillerVertexShader,
  botoxFragmentShader,
} from "./shaders";

export class MeshRenderer {
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private mesh: THREE.Mesh | null = null;
  private material: THREE.ShaderMaterial | null = null;
  private texture: THREE.Texture | null = null;

  private baseVertices: Float32Array | null = null;
  private morphTargetData: Map<string, Float32Array> = new Map();

  private width: number;
  private height: number;

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    this.width = width;
    this.height = height;

    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Setup scene
    this.scene = new THREE.Scene();

    // Orthographic camera for 2D-style rendering
    const aspect = width / height;
    this.camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 10);
    this.camera.position.z = 1;
  }

  /**
   * Initialize the mesh with face landmarks and image texture
   */
  async initialize(
    imageDataUrl: string,
    landmarks: LandmarkPoint[]
  ): Promise<void> {
    // Load texture from image
    const textureLoader = new THREE.TextureLoader();
    this.texture = await new Promise((resolve, reject) => {
      textureLoader.load(
        imageDataUrl,
        (tex) => {
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.colorSpace = THREE.SRGBColorSpace;
          resolve(tex);
        },
        undefined,
        reject
      );
    });

    // Build mesh from landmarks
    const meshData = buildFaceMesh(landmarks, this.width, this.height);
    this.baseVertices = new Float32Array(meshData.vertices);

    // Create geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(meshData.vertices, 3)
    );
    geometry.setAttribute("uv", new THREE.BufferAttribute(meshData.uvs, 2));
    geometry.setAttribute(
      "normal",
      new THREE.BufferAttribute(meshData.normals, 3)
    );
    geometry.setIndex(new THREE.BufferAttribute(meshData.indices, 1));

    // Create morph target attributes
    this.createMorphTargetAttributes(geometry, landmarks, meshData.normals);

    // Create shader material
    this.material = new THREE.ShaderMaterial({
      vertexShader: fillerVertexShader,
      fragmentShader: botoxFragmentShader,
      uniforms: {
        faceTexture: { value: this.texture },
        textureSize: { value: new THREE.Vector2(this.width, this.height) },
        morphWeights: { value: new Array(8).fill(0) },
        globalIntensity: { value: 1.0 },
        // Botox zones
        botoxZone0: { value: new THREE.Vector4(0, 0, 0, 0) },
        botoxZone1: { value: new THREE.Vector4(0, 0, 0, 0) },
        botoxZone2: { value: new THREE.Vector4(0, 0, 0, 0) },
        botoxZone3: { value: new THREE.Vector4(0, 0, 0, 0) },
        botoxZone4: { value: new THREE.Vector4(0, 0, 0, 0) },
        botoxStrength: { value: new Array(5).fill(0) },
        globalBotoxIntensity: { value: 1.0 },
      },
      transparent: true,
    });

    // Setup Botox zone uniforms
    BOTOX_ZONES.forEach((zone, i) => {
      if (i < 5) {
        const uniformName = `botoxZone${i}`;
        this.material!.uniforms[uniformName].value = new THREE.Vector4(
          zone.uvBounds.minU,
          zone.uvBounds.maxU,
          zone.uvBounds.minV,
          zone.uvBounds.maxV
        );
      }
    });

    // Create mesh
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.mesh);

    // Initial render
    this.render();
  }

  /**
   * Create morph target vertex attributes
   */
  private createMorphTargetAttributes(
    geometry: THREE.BufferGeometry,
    landmarks: LandmarkPoint[],
    normals: Float32Array
  ): void {
    const numVertices = landmarks.length;

    FILLER_MORPH_TARGETS.forEach((target, targetIndex) => {
      if (targetIndex >= 8) return; // Max 8 morph targets

      const morphData = new Float32Array(numVertices * 3);

      // For each affected vertex, calculate the deformation vector
      target.affectedVertices.forEach((vertexIndex) => {
        if (vertexIndex >= numVertices) return;

        let dx = 0, dy = 0, dz = 0;

        if (target.deformationType === "normal") {
          // Deform along vertex normal
          dx = normals[vertexIndex * 3] * target.maxDisplacement;
          dy = normals[vertexIndex * 3 + 1] * target.maxDisplacement;
          dz = normals[vertexIndex * 3 + 2] * target.maxDisplacement;
        } else if (target.customDirection) {
          // Deform in custom direction
          const dir = target.customDirection;
          const len = Math.sqrt(dir.x * dir.x + dir.y * dir.y + dir.z * dir.z);
          dx = (dir.x / len) * target.maxDisplacement;
          dy = (dir.y / len) * target.maxDisplacement;
          dz = (dir.z / len) * target.maxDisplacement;
        }

        morphData[vertexIndex * 3] = dx;
        morphData[vertexIndex * 3 + 1] = dy;
        morphData[vertexIndex * 3 + 2] = dz;
      });

      // Store for later use
      this.morphTargetData.set(target.name, morphData);

      // Add as attribute
      geometry.setAttribute(
        `morphTarget${targetIndex}`,
        new THREE.BufferAttribute(morphData, 3)
      );
    });
  }

  /**
   * Update simulation state (filler and Botox values)
   */
  updateSimulation(state: SimulationState): void {
    if (!this.material) return;

    // Update morph weights for fillers
    const morphWeights = new Array(8).fill(0);
    FILLER_MORPH_TARGETS.forEach((target, i) => {
      if (i < 8) {
        morphWeights[i] = state.fillerValues[target.name] || 0;
      }
    });
    this.material.uniforms.morphWeights.value = morphWeights;

    // Update Botox strengths
    const botoxStrengths = new Array(5).fill(0);
    BOTOX_ZONES.forEach((zone, i) => {
      if (i < 5) {
        botoxStrengths[i] =
          (state.botoxValues[zone.name] || 0) * zone.maxBlurStrength;
      }
    });
    this.material.uniforms.botoxStrength.value = botoxStrengths;

    this.render();
  }

  /**
   * Set global intensity for all effects
   */
  setGlobalIntensity(filler: number, botox: number): void {
    if (!this.material) return;

    this.material.uniforms.globalIntensity.value = filler;
    this.material.uniforms.globalBotoxIntensity.value = botox;
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

    const aspect = width / height;
    this.camera.left = -aspect;
    this.camera.right = aspect;
    this.camera.updateProjectionMatrix();

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
