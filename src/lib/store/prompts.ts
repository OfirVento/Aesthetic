"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SubRegion } from "@/types";

export interface PromptConfig {
  systemPrompt: string;
  regions: Record<SubRegion, RegionPromptConfig>;
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
    // ============================================================================
    // LIPS (5 sub-regions)
    // ============================================================================

    lips_upperLip: {
      location: "the upper lip",
      controls: {
        volume: {
          slight: "Add a subtle amount of volume to the upper lip.",
          noticeable: "Noticeably increase upper lip fullness and plumpness.",
          significant: "Significantly enhance upper lip volume for prominent fullness.",
          dramatic: "Dramatically augment the upper lip for very full, pouty appearance.",
        },
        projection: {
          slight: "Slightly increase upper lip forward projection.",
          noticeable: "Noticeably project the upper lip forward.",
          significant: "Significantly increase upper lip projection.",
          dramatic: "Dramatically project the upper lip for maximum pout.",
        },
        eversion: {
          slight: "Slightly evert the upper lip (increase lip flip).",
          noticeable: "Noticeably increase upper lip eversion for more visible vermilion.",
          significant: "Significantly flip the upper lip outward.",
          dramatic: "Dramatically evert the upper lip for maximum visible red lip.",
        },
      },
    },

    lips_lowerLip: {
      location: "the lower lip",
      controls: {
        volume: {
          slight: "Add subtle volume to the lower lip.",
          noticeable: "Noticeably increase lower lip fullness.",
          significant: "Significantly augment lower lip volume.",
          dramatic: "Dramatically enhance lower lip for very full appearance.",
        },
        projection: {
          slight: "Slightly project the lower lip forward.",
          noticeable: "Noticeably increase lower lip projection.",
          significant: "Significantly project the lower lip.",
          dramatic: "Dramatically project the lower lip for maximum pout.",
        },
        definition: {
          slight: "Slightly enhance lower lip border definition.",
          noticeable: "Noticeably sharpen the lower lip border.",
          significant: "Significantly define the lower lip vermilion border.",
          dramatic: "Create dramatically sharp lower lip definition.",
        },
      },
    },

    lips_vermilionBorder: {
      location: "the lip border (vermilion border)",
      controls: {
        definition: {
          slight: "Slightly enhance the vermilion border definition.",
          noticeable: "Noticeably sharpen and define the lip border.",
          significant: "Significantly crisp up the vermilion border all around.",
          dramatic: "Create dramatically sharp, perfectly defined lip borders.",
        },
        enhancement: {
          slight: "Slightly enhance the white roll visibility.",
          noticeable: "Noticeably increase white roll prominence.",
          significant: "Significantly enhance the white roll for defined borders.",
          dramatic: "Dramatically enhance white roll for maximum border visibility.",
        },
      },
    },

    lips_cupidsBow: {
      location: "the cupid's bow (upper lip peaks)",
      controls: {
        definition: {
          slight: "Slightly sharpen the cupid's bow peaks.",
          noticeable: "Noticeably define the cupid's bow shape.",
          significant: "Significantly enhance cupid's bow definition.",
          dramatic: "Create a dramatically sharp, pronounced cupid's bow.",
        },
        height: {
          slight: "Slightly increase cupid's bow peak height.",
          noticeable: "Noticeably raise the cupid's bow peaks.",
          significant: "Significantly elevate the cupid's bow peaks.",
          dramatic: "Dramatically raise cupid's bow for exaggerated peaks.",
        },
      },
    },

    lips_mouthCorners: {
      location: "the mouth corners (oral commissures)",
      controls: {
        lift: {
          slight: "Slightly lift the mouth corners upward.",
          noticeable: "Noticeably elevate the oral commissures for a happier look.",
          significant: "Significantly lift mouth corners to reduce downturn.",
          dramatic: "Dramatically lift mouth corners for an upturned smile.",
        },
        volumization: {
          slight: "Add subtle volume to the mouth corners.",
          noticeable: "Noticeably fill the mouth corners for smoother transition.",
          significant: "Significantly volumize the oral commissures.",
          dramatic: "Dramatically augment mouth corners for full support.",
        },
      },
    },

    // ============================================================================
    // NOSE (3 sub-regions) - GATED
    // ============================================================================

