"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PromptConfig {
  systemPrompt: string;
  regions: Record<string, RegionPromptConfig>;
}

export interface RegionPromptConfig {
  location: string;
  controls: Record<string, ControlPromptConfig>;
}

export interface ControlPromptConfig {
  slight: string;    // 1-25%
  noticeable: string; // 26-50%
  significant: string; // 51-75%
  dramatic: string;   // 76-100%
}

const DEFAULT_PROMPTS: PromptConfig = {
  systemPrompt: `Edit this face photograph. You MUST modify the image and return a new version with the changes applied. Do NOT return the original image unchanged.

{TASK_PROMPT}

RULES:
- You MUST apply the changes described above. The output MUST look visibly different from the input.
- Keep the person's identity recognizable — same person, same background, same hair, same clothing.
- Only modify the specific facial area mentioned above.
- The result must be photorealistic, as if the person actually had this cosmetic procedure.
- Return ONLY the edited photograph as an image.`,

  regions: {
    lips: {
      location: "the lips",
      controls: {
        volume: {
          slight: "Make the lips slightly fuller, as if a small amount of lip filler was injected.",
          noticeable: "Make the lips noticeably fuller and plumper, with visibly more volume in both upper and lower lips.",
          significant: "Make the lips significantly fuller with prominent volume increase. The lips should look like they received a substantial dermal filler treatment.",
          dramatic: "Make the lips dramatically fuller and very plump. Both lips should be visibly large and voluminous, like a heavy lip filler result.",
        },
        projection: {
          slight: "Slightly increase the forward projection of the lips.",
          noticeable: "Make the lips project forward more noticeably from the face.",
          significant: "Significantly increase lip projection so they protrude forward prominently.",
          dramatic: "Dramatically increase lip projection for a very pronounced, pouty appearance.",
        },
        definition: {
          slight: "Slightly sharpen the lip border (vermillion border) for better definition.",
          noticeable: "Make the lip border clearly more defined and sharp, with a distinct cupid's bow.",
          significant: "Significantly enhance lip border definition with a very crisp, well-defined vermillion border.",
          dramatic: "Create dramatically sharp and perfectly defined lip borders with an exaggerated cupid's bow.",
        },
        width: {
          slight: "Slightly widen the lips horizontally.",
          noticeable: "Noticeably widen the lips for a broader smile shape.",
          significant: "Significantly widen the lips horizontally.",
          dramatic: "Dramatically widen the lips for a much broader mouth appearance.",
        },
      },
    },
    jawline: {
      location: "the jawline",
      controls: {
        definition: {
          slight: "Slightly sharpen the jawline for a more defined mandibular border.",
          noticeable: "Make the jawline noticeably sharper and more chiseled.",
          significant: "Create a significantly more defined, angular jawline with clear bone structure visible.",
          dramatic: "Dramatically sculpt the jawline to be extremely sharp and angular, like a model's jawline.",
        },
        contour: {
          slight: "Slightly refine the overall jawline contour for a cleaner shape.",
          noticeable: "Noticeably improve jawline contour with a smoother, more refined shape.",
          significant: "Significantly reshape the jawline contour for a sculpted, V-shaped lower face.",
          dramatic: "Dramatically reshape the jawline into a perfectly contoured, sculpted V-shape.",
        },
        angle: {
          slight: "Slightly increase the angular appearance of the jaw angle.",
          noticeable: "Make the jaw angle noticeably more angular and defined.",
          significant: "Create a significantly more angular jaw with sharp mandibular angles.",
          dramatic: "Dramatically enhance the jaw angles for an extremely angular, square-jawed appearance.",
        },
      },
    },
    chin: {
      location: "the chin",
      controls: {
        projection: {
          slight: "Slightly increase chin projection, moving it slightly forward.",
          noticeable: "Noticeably increase chin projection for better facial balance.",
          significant: "Significantly project the chin forward, like a chin implant or substantial filler.",
          dramatic: "Dramatically increase chin projection for a very prominent, strong chin.",
        },
        length: {
          slight: "Slightly elongate the chin vertically.",
          noticeable: "Noticeably lengthen the chin for a more elongated lower face.",
          significant: "Significantly lengthen the chin vertically.",
          dramatic: "Dramatically elongate the chin for a much longer lower face proportion.",
        },
        width: {
          slight: "Slightly widen the chin.",
          noticeable: "Noticeably widen the chin for a broader lower face.",
          significant: "Significantly widen the chin.",
          dramatic: "Dramatically widen the chin for a much broader appearance.",
        },
      },
    },
    cheeks: {
      location: "the cheeks",
      controls: {
        volume: {
          slight: "Add a subtle amount of volume to the cheeks, like a light cheek filler.",
          noticeable: "Add noticeable volume to the cheeks, making them fuller and rounder, like mid-face filler.",
          significant: "Add significant volume to the cheeks for prominently full, round cheekbones.",
          dramatic: "Add dramatic volume to the cheeks for very full, prominent, apple-shaped cheeks.",
        },
        lift: {
          slight: "Slightly lift the cheekbones upward for a subtle lifted appearance.",
          noticeable: "Noticeably lift the cheekbones higher on the face.",
          significant: "Significantly lift and elevate the cheekbones for a high-cheekbone look.",
          dramatic: "Dramatically lift the cheekbones to their highest position for a supermodel cheekbone effect.",
        },
        projection: {
          slight: "Slightly increase the forward projection of the cheekbones.",
          noticeable: "Noticeably increase cheekbone projection for more prominent cheeks.",
          significant: "Significantly project the cheekbones forward for very prominent mid-face structure.",
          dramatic: "Dramatically increase cheekbone projection for extremely prominent, sculpted cheekbones.",
        },
      },
    },
    nasolabial: {
      location: "the nasolabial folds (smile lines)",
      controls: {
        depthReduction: {
          slight: "Slightly reduce the depth of the nasolabial folds (smile lines from nose to mouth).",
          noticeable: "Noticeably reduce the nasolabial folds, making the smile lines visibly shallower.",
          significant: "Significantly reduce the nasolabial folds, making them much less visible.",
          dramatic: "Almost completely eliminate the nasolabial folds for a smooth transition from nose to mouth.",
        },
        smoothing: {
          slight: "Slightly smooth the skin around the nasolabial area.",
          noticeable: "Noticeably smooth and soften the nasolabial fold area.",
          significant: "Significantly smooth the entire nasolabial area for a much younger appearance.",
          dramatic: "Dramatically smooth the nasolabial area, removing nearly all creases and folds.",
        },
      },
    },
    upperFace: {
      location: "the forehead and brow area",
      controls: {
        relaxation: {
          slight: "Slightly relax the forehead lines, like a mild Botox effect.",
          noticeable: "Noticeably smooth forehead wrinkles and frown lines, like a Botox treatment.",
          significant: "Significantly relax all forehead muscles, removing most wrinkles and furrows.",
          dramatic: "Completely smooth the forehead, removing all wrinkles, lines, and furrows for a perfectly smooth forehead.",
        },
        lift: {
          slight: "Slightly lift the eyebrows upward.",
          noticeable: "Noticeably lift the brow position for a more open, refreshed eye area.",
          significant: "Significantly lift the eyebrows for a prominent brow lift effect.",
          dramatic: "Dramatically lift the eyebrows to their highest natural position, creating a very open, arched look.",
        },
        smoothing: {
          slight: "Slightly smooth the forehead skin texture.",
          noticeable: "Noticeably improve forehead skin smoothness and texture.",
          significant: "Significantly smooth the entire forehead for a refined, youthful texture.",
          dramatic: "Create a perfectly smooth, poreless forehead with flawless skin texture.",
        },
      },
    },
    tearTroughs: {
      location: "the under-eye area (tear troughs)",
      controls: {
        fill: {
          slight: "Slightly fill the under-eye hollows to reduce the tired, sunken appearance.",
          noticeable: "Noticeably fill the tear troughs, reducing dark circles and hollow appearance under the eyes.",
          significant: "Significantly fill the tear troughs for a well-rested, refreshed under-eye area with minimal hollowing.",
          dramatic: "Completely fill the tear troughs, eliminating all hollowing and dark circles under the eyes.",
        },
        smoothing: {
          slight: "Slightly smooth the under-eye skin.",
          noticeable: "Noticeably smooth the transition between lower eyelid and cheek.",
          significant: "Significantly smooth the entire under-eye area for a rejuvenated look.",
          dramatic: "Perfectly smooth the under-eye area, creating a seamless transition from eye to cheek.",
        },
      },
    },
    nose: {
      location: "the nose",
      controls: {
        bridgeHeight: {
          slight: "Slightly raise the nasal bridge height.",
          noticeable: "Noticeably increase the nasal bridge height for a more prominent nose bridge.",
          significant: "Significantly raise the nasal bridge for a higher, more defined nose profile.",
          dramatic: "Dramatically increase nasal bridge height for a very prominent, high nose bridge.",
        },
        tipProjection: {
          slight: "Slightly refine and project the nose tip forward.",
          noticeable: "Noticeably project the nasal tip forward for better tip definition.",
          significant: "Significantly increase nose tip projection for a more prominent, defined tip.",
          dramatic: "Dramatically project the nose tip forward with maximum tip refinement.",
        },
        width: {
          slight: "Slightly narrow the nostrils and overall nose width.",
          noticeable: "Noticeably narrow the nose, reducing nostril width for a slimmer nose.",
          significant: "Significantly narrow the nose for a much slimmer nasal appearance.",
          dramatic: "Dramatically narrow the nose for the slimmest possible natural appearance.",
        },
      },
    },
  },
};

