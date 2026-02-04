"use client";

import { useSessionStore } from "@/lib/store/session";
import type { RegionCategory, SubRegion } from "@/types";

// Color mapping per category
const CATEGORY_COLORS: Record<RegionCategory, string> = {
  lips: "bg-pink-500",
  nose: "bg-amber-500",
  upperFace: "bg-blue-500",
  underEye: "bg-cyan-500",
  cheeksMidface: "bg-emerald-500",
  lowerFace: "bg-stone-600",
};

// Approximate position mapping for overlay dots by sub-region
const SUBREGION_POSITIONS: Partial<Record<SubRegion, { top: string; left: string }>> = {
  // Lips
  lips_upperLip: { top: "62%", left: "50%" },
  lips_lowerLip: { top: "67%", left: "50%" },
  lips_vermilionBorder: { top: "64%", left: "50%" },
  lips_cupidsBow: { top: "61%", left: "50%" },
  lips_mouthCorners: { top: "64%", left: "58%" },
  // Nose
  nose_bridge: { top: "38%", left: "50%" },
  nose_tip: { top: "48%", left: "50%" },
  nose_base: { top: "52%", left: "50%" },
  // Upper Face
  upperFace_forehead: { top: "15%", left: "50%" },
  upperFace_glabella: { top: "28%", left: "50%" },
  upperFace_brow: { top: "24%", left: "62%" },
  upperFace_crowsFeet: { top: "32%", left: "75%" },
  upperFace_temples: { top: "22%", left: "78%" },
  // Under-Eye
  underEye_tearTrough: { top: "36%", left: "38%" },
  underEye_lowerEyelid: { top: "34%", left: "42%" },
  // Cheeks & Midface
  cheeksMidface_cheek: { top: "45%", left: "28%" },
  cheeksMidface_midfaceVolume: { top: "50%", left: "35%" },
  cheeksMidface_nasolabialFold: { top: "56%", left: "38%" },
  // Lower Face
  lowerFace_chin: { top: "82%", left: "50%" },
  lowerFace_jawline: { top: "78%", left: "72%" },
  lowerFace_marionetteLines: { top: "72%", left: "42%" },
  lowerFace_preJowl: { top: "76%", left: "65%" },
};

export default function VisualMapping() {
  const { capturedImage, activeImage, history } = useSessionStore();
  const displayImage = activeImage || capturedImage;

  // Get unique sub-regions that were edited
  const editedSubRegions = Array.from(new Set(history.map((h) => h.subRegion)));

  return (
    <div className="h-full flex flex-col items-center">
      <div className="relative w-full max-w-2xl aspect-[3/4] bg-white rounded-[40px] shadow-2xl border-[12px] border-white overflow-hidden">
        {displayImage && (
          <img
            src={displayImage}
            className="w-full h-full object-cover"
            alt="Final"
          />
        )}

        <div className="absolute inset-0 pointer-events-none">
          {editedSubRegions.map((subRegion) => {
            const pos = SUBREGION_POSITIONS[subRegion];
            if (!pos) return null;

            const entry = history.findLast((h) => h.subRegion === subRegion);
            if (!entry) return null;

            const color = CATEGORY_COLORS[entry.category] || "bg-stone-500";

            return (
              <div
                key={subRegion}
                className="absolute flex flex-col items-center pointer-events-auto -translate-x-1/2"
                style={{ top: pos.top, left: pos.left }}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 border-white ${color} shadow-lg animate-pulse`}
                />
                <div className="mt-2 bg-white/95 backdrop-blur px-3 py-1 rounded-lg shadow-xl border border-stone-100">
                  <span className="text-[8px] font-bold text-stone-400 uppercase block">
                    {entry.categoryLabel}
                  </span>
                  <span className="text-[9px] font-black text-stone-900 uppercase">
                    {entry.subRegionLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">
        Target Area Visualization
      </p>
    </div>
  );
}