    nose_bridge: {
      location: "the nasal bridge (dorsum)",
      controls: {
        height: {
          slight: "Slightly raise the nasal bridge height.",
          noticeable: "Noticeably increase dorsal height for a more prominent bridge.",
          significant: "Significantly elevate the nasal bridge.",
          dramatic: "Dramatically raise the nasal bridge for a very high profile.",
        },
        smoothing: {
          slight: "Slightly smooth the nasal bridge to reduce any bump.",
          noticeable: "Noticeably smooth the dorsum for a straighter profile.",
          significant: "Significantly smooth the bridge, removing visible humps.",
          dramatic: "Create a perfectly straight, smooth nasal bridge.",
        },
        width: {
          slight: "Slightly narrow the nasal bridge width.",
          noticeable: "Noticeably reduce bridge width for a slimmer profile.",
          significant: "Significantly narrow the nasal bridge.",
          dramatic: "Dramatically slim the bridge for a very narrow appearance.",
        },
      },
    },

    nose_tip: {
      location: "the nose tip",
      controls: {
        projection: {
          slight: "Slightly increase nose tip projection.",
          noticeable: "Noticeably project the nasal tip forward.",
          significant: "Significantly enhance tip projection.",
          dramatic: "Dramatically project the tip for maximum definition.",
        },
        rotation: {
          slight: "Slightly rotate the nose tip upward.",
          noticeable: "Noticeably upturn the nasal tip.",
          significant: "Significantly rotate the tip upward for a lifted appearance.",
          dramatic: "Dramatically upturn the nose tip for maximum rotation.",
        },
        definition: {
          slight: "Slightly refine and sharpen the nose tip.",
          noticeable: "Noticeably define the tip for better shape.",
          significant: "Significantly refine the tip for a sculpted appearance.",
          dramatic: "Create a dramatically refined, perfectly defined nose tip.",
        },
      },
    },

    nose_base: {
      location: "the nose base and nostrils (alar base)",
      controls: {
        width: {
          slight: "Slightly narrow the alar base width.",
          noticeable: "Noticeably reduce nostril width.",
          significant: "Significantly narrow the alar base.",
          dramatic: "Dramatically narrow the nostril width for slim nostrils.",
        },
        flare: {
          slight: "Slightly reduce nostril flare.",
          noticeable: "Noticeably decrease alar flare for a refined base.",
          significant: "Significantly reduce nostril flaring.",
          dramatic: "Dramatically minimize nostril flare for a compact base.",
        },
      },
    },

    // ============================================================================
    // UPPER FACE (5 sub-regions)
    // ============================================================================

    upperFace_forehead: {
      location: "the forehead",
      controls: {
        smoothing: {
          slight: "Slightly smooth forehead lines and wrinkles.",
          noticeable: "Noticeably reduce forehead wrinkles for smoother skin.",
          significant: "Significantly smooth the forehead, reducing most lines.",
          dramatic: "Create a perfectly smooth, wrinkle-free forehead.",
        },
        relaxation: {
          slight: "Slightly relax the forehead muscles, like mild Botox.",
          noticeable: "Noticeably relax forehead for a fresher appearance.",
          significant: "Significantly relax the forehead muscles.",
          dramatic: "Completely relax forehead muscles for maximum smoothing.",
        },
        contouring: {
          slight: "Slightly refine forehead contour and shape.",
          noticeable: "Noticeably improve forehead proportions.",
          significant: "Significantly contour the forehead shape.",
          dramatic: "Dramatically reshape forehead for ideal proportions.",
        },
      },
    },

    upperFace_glabella: {
      location: "the glabella (frown lines between eyebrows)",
      controls: {
        relaxation: {
          slight: "Slightly relax the glabellar lines (11s).",
          noticeable: "Noticeably soften frown lines between brows.",
          significant: "Significantly relax glabellar muscles, reducing 11 lines.",
          dramatic: "Completely smooth the glabella, eliminating frown lines.",
        },
        smoothing: {
          slight: "Slightly smooth the glabellar crease.",
          noticeable: "Noticeably reduce the vertical frown crease.",
          significant: "Significantly smooth the glabellar area.",
          dramatic: "Create a perfectly smooth glabella with no creases.",
        },
      },
    },

    upperFace_brow: {
      location: "the eyebrows",
      controls: {
        lift: {
          slight: "Slightly lift the eyebrow position.",
          noticeable: "Noticeably elevate the brows for a refreshed look.",
          significant: "Significantly lift the eyebrows for an open-eye effect.",
          dramatic: "Dramatically lift brows for maximum elevation.",
        },
        arch: {
          slight: "Slightly enhance the brow arch.",
          noticeable: "Noticeably increase brow arch height.",
          significant: "Significantly arch the eyebrows for a sculpted look.",
          dramatic: "Create dramatically arched brows for maximum definition.",
        },
        tail: {
          slight: "Slightly lift the lateral brow tail.",
          noticeable: "Noticeably elevate the outer brow for a cat-eye effect.",
          significant: "Significantly lift the brow tail upward.",
          dramatic: "Dramatically lift the lateral brow for maximum lift.",
        },
      },
    },

