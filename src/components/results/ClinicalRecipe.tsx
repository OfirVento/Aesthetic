"use client";

import { useSessionStore } from "@/lib/store/session";
import { getSubRegionConfig } from "@/components/controls/controlsConfig";
import type { SubRegion, RegionCategory } from "@/types";

// Map categories to product types
const CATEGORY_PRODUCTS: Record<
  RegionCategory,
  { product: string; material: string; icon: string }
> = {
  lips: {
    product: "Lip Volumizer",
    material: "HA Soft Cohesive Filler",
    icon: "fa-droplet",
  },
  nose: {
    product: "Nasal Structural Filler",
    material: "High G-Prime HA",
    icon: "fa-droplet",
  },
  upperFace: {
    product: "Botulinum Toxin Type A",
    material: "OnabotulinumtoxinA",
    icon: "fa-syringe",
  },
  underEye: {
    product: "Periorbital Filler",
    material: "Low G-Prime HA",
    icon: "fa-droplet",
  },
  cheeksMidface: {
    product: "Midface Volume Filler",
    material: "Cross-linked HA",
    icon: "fa-droplet",
  },
  lowerFace: {
    product: "Structural Contour Filler",
    material: "Cohesive Structural HA",
    icon: "fa-droplet",
  },
};

export default function ClinicalRecipe() {
  const { history } = useSessionStore();

  // Build recipe from edit history — group by category, take latest values per sub-region
  const categoryMap = new Map<RegionCategory, Map<SubRegion, (typeof history)[0]>>();

  for (const entry of history) {
    if (!categoryMap.has(entry.category)) {
      categoryMap.set(entry.category, new Map());
    }
    categoryMap.get(entry.category)!.set(entry.subRegion, entry);
  }

  const recipeItems = Array.from(categoryMap.entries()).map(([category, subRegionMap]) => {
    const product = CATEGORY_PRODUCTS[category] || {
      product: "Custom Treatment",
      material: "As directed",
      icon: "fa-syringe",
    };

    // Get all sub-regions in this category
    const subRegions = Array.from(subRegionMap.entries()).map(([subRegionId, entry]) => {
      const config = getSubRegionConfig(subRegionId);

      // Calculate average intensity
      const values = Object.values(entry.controlValues);
      const avgIntensity = values.length > 0
        ? values.reduce((a, b) => a + b, 0) / values.length
        : 0;

      // Get active controls
      const sites = config
        ? config.controls
            .filter((c) => (entry.controlValues[c.key] ?? 0) > 0)
            .map((c) => c.label)
            .join(", ")
        : "As directed";

      return {
        label: entry.subRegionLabel,
        intensity: Math.round(avgIntensity),
        sites,
        notes: entry.notes,
      };
    });

    // Get first entry for category label
    const firstEntry = Array.from(subRegionMap.values())[0];

    return {
      ...product,
      category: firstEntry.categoryLabel,
      subRegions,
    };
  });

  return (
    <div className="bg-white rounded-[32px] border border-stone-200 p-10 shadow-sm space-y-8">
      <div className="flex justify-between items-center border-b border-stone-100 pb-6">
        <h3 className="font-serif text-2xl text-stone-800">
          Prescription Protocol
        </h3>
        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">
          Issued: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-8">
        {recipeItems.length > 0 ? (
          recipeItems.map((item, idx) => (
            <div key={idx} className="flex gap-6 items-start group">
              <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-300 group-hover:bg-stone-900 group-hover:text-white transition-all duration-300 shrink-0">
                <i className={`fa-solid ${item.icon} text-[10px]`} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-stone-900">
                    {item.product}
                  </h4>
                  <span className="text-[11px] font-bold bg-blue-50 px-3 py-1 rounded-full border border-blue-100 text-blue-700">
                    {item.category}
                  </span>
                </div>
                <p className="text-[9px] text-stone-400 uppercase tracking-widest mb-3 italic">
                  {item.material}
                </p>

                {/* Sub-regions */}
                <div className="space-y-2">
                  {item.subRegions.map((sr, srIdx) => (
                    <div key={srIdx} className="bg-stone-50/50 p-3 rounded-lg border border-stone-100/50">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-stone-700">
                          {sr.label}
                        </span>
                        <span className="text-[9px] font-bold text-stone-400">
                          {sr.intensity}% avg
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-600">
                        <span className="font-bold mr-2 text-stone-400">
                          SITES:
                        </span>
                        {sr.sites || "As directed"}
                      </p>
                      {sr.notes && (
                        <p className="text-[10px] text-stone-500 mt-1 italic">
                          Note: {sr.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center">
            <p className="text-sm italic text-stone-300">
              No treatments applied. Return to simulation to begin.
            </p>
          </div>
        )}
      </div>

      <div className="mt-12 pt-8 border-t border-stone-100">
        <div className="bg-stone-900 rounded-2xl p-6 text-white">
          <h4 className="text-[9px] font-black uppercase tracking-[0.4em] mb-3 opacity-50">
            Disclaimer
          </h4>
          <p className="text-[11px] leading-relaxed font-medium">
            Visual simulation only — not a guaranteed medical outcome. Maintain
            anatomical symmetry as primary focus. Aspirate prior to all bolus
            injections. Recommended follow-up in 14 days for toxin assessment.
          </p>
        </div>
      </div>
    </div>
  );
}