interface PromptsStore {
  prompts: PromptConfig;
  setSystemPrompt: (prompt: string) => void;
  setRegionLocation: (region: string, location: string) => void;
  setControlPrompt: (
    region: string,
    control: string,
    intensity: "slight" | "noticeable" | "significant" | "dramatic",
    prompt: string
  ) => void;
  resetToDefaults: () => void;
}

export const usePromptsStore = create<PromptsStore>()(
  persist(
    (set) => ({
      prompts: DEFAULT_PROMPTS,

      setSystemPrompt: (prompt) =>
        set((state) => ({
          prompts: { ...state.prompts, systemPrompt: prompt },
        })),

      setRegionLocation: (region, location) =>
        set((state) => ({
          prompts: {
            ...state.prompts,
            regions: {
              ...state.prompts.regions,
              [region]: {
                ...state.prompts.regions[region],
                location,
              },
            },
          },
        })),

      setControlPrompt: (region, control, intensity, prompt) =>
        set((state) => ({
          prompts: {
            ...state.prompts,
            regions: {
              ...state.prompts.regions,
              [region]: {
                ...state.prompts.regions[region],
                controls: {
                  ...state.prompts.regions[region].controls,
                  [control]: {
                    ...state.prompts.regions[region].controls[control],
                    [intensity]: prompt,
                  },
                },
              },
            },
          },
        })),

      resetToDefaults: () => set({ prompts: DEFAULT_PROMPTS }),
    }),
    {
      name: "aesthetic-prompts",
    }
  )
);

export const getDefaultPrompts = () => DEFAULT_PROMPTS;