    upperFace_crowsFeet: {
      location: "the crow's feet (lateral orbital lines)",
      controls: {
        smoothing: {
          slight: "Slightly smooth the crow's feet wrinkles.",
          noticeable: "Noticeably reduce lateral eye wrinkles.",
          significant: "Significantly smooth crow's feet for a youthful look.",
          dramatic: "Eliminate crow's feet for perfectly smooth eye corners.",
        },
        relaxation: {
          slight: "Slightly relax the orbicularis oculi muscle.",
          noticeable: "Noticeably relax the eye area muscles.",
          significant: "Significantly relax muscles around the eyes.",
          dramatic: "Completely relax eye corner muscles for maximum smoothing.",
        },
      },
    },

    upperFace_temples: {
      location: "the temples",
      controls: {
        volume: {
          slight: "Slightly fill the temple hollows.",
          noticeable: "Noticeably restore temple volume.",
          significant: "Significantly fill temples for a youthful convexity.",
          dramatic: "Dramatically augment temples for maximum fullness.",
        },
        contouring: {
          slight: "Slightly improve temple contour.",
          noticeable: "Noticeably reshape temple area for better proportions.",
          significant: "Significantly contour temples for ideal shape.",
          dramatic: "Dramatically sculpt temples for perfect facial balance.",
        },
      },
    },

    // ============================================================================
    // UNDER-EYE (2 sub-regions)
    // ============================================================================

    underEye_tearTrough: {
      location: "the tear trough (under-eye hollow)",
      controls: {
        fill: {
          slight: "Slightly fill the tear trough hollow.",
          noticeable: "Noticeably reduce under-eye hollowing.",
          significant: "Significantly fill tear troughs for a rested look.",
          dramatic: "Completely fill tear troughs for maximum rejuvenation.",
        },
        smoothing: {
          slight: "Slightly smooth the tear trough transition.",
          noticeable: "Noticeably blend the under-eye to cheek transition.",
          significant: "Significantly smooth the tear trough area.",
          dramatic: "Create a perfectly smooth under-eye to cheek transition.",
        },
        darkness: {
          slight: "Slightly reduce dark circle appearance.",
          noticeable: "Noticeably brighten under-eye darkness.",
          significant: "Significantly reduce dark circles.",
          dramatic: "Eliminate dark circles for bright under-eyes.",
        },
      },
    },

    underEye_lowerEyelid: {
      location: "the lower eyelid",
      controls: {
        tightening: {
          slight: "Slightly tighten lower eyelid skin.",
          noticeable: "Noticeably firm the lower eyelid.",
          significant: "Significantly tighten lower lid skin.",
          dramatic: "Dramatically firm lower eyelids for maximum tightening.",
        },
        smoothing: {
          slight: "Slightly smooth fine lines on lower lids.",
          noticeable: "Noticeably reduce lower eyelid wrinkles.",
          significant: "Significantly smooth lower lid texture.",
          dramatic: "Create perfectly smooth lower eyelids.",
        },
      },
    },

    // ============================================================================
    // CHEEKS & MIDFACE (3 sub-regions)
    // ============================================================================

    cheeksMidface_cheek: {
      location: "the cheeks (malar region)",
      controls: {
        volume: {
          slight: "Add subtle volume to the cheekbones.",
          noticeable: "Noticeably increase malar fullness.",
          significant: "Significantly augment cheek volume.",
          dramatic: "Dramatically enhance cheeks for prominent cheekbones.",
        },
        lift: {
          slight: "Slightly lift the cheekbone position.",
          noticeable: "Noticeably elevate the malar area.",
          significant: "Significantly lift cheeks for a youthful position.",
          dramatic: "Dramatically lift cheekbones for maximum elevation.",
        },
        projection: {
          slight: "Slightly increase cheekbone projection.",
          noticeable: "Noticeably project cheekbones forward.",
          significant: "Significantly enhance malar projection.",
          dramatic: "Dramatically project cheekbones for sculpted look.",
        },
      },
    },

