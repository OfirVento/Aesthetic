import type { LandmarkPoint } from "../mediapipe";
import type { MeshData } from "./types";

// MediaPipe Face Mesh triangulation indices
// This defines how the 468 landmarks connect to form triangles
// Source: https://github.com/google/mediapipe/blob/master/mediapipe/modules/face_geometry/data/canonical_face_model_uv_visualization.png
const FACE_MESH_TRIANGLES = [
  // Forehead region
  10, 338, 297, 10, 297, 332, 10, 332, 284, 10, 284, 251, 10, 251, 389,
  10, 389, 356, 10, 356, 454, 10, 454, 323, 10, 323, 361, 10, 361, 288,
  10, 288, 397, 10, 397, 365, 10, 365, 379, 10, 379, 378, 10, 378, 400,
  10, 400, 377, 10, 377, 152, 10, 152, 148, 10, 148, 176, 10, 176, 149,
  10, 149, 150, 10, 150, 136, 10, 136, 172, 10, 172, 58, 10, 58, 132,
  10, 132, 93, 10, 93, 234, 10, 234, 127, 10, 127, 162, 10, 162, 21,
  10, 21, 54, 10, 54, 103, 10, 103, 67, 10, 67, 109, 10, 109, 10,

  // Left eye region
  33, 7, 163, 33, 163, 144, 33, 144, 145, 33, 145, 153, 33, 153, 154,
  33, 154, 155, 33, 155, 133, 33, 133, 173, 33, 173, 157, 33, 157, 158,
  33, 158, 159, 33, 159, 160, 33, 160, 161, 33, 161, 246, 33, 246, 33,

  // Right eye region
  263, 249, 390, 263, 390, 373, 263, 373, 374, 263, 374, 380, 263, 380, 381,
  263, 381, 382, 263, 382, 362, 263, 362, 398, 263, 398, 384, 263, 384, 385,
  263, 385, 386, 263, 386, 387, 263, 387, 388, 263, 388, 466, 263, 466, 263,

  // Nose region
  1, 2, 98, 1, 98, 327, 2, 326, 327, 2, 327, 98,
  4, 5, 195, 4, 195, 197, 4, 197, 6, 4, 6, 168,

  // Lips region - upper lip
  0, 267, 269, 0, 269, 270, 0, 270, 409, 0, 409, 291, 0, 291, 375,
  0, 375, 321, 0, 321, 405, 0, 405, 314, 0, 314, 17, 0, 17, 84,
  0, 84, 181, 0, 181, 91, 0, 91, 146, 0, 146, 61, 0, 61, 185,
  0, 185, 40, 0, 40, 39, 0, 39, 37, 0, 37, 0,

  // Lips region - lower lip
  14, 87, 178, 14, 178, 88, 14, 88, 95, 14, 95, 78, 14, 78, 191,
  14, 191, 80, 14, 80, 81, 14, 81, 82, 14, 82, 13, 14, 13, 312,
  14, 312, 311, 14, 311, 310, 14, 310, 415, 14, 415, 308, 14, 308, 324,
  14, 324, 318, 14, 318, 402, 14, 402, 317, 14, 317, 14,

  // Cheeks - left
  116, 117, 118, 116, 118, 119, 116, 119, 120, 116, 120, 121,
  116, 121, 128, 116, 128, 245, 116, 245, 193, 116, 193, 122,

  // Cheeks - right
  345, 346, 347, 345, 347, 348, 345, 348, 349, 345, 349, 350,
  345, 350, 357, 345, 357, 465, 345, 465, 417, 345, 417, 351,

  // Jawline - simplified
  172, 136, 150, 172, 150, 149, 172, 149, 176, 172, 176, 148,
  172, 148, 152, 152, 377, 400, 152, 400, 378, 152, 378, 379,
  152, 379, 365, 152, 365, 397, 152, 397, 288,

  // Chin
  17, 84, 181, 17, 181, 91, 17, 91, 146, 146, 61, 43, 146, 43, 106,
  17, 314, 405, 17, 405, 321, 17, 321, 375, 375, 291, 273, 375, 273, 335,
];

/**
 * Build a 3D mesh from MediaPipe face landmarks
 * Uses Delaunay triangulation based on the standard face mesh topology
 */
