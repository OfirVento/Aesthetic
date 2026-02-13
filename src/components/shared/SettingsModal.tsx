"use client";

import { useState } from "react";
import { usePromptsStore, getDefaultPrompts, type RegionPromptConfig } from "@/lib/store/prompts";
import { CATEGORY_CONFIGS } from "@/components/controls/controlsConfig";
import type { RegionCategory, SubRegion } from "@/types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "system" | RegionCategory;

const INTENSITY_LABELS = {
  slight: "Slight (1-25%)",
  noticeable: "Noticeable (26-50%)",
  significant: "Significant (51-75%)",
  dramatic: "Dramatic (76-100%)",
};

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("system");
  const [expandedSubRegion, setExpandedSubRegion] = useState<SubRegion | null>(null);
  const {
    prompts,
    setSystemPrompt,
    setRegionLocation,
    setControlPrompt,
    resetToDefaults,
  } = usePromptsStore();

  if (!isOpen) return null;

  const handleReset = () => {
    if (confirm("Reset all prompts to defaults? This cannot be undone.")) {
      resetToDefaults();
    }
  };

  const activeCategory = activeTab !== "system"
    ? CATEGORY_CONFIGS.find(c => c.id === activeTab)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-5xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Prompt Settings</h2>
            <p className="text-xs text-stone-500">
              Customize the AI prompts sent to Gemini for each sub-region and intensity level
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Reset All
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-200 hover:bg-stone-300 transition-colors"
            >
              <svg
                className="w-4 h-4 text-stone-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-4 py-2 border-b border-stone-200 flex gap-1 overflow-x-auto no-scrollbar bg-stone-50/50">
          <button
            onClick={() => setActiveTab("system")}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg whitespace-nowrap transition-colors ${
              activeTab === "system"
                ? "bg-stone-900 text-white"
                : "text-stone-600 hover:bg-stone-200"
            }`}
          >
            System
          </button>
          {CATEGORY_CONFIGS.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveTab(category.id);
                setExpandedSubRegion(null);
              }}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === category.id
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:bg-stone-200"
              }`}
            >
              {category.shortLabel}
              {category.isGated && (
                <span className={activeTab === category.id ? "text-amber-300" : "text-amber-500"}>!</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "system" ? (
            <SystemPromptEditor
              value={prompts.systemPrompt}
              onChange={setSystemPrompt}
            />
          ) : activeCategory ? (
            <CategoryPromptsEditor
              category={activeCategory}
              prompts={prompts}
              expandedSubRegion={expandedSubRegion}
              setExpandedSubRegion={setExpandedSubRegion}
              onLocationChange={setRegionLocation}
              onControlChange={setControlPrompt}
            />
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex justify-between items-center">
          <p className="text-[10px] text-stone-400">
            Changes are saved automatically to your browser
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-stone-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-black transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function SystemPromptEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const defaults = getDefaultPrompts();

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-bold text-stone-700">
            System Prompt Template
          </label>
          <button
            onClick={() => onChange(defaults.systemPrompt)}
            className="text-[10px] font-bold uppercase tracking-wider text-stone-400 hover:text-stone-600"
          >
            Reset to Default
          </button>
        </div>
        <p className="text-xs text-stone-500 mb-3">
          Use <code className="bg-stone-100 px-1 rounded">{"{TASK_PROMPT}"}</code> as
          a placeholder where the task-specific prompt will be inserted.
        </p>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-80 p-4 border border-stone-300 rounded-xl text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
          placeholder="Enter system prompt..."
        />
      </div>
    </div>
  );
}

interface CategoryConfig {
  id: RegionCategory;
  label: string;
  shortLabel: string;
  isGated: boolean;
  gateWarning?: string;
  subRegions: { id: SubRegion; label: string; shortLabel: string; description: string; controls: { key: string; label: string; description: string; }[] }[];
}

function CategoryPromptsEditor({
  category,
  prompts,
  expandedSubRegion,
  setExpandedSubRegion,
  onLocationChange,
  onControlChange,
}: {
  category: CategoryConfig;
  prompts: { regions: Record<SubRegion, RegionPromptConfig> };
  expandedSubRegion: SubRegion | null;
  setExpandedSubRegion: (sr: SubRegion | null) => void;
  onLocationChange: (region: SubRegion, location: string) => void;
  onControlChange: (
    region: SubRegion,
    control: string,
    intensity: "slight" | "noticeable" | "significant" | "dramatic",
    prompt: string
  ) => void;
}) {
  const defaults = getDefaultPrompts();

  return (
    <div className="space-y-4">
      {/* Category Header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-stone-900">{category.label}</h3>
        <p className="text-sm text-stone-500">
          {category.subRegions.length} sub-regions
          {category.isGated && (
            <span className="ml-2 text-amber-600 font-medium">Higher risk area</span>
          )}
        </p>
      </div>

      {/* Sub-region Accordion */}
      <div className="space-y-2">
        {category.subRegions.map((subRegion) => {
          const isExpanded = expandedSubRegion === subRegion.id;
          const config = prompts.regions[subRegion.id];

          return (
            <div key={subRegion.id} className="border border-stone-200 rounded-xl overflow-hidden">
              {/* Sub-region Header */}
              <button
                onClick={() => setExpandedSubRegion(isExpanded ? null : subRegion.id)}
                className="w-full px-4 py-3 flex items-center justify-between bg-stone-50 hover:bg-stone-100 transition-colors"
              >
                <div className="text-left">
                  <span className="font-bold text-stone-900">{subRegion.label}</span>
                  <span className="ml-2 text-xs text-stone-500">{subRegion.description}</span>
                </div>
                <svg
                  className={`w-5 h-5 text-stone-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="p-4 space-y-6 border-t border-stone-200">
                  {/* Location */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-bold text-stone-700">
                        Region Location Description
                      </label>
                      <button
                        onClick={() =>
                          onLocationChange(subRegion.id, defaults.regions[subRegion.id]?.location || "")
                        }
                        className="text-[10px] font-bold uppercase tracking-wider text-stone-400 hover:text-stone-600"
                      >
                        Reset
                      </button>
                    </div>
                    <input
                      type="text"
                      value={config?.location || ""}
                      onChange={(e) => onLocationChange(subRegion.id, e.target.value)}
                      className="w-full p-3 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                      placeholder="e.g., the upper lip"
                    />
                  </div>

                  {/* Controls */}
                  {subRegion.controls.map((control) => (
                    <div key={control.key} className="border border-stone-200 rounded-lg p-4 bg-stone-50/50">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-bold text-stone-800">{control.label}</h4>
                          <p className="text-xs text-stone-500">{control.description}</p>
                        </div>
                        <button
                          onClick={() => {
                            const defaultControl = defaults.regions[subRegion.id]?.controls?.[control.key];
                            if (defaultControl) {
                              (Object.entries(defaultControl) as ["slight" | "noticeable" | "significant" | "dramatic", string][]).forEach(
                                ([intensity, prompt]) => {
                                  onControlChange(subRegion.id, control.key, intensity, prompt);
                                }
                              );
                            }
                          }}
                          className="text-[10px] font-bold uppercase tracking-wider text-stone-400 hover:text-stone-600"
                        >
                          Reset
                        </button>
                      </div>

                      <div className="space-y-3">
                        {(Object.entries(INTENSITY_LABELS) as ["slight" | "noticeable" | "significant" | "dramatic", string][]).map(
                          ([intensity, label]) => (
                            <div key={intensity}>
                              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1 block">
                                {label}
                              </label>
                              <textarea
                                value={config?.controls?.[control.key]?.[intensity] || ""}
                                onChange={(e) => onControlChange(subRegion.id, control.key, intensity, e.target.value)}
                                className="w-full p-3 border border-stone-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                                rows={2}
                                placeholder={`Enter prompt for ${label.toLowerCase()}...`}
                              />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
