/**
 * Vertex shader for the deformable face mesh.
 * CPU handles vertex deformation (morph targets) — this just passes through.
 * Three.js auto-provides: position, normal, uv, projectionMatrix, modelViewMatrix
 */
export const faceVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Fragment shader for the deformable face mesh.
 * Applies selective Gaussian blur in Botox zones to simulate wrinkle relaxation.
 * Outside Botox zones, renders the original texture untouched.
 */
export const faceFragmentShader = `
  precision highp float;

  uniform sampler2D faceTexture;
  uniform vec2 textureSize;

  // Botox zones: vec4(minU, maxU, minV, maxV)
  uniform vec4 botoxZone0;
  uniform vec4 botoxZone1;
  uniform vec4 botoxZone2;
  uniform vec4 botoxZone3;
  uniform vec4 botoxZone4;

  // Per-zone blur strength (0..1)
  uniform float botoxStr0;
  uniform float botoxStr1;
  uniform float botoxStr2;
  uniform float botoxStr3;
  uniform float botoxStr4;

  varying vec2 vUv;

  float inZone(vec2 uv, vec4 zone) {
    float inX = step(zone.x, uv.x) * step(uv.x, zone.y);
    float inY = step(zone.z, uv.y) * step(uv.y, zone.w);
    return inX * inY;
  }

  float zoneWeight(vec2 uv, vec4 zone) {
    if (zone.x >= zone.y || zone.z >= zone.w) return 0.0;
    float dx = min(uv.x - zone.x, zone.y - uv.x);
    float dy = min(uv.y - zone.z, zone.w - uv.y);
    float margin = 0.03;
    float wx = smoothstep(0.0, margin, dx);
    float wy = smoothstep(0.0, margin, dy);
    return inZone(uv, zone) * wx * wy;
  }

  vec4 blurSample(vec2 uv, float radius) {
    vec4 color = vec4(0.0);
    float total = 0.0;
    vec2 texelSize = 1.0 / textureSize;

    for (int x = -2; x <= 2; x++) {
      for (int y = -2; y <= 2; y++) {
        vec2 offset = vec2(float(x), float(y)) * texelSize * radius;
        float weight = 1.0 - length(vec2(float(x), float(y))) * 0.15;
        color += texture2D(faceTexture, uv + offset) * weight;
        total += weight;
      }
    }
    return color / total;
  }

  void main() {
    vec4 originalColor = texture2D(faceTexture, vUv);

    float totalBlur = 0.0;
    totalBlur += zoneWeight(vUv, botoxZone0) * botoxStr0;
    totalBlur += zoneWeight(vUv, botoxZone1) * botoxStr1;
    totalBlur += zoneWeight(vUv, botoxZone2) * botoxStr2;
    totalBlur += zoneWeight(vUv, botoxZone3) * botoxStr3;
    totalBlur += zoneWeight(vUv, botoxZone4) * botoxStr4;

    totalBlur = clamp(totalBlur, 0.0, 1.0);

    if (totalBlur > 0.01) {
      vec4 blurredColor = blurSample(vUv, 5.0 * totalBlur);

      // Preserve chrominance, only smooth luminance variations (wrinkles)
      vec3 origLum = vec3(dot(originalColor.rgb, vec3(0.299, 0.587, 0.114)));
      vec3 blurLum = vec3(dot(blurredColor.rgb, vec3(0.299, 0.587, 0.114)));
      vec3 chroma  = originalColor.rgb - origLum;
      vec3 smoothed = mix(origLum, blurLum, totalBlur * 0.7);

      gl_FragColor = vec4(smoothed + chroma, 1.0);
    } else {
      gl_FragColor = originalColor;
    }
  }
`;