export function buildFaceMesh(
  landmarks: LandmarkPoint[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _imageWidth: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _imageHeight: number
): MeshData {
  const numVertices = landmarks.length;

  // Create vertex positions (normalized to -1 to 1 range for Three.js)
  const vertices = new Float32Array(numVertices * 3);
  const uvs = new Float32Array(numVertices * 2);
  const normals = new Float32Array(numVertices * 3);

  for (let i = 0; i < numVertices; i++) {
    const lm = landmarks[i];

    // Convert normalized coordinates to Three.js space
    // X: 0-1 -> -1 to 1 (flip because image is mirrored)
    // Y: 0-1 -> 1 to -1 (flip Y axis)
    // Z: use the depth from MediaPipe (scale appropriately)
    vertices[i * 3] = (lm.x - 0.5) * 2;
    vertices[i * 3 + 1] = -(lm.y - 0.5) * 2;
    vertices[i * 3 + 2] = -lm.z * 0.5; // Scale depth for subtle 3D effect

    // UV coordinates match the original image
    uvs[i * 2] = lm.x;
    uvs[i * 2 + 1] = 1 - lm.y; // Flip V for texture coordinates

    // Initialize normals pointing toward camera (will be computed properly later)
    normals[i * 3] = 0;
    normals[i * 3 + 1] = 0;
    normals[i * 3 + 2] = 1;
  }

  // Filter triangles to only include valid indices
  const validTriangles: number[] = [];
  for (let i = 0; i < FACE_MESH_TRIANGLES.length; i += 3) {
    const a = FACE_MESH_TRIANGLES[i];
    const b = FACE_MESH_TRIANGLES[i + 1];
    const c = FACE_MESH_TRIANGLES[i + 2];

    if (a < numVertices && b < numVertices && c < numVertices) {
      validTriangles.push(a, b, c);
    }
  }

  const indices = new Uint16Array(validTriangles);

  // Compute proper normals from triangles
  computeNormals(vertices, indices, normals);

  return { vertices, uvs, indices, normals };
}

/**
 * Compute vertex normals from triangle faces
 */
function computeNormals(
  vertices: Float32Array,
  indices: Uint16Array,
  normals: Float32Array
): void {
  // Reset normals
  normals.fill(0);

  // Accumulate face normals to vertices
  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i];
    const b = indices[i + 1];
    const c = indices[i + 2];

    // Get vertices
    const ax = vertices[a * 3], ay = vertices[a * 3 + 1], az = vertices[a * 3 + 2];
    const bx = vertices[b * 3], by = vertices[b * 3 + 1], bz = vertices[b * 3 + 2];
    const cx = vertices[c * 3], cy = vertices[c * 3 + 1], cz = vertices[c * 3 + 2];

    // Compute edges
    const e1x = bx - ax, e1y = by - ay, e1z = bz - az;
    const e2x = cx - ax, e2y = cy - ay, e2z = cz - az;

    // Cross product for face normal
    const nx = e1y * e2z - e1z * e2y;
    const ny = e1z * e2x - e1x * e2z;
    const nz = e1x * e2y - e1y * e2x;

    // Add to each vertex
    normals[a * 3] += nx; normals[a * 3 + 1] += ny; normals[a * 3 + 2] += nz;
    normals[b * 3] += nx; normals[b * 3 + 1] += ny; normals[b * 3 + 2] += nz;
    normals[c * 3] += nx; normals[c * 3 + 1] += ny; normals[c * 3 + 2] += nz;
  }

  // Normalize
  const numVertices = vertices.length / 3;
  for (let i = 0; i < numVertices; i++) {
    const x = normals[i * 3];
    const y = normals[i * 3 + 1];
    const z = normals[i * 3 + 2];
    const len = Math.sqrt(x * x + y * y + z * z);

    if (len > 0) {
      normals[i * 3] = x / len;
      normals[i * 3 + 1] = y / len;
      normals[i * 3 + 2] = z / len;
    } else {
      // Default to facing camera
      normals[i * 3 + 2] = 1;
    }
  }
}

/**
 * Create a simple rectangular mesh for the full image
 * Used as a fallback or for non-face regions
 */
export function buildFullImageMesh(): MeshData {
  const vertices = new Float32Array([
    -1, -1, 0,  // bottom-left
     1, -1, 0,  // bottom-right
     1,  1, 0,  // top-right
    -1,  1, 0,  // top-left
  ]);

  const uvs = new Float32Array([
    0, 0,  // bottom-left
    1, 0,  // bottom-right
    1, 1,  // top-right
    0, 1,  // top-left
  ]);

  const indices = new Uint16Array([
    0, 1, 2,
    0, 2, 3,
  ]);

  const normals = new Float32Array([
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
  ]);

  return { vertices, uvs, indices, normals };
}
