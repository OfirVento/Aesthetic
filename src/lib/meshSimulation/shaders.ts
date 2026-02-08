/**
 * Vertex shader for filler simulation
 * Deforms vertices along their normals based on morph target weights
 */
export const fillerVertexShader = `
  // Attributes
  attribute vec3 position;
  attribute vec3 normal;
  attribute vec2 uv;

  // Morph target attributes (up to 8 targets)
  attribute vec3 morphTarget0;
  attribute vec3 morphTarget1;
  attribute vec3 morphTarget2;
  attribute vec3 morphTarget3;
  attribute vec3 morphTarget4;
  attribute vec3 morphTarget5;
  attribute vec3 morphTarget6;
  attribute vec3 morphTarget7;

  // Uniforms
  uniform mat4 projectionMatrix;
  uniform mat4 modelViewMatrix;
  uniform float morphWeights[8];
  uniform float globalIntensity;

  // Varyings for fragment shader
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vNormal = normal;

    // Start with base position
    vec3 transformed = position;

    // Apply morph targets based on weights
    transformed += morphTarget0 * morphWeights[0] * globalIntensity;
    transformed += morphTarget1 * morphWeights[1] * globalIntensity;
    transformed += morphTarget2 * morphWeights[2] * globalIntensity;
    transformed += morphTarget3 * morphWeights[3] * globalIntensity;
    transformed += morphTarget4 * morphWeights[4] * globalIntensity;
    transformed += morphTarget5 * morphWeights[5] * globalIntensity;
    transformed += morphTarget6 * morphWeights[6] * globalIntensity;
    transformed += morphTarget7 * morphWeights[7] * globalIntensity;

    vPosition = transformed;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

/**
 * Fragment shader for texture mapping with optional Botox smoothing
 * Applies selective blur to wrinkle zones while preserving skin texture
 */
export const botoxFragmentShader = `
  precision highp float;

  // Texture
  uniform sampler2D faceTexture;
  uniform vec2 textureSize;

  // Botox zone uniforms (up to 5 zones)
  uniform vec4 botoxZone0; // minU, maxU, minV, maxV
  uniform vec4 botoxZone1;
  uniform vec4 botoxZone2;
  uniform vec4 botoxZone3;
  uniform vec4 botoxZone4;
  uniform float botoxStrength[5];
  uniform float globalBotoxIntensity;

  // Varyings
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  // Check if UV is within a zone
  float inZone(vec2 uv, vec4 zone) {
    float inX = step(zone.x, uv.x) * step(uv.x, zone.y);
    float inY = step(zone.z, uv.y) * step(uv.y, zone.w);
    return inX * inY;
  }

  // Smooth zone edge transition
  float zoneWeight(vec2 uv, vec4 zone) {
    if (zone.x >= zone.y || zone.z >= zone.w) return 0.0;

    float dx = min(uv.x - zone.x, zone.y - uv.x);
    float dy = min(uv.y - zone.z, zone.w - uv.y);
    float margin = 0.02; // Smooth edge

    float wx = smoothstep(0.0, margin, dx);
    float wy = smoothstep(0.0, margin, dy);

    return inZone(uv, zone) * wx * wy;
  }

  // Gaussian blur for wrinkle smoothing
  vec4 blurSample(vec2 uv, float radius) {
    vec4 color = vec4(0.0);
    float total = 0.0;

    vec2 texelSize = 1.0 / textureSize;

    // 9-tap Gaussian kernel
    for (int x = -1; x <= 1; x++) {
      for (int y = -1; y <= 1; y++) {
        vec2 offset = vec2(float(x), float(y)) * texelSize * radius;
        float weight = 1.0 - length(vec2(float(x), float(y))) * 0.3;
        color += texture2D(faceTexture, uv + offset) * weight;
        total += weight;
      }
    }

    return color / total;
  }

  void main() {
    // Get original texture color
    vec4 originalColor = texture2D(faceTexture, vUv);

    // Calculate total Botox effect
    float totalBlur = 0.0;

    totalBlur += zoneWeight(vUv, botoxZone0) * botoxStrength[0];
    totalBlur += zoneWeight(vUv, botoxZone1) * botoxStrength[1];
    totalBlur += zoneWeight(vUv, botoxZone2) * botoxStrength[2];
    totalBlur += zoneWeight(vUv, botoxZone3) * botoxStrength[3];
    totalBlur += zoneWeight(vUv, botoxZone4) * botoxStrength[4];

    totalBlur *= globalBotoxIntensity;
    totalBlur = clamp(totalBlur, 0.0, 1.0);

    // Apply selective blur for wrinkle smoothing
    if (totalBlur > 0.01) {
      vec4 blurredColor = blurSample(vUv, 3.0 * totalBlur);

      // Mix original with blurred based on blur strength
      // Keep color, only smooth luminance variations (wrinkles)
      vec3 originalLum = vec3(dot(originalColor.rgb, vec3(0.299, 0.587, 0.114)));
      vec3 blurredLum = vec3(dot(blurredColor.rgb, vec3(0.299, 0.587, 0.114)));

      // Preserve color, smooth only the depth/shadow variations
      vec3 colorDiff = originalColor.rgb - originalLum;
      vec3 smoothedLum = mix(originalLum, blurredLum, totalBlur * 0.7);

      gl_FragColor = vec4(smoothedLum + colorDiff, originalColor.a);
    } else {
      gl_FragColor = originalColor;
    }
  }
`;

/**
 * Simple passthrough vertex shader for full-image rendering
 */
export const simpleVertexShader = `
  attribute vec3 position;
  attribute vec2 uv;

  uniform mat4 projectionMatrix;
  uniform mat4 modelViewMatrix;

  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Simple texture fragment shader
 */
export const simpleFragmentShader = `
  precision highp float;

  uniform sampler2D faceTexture;
  varying vec2 vUv;

  void main() {
    gl_FragColor = texture2D(faceTexture, vUv);
  }
`;
