import * as THREE from "three";
import type { LandmarkPoint } from "../mediapipe";
import type { SimulationState } from "./types";
import { buildFaceMesh } from "./meshBuilder";
import { FILLER_MORPH_TARGETS, BOTOX_ZONES } from "./morphTargets";
import { faceVertexShader, faceFragmentShader } from "./shaders";

export class MeshRenderer {
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;

  // Background plane — original image, never deformed
  private bgMesh: THREE.Mesh | null = null;
  private bgMaterial: THREE.MeshBasicMaterial | null = null;

  // Face mesh — deformable triangulated mesh from landmarks
  private faceMesh: THREE.Mesh | null = null;
  private faceGeometry: THREE.BufferGeometry | null = null;
  private faceMaterial: THREE.ShaderMaterial | null = null;

  private texture: THREE.Texture | null = null;

  // Store originals so we can reset before each deformation pass
  private originalPositions: Float32Array | null = null;
  private originalNormals: Float32Array | null = null;

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

    // Orthographic camera: covers -1 to 1 on both axes
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
    // ── Load texture ────────────────────────────────────────────────────
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

    // ── Background plane — original image, sits behind the face mesh ───
    const bgGeometry = new THREE.PlaneGeometry(2, 2);
    this.bgMaterial = new THREE.MeshBasicMaterial({
      map: this.texture,
      side: THREE.FrontSide,
    });
    this.bgMesh = new THREE.Mesh(bgGeometry, this.bgMaterial);
    this.bgMesh.position.z = -0.5; // behind face mesh
    this.bgMesh.renderOrder = 0;
    this.scene.add(this.bgMesh);

    // ── Face mesh — triangulated from landmarks, deformable ────────────
    const meshData = buildFaceMesh(landmarks, this.width, this.height);

    this.faceGeometry = new THREE.BufferGeometry();
    this.faceGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(meshData.vertices), 3)
    );
    this.faceGeometry.setAttribute(
      "normal",
      new THREE.BufferAttribute(new Float32Array(meshData.normals), 3)
    );
    this.faceGeometry.setAttribute(
      "uv",
      new THREE.BufferAttribute(new Float32Array(meshData.uvs), 2)
    );
    this.faceGeometry.setIndex(
      new THREE.BufferAttribute(meshData.indices, 1)
    );

    // Keep copies for resetting before each deformation pass
    this.originalPositions = new Float32Array(meshData.vertices);
    this.originalNormals = new Float32Array(meshData.normals);

    // Build botox zone uniforms from config
    const uniforms: Record<string, { value: unknown }> = {
      faceTexture: { value: this.texture },
      textureSize: {
        value: new THREE.Vector2(
          (this.texture.image as HTMLImageElement)?.naturalWidth || this.width,
          (this.texture.image as HTMLImageElement)?.naturalHeight || this.height
        ),
      },
    };

    for (let i = 0; i < 5; i++) {
      const zone = BOTOX_ZONES[i];
      uniforms[`botoxZone${i}`] = {
        value: zone
          ? new THREE.Vector4(
              zone.uvBounds.minU,
              zone.uvBounds.maxU,
              zone.uvBounds.minV,
              zone.uvBounds.maxV
            )
          : new THREE.Vector4(0, 0, 0, 0),
      };
      uniforms[`botoxStr${i}`] = { value: 0.0 };
    }

    this.faceMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: faceVertexShader,
      fragmentShader: faceFragmentShader,
      depthTest: true,
      depthWrite: true,
    });

    this.faceMesh = new THREE.Mesh(this.faceGeometry, this.faceMaterial);
    this.faceMesh.renderOrder = 1;
    this.scene.add(this.faceMesh);

    this.render();

    console.log(
      "MeshRenderer initialized:",
      landmarks.length,
      "landmarks,",
      meshData.indices.length / 3,
      "triangles"
    );
  }

  /**
   * Apply filler (vertex deformation) and Botox (shader blur) from slider state.
   * Called on every slider change for real-time feedback.
   */
  updateSimulation(state: SimulationState): void {
    if (!this.faceGeometry || !this.originalPositions || !this.originalNormals) {
      return;
    }

    // ── Filler: CPU vertex deformation along normals ───────────────────
    const posAttr = this.faceGeometry.getAttribute("position") as THREE.BufferAttribute;
    const positions = posAttr.array as Float32Array;
    const numVertices = posAttr.count;

    // Reset to original positions
    positions.set(this.originalPositions);

    for (const target of FILLER_MORPH_TARGETS) {
      const intensity = state.fillerValues[target.name] || 0;
      if (intensity <= 0) continue;

      for (const vi of target.affectedVertices) {
        if (vi >= numVertices) continue;

        let dx: number, dy: number, dz: number;

        if (target.deformationType === "custom" && target.customDirection) {
          dx = target.customDirection.x * target.maxDisplacement * intensity;
          dy = target.customDirection.y * target.maxDisplacement * intensity;
          dz = target.customDirection.z * target.maxDisplacement * intensity;
        } else {
          // Deform along vertex normal
          dx = this.originalNormals[vi * 3] * target.maxDisplacement * intensity;
          dy = this.originalNormals[vi * 3 + 1] * target.maxDisplacement * intensity;
          dz = this.originalNormals[vi * 3 + 2] * target.maxDisplacement * intensity;
        }

        positions[vi * 3] += dx;
        positions[vi * 3 + 1] += dy;
        positions[vi * 3 + 2] += dz;
      }
    }

    posAttr.needsUpdate = true;

    // ── Botox: update shader uniforms for zone blur ────────────────────
    if (this.faceMaterial) {
      for (let i = 0; i < BOTOX_ZONES.length && i < 5; i++) {
        const zone = BOTOX_ZONES[i];
        const value = state.botoxValues[zone.name] || 0;
        this.faceMaterial.uniforms[`botoxStr${i}`].value =
          value * zone.maxBlurStrength;
      }
      this.faceMaterial.uniformsNeedUpdate = true;
    }

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
    if (this.bgMesh) {
      this.bgMesh.geometry.dispose();
      this.scene.remove(this.bgMesh);
    }
    if (this.bgMaterial) {
      this.bgMaterial.dispose();
    }
    if (this.faceMesh) {
      this.scene.remove(this.faceMesh);
    }
    if (this.faceGeometry) {
      this.faceGeometry.dispose();
    }
    if (this.faceMaterial) {
      this.faceMaterial.dispose();
    }
    if (this.texture) {
      this.texture.dispose();
    }
    this.renderer.dispose();
  }
}
