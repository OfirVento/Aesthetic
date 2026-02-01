"use client";

import { useSessionStore } from "@/lib/store/session";
import { REGION_CONFIGS } from "@/components/controls/controlsConfig";

// Map regions to product types
const REGION_PRODUCTS: Record<
  string,
  { product: string; material: string; icon: string }
> = {
  upperFace: {
    product: "Botulinum Toxin Type A",
    material: "OnabotulinumtoxinA",
    icon: "fa-syringe",
  },
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
  jawline: {
    product: "Mandibular Contour Filler",
    material: "Cohesive Structural HA",
    icon: "fa-droplet",
  },
  chin: {
    product: "Chin Projection Filler",
    material: "Cohesive Structural HA",
    icon: "fa-droplet",
  },
  cheeks: {
    product: "Midface Volume Filler",
    material: "Cross-linked HA",
    icon: "fa-droplet",
  },
  nasolabial: {
    product: "Nasolabial Fold Filler",
    material: "Medium Cohesive HA",
    icon: "fa-droplet",
  },
  tearTroughs: {
    product: "Periorbital Filler",
    material: "Low G-Prime HA",
    icon: "fa-droplet",
  },
};

export default function ClinicalRecipe() {
  const { history } = useSessionStore();

  // Build recipe from edit history — group by region, take latest values
  const regionMap = new Map<string, (typeof history)[0]>();
  for (const entry of history) {
    regionMap.set(entry.region, entry);
  }

  const recipeItems = Array.from(regionMap.entries()).map(
    ([region, entry]) => {
      const product = REGION_PRODUCTS[region] || {
        product: "Custom Treatment",
        material: "As directed",
        icon: "fa-syringe",
      };
      const config = REGION_CONFIGS[region as keyof typeof REGION_CONFIGS];

      // Calculate approximate dosage from average of control values
      const values = Object.values(entry.controlValues);
      const avgIntensity =
        values.length > 0
          ? values.reduce((a, b) => a + b, 0) / values.length
          : 0;

      // Generate sites description from control labels
      const sites = config
        ? config.controls
            .filter((c) => (entry.controlValues[c.key] ?? 0) > 0)
            .map((c) => c.label)
            .join(", ")
        : "As directed";

      return {
        ...product,
        region: entry.regionLabel,
        intensity: Math.round(avgIntensity),
        sites,
        notes: entry.notes,
      };
    }
  );

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
                  <span className="text-[11px] font-bold bg-stone-50 px-3 py-1 rounded-full border border-stone-100">
                    {item.region} — {item.intensity}% avg
                  </span>
                </div>
                <p className="text-[9px] text-stone-400 uppercase tracking-widest mb-2 italic">
                  {item.material}
                </p>
                <div className="bg-stone-50/50 p-3 rounded-lg border border-stone-100/50">
                  <p className="text-[10px] text-stone-600">
                    <span className="font-bold mr-2 text-stone-400">
                      SITES:
                    </span>
                    {item.sites || "As directed"}
                  </p>
                  {item.notes && (
                    <p className="text-[10px] text-stone-500 mt-1 italic">
                      Note: {item.notes}
                    </p>
                  )}
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
