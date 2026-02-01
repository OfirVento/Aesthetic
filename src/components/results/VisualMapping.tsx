"use client";

import { useSessionStore } from "@/lib/store/session";

// Color mapping per region type
const REGION_COLORS: Record<string, string> = {
  upperFace: "bg-blue-500",
  nose: "bg-amber-500",
  lips: "bg-pink-500",
  jawline: "bg-stone-700",
  chin: "bg-stone-600",
  cheeks: "bg-emerald-500",
  nasolabial: "bg-violet-500",
  tearTroughs: "bg-cyan-500",
};

// Approximate position mapping for overlay dots
const REGION_POSITIONS: Record<string, { top: string; left: string }> = {
  upperFace: { top: "18%", left: "50%" },
  nose: { top: "42%", left: "50%" },
  lips: { top: "64%", left: "50%" },
  jawline: { top: "78%", left: "72%" },
  chin: { top: "82%", left: "50%" },
  cheeks: { top: "50%", left: "28%" },
  nasolabial: { top: "56%", left: "38%" },
  tearTroughs: { top: "36%", left: "38%" },
};

export default function VisualMapping() {
  const { capturedImage, activeImage, history } = useSessionStore();
  const displayImage = activeImage || capturedImage;

  // Get unique regions that were edited
  const editedRegions = Array.from(new Set(history.map((h) => h.region)));

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
          {editedRegions.map((region) => {
            const pos = REGION_POSITIONS[region];
            const color = REGION_COLORS[region] || "bg-stone-500";
            if (!pos) return null;

            const entry = history.findLast((h) => h.region === region);
            return (
              <div
                key={region}
                className="absolute flex flex-col items-center pointer-events-auto -translate-x-1/2"
                style={{ top: pos.top, left: pos.left }}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 border-white ${color} shadow-lg animate-pulse`}
                />
                <div className="mt-2 bg-white/95 backdrop-blur px-3 py-1 rounded-lg shadow-xl border border-stone-100">
                  <span className="text-[9px] font-black text-stone-900 uppercase">
                    {entry?.regionLabel}
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
