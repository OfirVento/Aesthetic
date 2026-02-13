"use client";

import { useState } from "react";
import type { RegionCategory, SubRegion } from "@/types";
import { CATEGORY_CONFIGS, getCategoryForSubRegion } from "@/components/controls/controlsConfig";
import { useSessionStore } from "@/lib/store/session";

export default function RegionPresets() {
  const {
    selectedCategory,
    selectedSubRegion,
    expandedCategories,
    acknowledgedGatedCategories,
    setSelectedCategory,
    setSelectedSubRegion,
    toggleCategoryExpanded,
    acknowledgeGatedCategory,
  } = useSessionStore();

  const [showGateWarning, setShowGateWarning] = useState<RegionCategory | null>(null);

  const handleCategoryClick = (category: RegionCategory) => {
    const config = CATEGORY_CONFIGS.find(c => c.id === category);
    if (!config) return;

    // Check if gated and not yet acknowledged
    if (config.isGated && !acknowledgedGatedCategories.includes(category)) {
      setShowGateWarning(category);
      return;
    }

    // Toggle expansion
    toggleCategoryExpanded(category);
    setSelectedCategory(category);
  };

  const handleAcknowledgeGate = (category: RegionCategory) => {
    acknowledgeGatedCategory(category);
    toggleCategoryExpanded(category);
    setSelectedCategory(category);
    setShowGateWarning(null);
  };

  const handleSubRegionClick = (subRegion: SubRegion) => {
    const category = getCategoryForSubRegion(subRegion);
    if (category) {
      setSelectedCategory(category.id);
    }
    setSelectedSubRegion(selectedSubRegion === subRegion ? null : subRegion);
  };

  // Get the config for the warning modal
  const gateWarningConfig = showGateWarning
    ? CATEGORY_CONFIGS.find(c => c.id === showGateWarning)
    : null;

  return (
    <div className="flex flex-col gap-2">
      {/* Category buttons row */}
      <div className="flex items-center gap-2 flex-wrap">
        {CATEGORY_CONFIGS.map((category) => {
          const isExpanded = expandedCategories.includes(category.id);
          const isActive = selectedCategory === category.id;
          const hasActiveSubRegion = selectedSubRegion &&
            category.subRegions.some(sr => sr.id === selectedSubRegion);

          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-1.5 ${
                isActive || hasActiveSubRegion
                  ? "bg-stone-900 text-white shadow-lg"
                  : "bg-white text-stone-500 border border-stone-200 hover:border-stone-400 hover:text-stone-700"
              }`}
            >
              {category.shortLabel}
              {category.isGated && !acknowledgedGatedCategories.includes(category.id) && (
                <span className="text-amber-400" title="Gated region">!</span>
              )}
              <span className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
          );
        })}
      </div>

      {/* Expanded sub-regions row */}
      {expandedCategories.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pl-4 border-l-2 border-stone-200">
          {CATEGORY_CONFIGS.filter(c => expandedCategories.includes(c.id)).map(category => (
            category.subRegions.map((subRegion) => {
              const isActive = selectedSubRegion === subRegion.id;
              return (
                <button
                  key={subRegion.id}
                  onClick={() => handleSubRegionClick(subRegion.id)}
                  className={`px-3 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-[0.1em] transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700"
                  }`}
                  title={subRegion.description}
                >
                  {subRegion.shortLabel}
                </button>
              );
            })
          ))}
        </div>
      )}

      {/* Gated region warning modal */}
      {showGateWarning && gateWarningConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-stone-900">{gateWarningConfig.label} Region</h3>
                <p className="text-[10px] uppercase tracking-wider text-amber-600 font-bold">Higher Risk Area</p>
              </div>
            </div>

            <p className="text-sm text-stone-600 mb-6 leading-relaxed">
              {gateWarningConfig.gateWarning}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowGateWarning(null)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-stone-200 text-stone-600 font-bold text-[10px] uppercase tracking-widest hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAcknowledgeGate(showGateWarning)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-stone-900 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-colors"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
