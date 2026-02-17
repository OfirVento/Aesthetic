import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

let faceLandmarker: FaceLandmarker | null = null;

export async function initFaceLandmarker(): Promise<FaceLandmarker> {
  if (faceLandmarker) return faceLandmarker;

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm"
  );

  const commonOptions = {
    runningMode: "IMAGE" as const,
    numFaces: 1,
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: false,
  };

  // Try GPU first, fall back to CPU if unavailable
  try {
    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        delegate: "GPU",
      },
      ...commonOptions,
    });
  } catch {
    console.warn("[MediaPipe] GPU delegate failed, falling back to CPU");
    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        delegate: "CPU",
      },
      ...commonOptions,
    });
  }

  return faceLandmarker;
}

export interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
}

export interface BlendshapeScore {
  categoryName: string;
  score: number;
}

export interface FaceDetectionResult {
  landmarks: LandmarkPoint[];
  blendshapes: BlendshapeScore[] | null;
}

export async function detectFaceLandmarks(
  imageElement: HTMLImageElement
): Promise<LandmarkPoint[] | null> {
  const result = await detectFaceFull(imageElement);
  return result?.landmarks ?? null;
}

/**
 * Full face detection returning landmarks (478 with iris) and 52 blendshape scores.
 * Blendshapes provide continuous expression coefficients (e.g. smile amount,
 * brow raise, jaw open) useful for expression-aware region adjustment.
 */
export async function detectFaceFull(
  imageElement: HTMLImageElement
): Promise<FaceDetectionResult | null> {
  const landmarker = await initFaceLandmarker();
  const result = landmarker.detect(imageElement);

  if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
    return null;
  }

  const landmarks = result.faceLandmarks[0].map((lm) => ({
    x: lm.x,
    y: lm.y,
    z: lm.z,
  }));

  const blendshapes: BlendshapeScore[] | null =
    result.faceBlendshapes && result.faceBlendshapes.length > 0
      ? result.faceBlendshapes[0].categories.map((c) => ({
          categoryName: c.categoryName,
          score: c.score,
        }))
      : null;

  console.log(
    `[MediaPipe] Detected ${landmarks.length} landmarks` +
      (blendshapes ? `, ${blendshapes.length} blendshapes` : "")
  );

  return { landmarks, blendshapes };
}