    cheeksMidface_midfaceVolume: {
      location: "the midface (central cheek area)",
      controls: {
        volume: {
          slight: "Add subtle midface volume.",
          noticeable: "Noticeably restore central face fullness.",
          significant: "Significantly augment midface volume.",
          dramatic: "Dramatically fill the midface for youthful fullness.",
        },
        lift: {
          slight: "Slightly lift the midface tissues.",
          noticeable: "Noticeably elevate the central face.",
          significant: "Significantly lift midface for anti-aging effect.",
          dramatic: "Dramatically lift midface for maximum rejuvenation.",
        },
      },
    },

    cheeksMidface_nasolabialFold: {
      location: "the nasolabial folds (smile lines)",
      controls: {
        depthReduction: {
          slight: "Slightly reduce nasolabial fold depth.",
          noticeable: "Noticeably soften smile lines.",
          significant: "Significantly reduce nasolabial fold visibility.",
          dramatic: "Nearly eliminate nasolabial folds.",
        },
        smoothing: {
          slight: "Slightly smooth the nasolabial area.",
          noticeable: "Noticeably blend the nasolabial transition.",
          significant: "Significantly smooth smile line area.",
          dramatic: "Create a perfectly smooth nose-to-mouth transition.",
        },
      },
    },

    // ============================================================================
    // LOWER FACE (4 sub-regions)
    // ============================================================================

    lowerFace_chin: {
      location: "the chin",
      controls: {
        projection: {
          slight: "Slightly increase chin projection.",
          noticeable: "Noticeably project the chin forward.",
          significant: "Significantly enhance chin projection.",
          dramatic: "Dramatically project chin for a strong profile.",
        },
        length: {
          slight: "Slightly elongate the chin vertically.",
          noticeable: "Noticeably lengthen the chin.",
          significant: "Significantly increase chin length.",
          dramatic: "Dramatically elongate chin for longer lower face.",
        },
        width: {
          slight: "Slightly widen the chin.",
          noticeable: "Noticeably increase chin width.",
          significant: "Significantly broaden the chin.",
          dramatic: "Dramatically widen chin for a square jaw effect.",
        },
      },
    },

    lowerFace_jawline: {
      location: "the jawline",
      controls: {
        definition: {
          slight: "Slightly sharpen jawline definition.",
          noticeable: "Noticeably enhance mandibular border.",
          significant: "Significantly define the jawline.",
          dramatic: "Create a dramatically sharp, chiseled jawline.",
        },
        contour: {
          slight: "Slightly refine jawline contour.",
          noticeable: "Noticeably improve jaw shape.",
          significant: "Significantly sculpt the jawline contour.",
          dramatic: "Dramatically reshape jaw for ideal contour.",
        },
        angle: {
          slight: "Slightly enhance the jaw angle.",
          noticeable: "Noticeably increase jaw angle definition.",
          significant: "Significantly sharpen the mandibular angle.",
          dramatic: "Create dramatically angular jaw angles.",
        },
      },
    },

    lowerFace_marionetteLines: {
      location: "the marionette lines (mouth-to-chin lines)",
      controls: {
        depthReduction: {
          slight: "Slightly reduce marionette line depth.",
          noticeable: "Noticeably soften corner-to-chin lines.",
          significant: "Significantly reduce marionette line visibility.",
          dramatic: "Nearly eliminate marionette lines.",
        },
        smoothing: {
          slight: "Slightly smooth the marionette area.",
          noticeable: "Noticeably blend the mouth corner to chin.",
          significant: "Significantly smooth marionette region.",
          dramatic: "Create perfectly smooth mouth-to-chin transition.",
        },
      },
    },

    lowerFace_preJowl: {
      location: "the pre-jowl area (lateral chin)",
      controls: {
        volume: {
          slight: "Slightly fill the pre-jowl sulcus.",
          noticeable: "Noticeably restore pre-jowl volume.",
          significant: "Significantly fill the pre-jowl area.",
          dramatic: "Dramatically augment pre-jowl for smooth jawline.",
        },
        contouring: {
          slight: "Slightly improve jawline continuity.",
          noticeable: "Noticeably smooth the pre-jowl contour.",
          significant: "Significantly contour the pre-jowl area.",
          dramatic: "Create perfect jawline continuity with no sulcus.",
        },
      },
    },
  },
};

interface PromptsStore {
  prompts: PromptConfig;
  setSystemPrompt: (prompt: string) => void;
  setRegionLocation: (region: SubRegion, location: string) => void;
  setControlPrompt: (
    region: SubRegion,
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
                  ...state.prompts.regions[region]?.controls,
                  [control]: {
                    ...state.prompts.regions[region]?.controls?.[control],
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
      name: "aesthetic-prompts-v2", // New key to avoid conflicts with old data
    }
  )
);

export const getDefaultPrompts = () => DEFAULT_PROMPTS;
