"use client";

import type { FacialRegion } from "@/types";
import { REGION_CONFIGS } from "@/components/controls/controlsConfig";
import { useSessionStore } from "@/lib/store/session";

const REGIONS: FacialRegion[] = [
  "lips",
  "jawline",
  "chin",
  "cheeks",
  "nasolabial",
  "upperFace",
  "tearTroughs",
  "nose",
];

export default function RegionPresets() {
  const { selectedRegion, setSelectedRegion } = useSessionStore();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {REGIONS.map((region) => {
        const config = REGION_CONFIGS[region];
        const isActive = selectedRegion === region;
        return (
          <button
            key={region}
            onClick={() => setSelectedRegion(isActive ? null : region)}
            className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.15em] transition-all ${
              isActive
                ? "bg-stone-900 text-white shadow-lg"
                : "bg-white text-stone-500 border border-stone-200 hover:border-stone-400 hover:text-stone-700"
            }`}
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
