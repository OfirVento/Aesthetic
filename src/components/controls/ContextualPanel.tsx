"use client";

import { useSessionStore } from "@/lib/store/session";
import { REGION_CONFIGS } from "./controlsConfig";

export default function ContextualPanel() {
  const {
    selectedRegion,
    controlValues,
    setControlValue,
    notes,
    setNotes,
    isProcessing,
  } = useSessionStore();

  if (!selectedRegion) return null;

  const config = REGION_CONFIGS[selectedRegion];
  if (!config) return null;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xl p-5 w-72 fade-in">
      <div className="mb-4">
        <h3 className="font-serif text-lg text-stone-800">{config.label}</h3>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 mt-1">
          Contextual Controls
        </p>
      </div>

      <div className="space-y-5">
        {config.controls.map((control) => {
          const value = controlValues[control.key] ?? 0;
          return (
            <div key={control.key} className="space-y-2">
              <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-[0.12em]">
                <span className="text-stone-500">{control.label}</span>
                <span
                  className={value > 0 ? "text-stone-900" : "text-stone-300"}
                >
                  {value}%
                </span>
              </div>
              <div className="relative h-4 flex items-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={value}
                  onChange={(e) =>
                    setControlValue(control.key, parseInt(e.target.value))
                  }
                  disabled={isProcessing}
                  className="w-full h-1 appearance-none rounded-full cursor-pointer z-10 relative"
                />
                <div className="absolute inset-0 flex items-center pointer-events-none">
                  <div className="w-full h-1 bg-stone-200/50 rounded-full">
                    <div
                      className="h-full bg-stone-900 rounded-full transition-all"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-stone-400 italic">
                {control.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-stone-100">
        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 block mb-2">
          Additional Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add specific instructions..."
          disabled={isProcessing}
          className="w-full text-xs text-stone-700 bg-stone-50 border border-stone-200 rounded-lg p-3 resize-none h-16 focus:outline-none focus:border-stone-400 placeholder:text-stone-300"
        />
      </div>
    </div>
  );
}
