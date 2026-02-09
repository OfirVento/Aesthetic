"use client";

import { useMemo } from "react";
import { useSessionStore } from "@/lib/store/session";

export default function ComparisonView() {
  const { capturedImage, activeImage, isProcessing, maskOverlay, selectedRegion, controlValues, selectedSubRegion } =
    useSessionStore();

  // Show a visual hint on the Design panel when sliders have values but haven't been applied yet
  const hasUnappliedChanges = useMemo(() => {
    return selectedSubRegion && Object.values(controlValues).some((v) => v > 0);
  }, [selectedSubRegion, controlValues]);

  return (
    <div className="flex-1 p-6 flex gap-6 min-h-0 items-stretch justify-center">
      {/* Baseline Panel */}
      <div className="flex-1 flex flex-col min-h-0">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mb-3 text-center">
          Baseline
        </span>
        <div className="flex-1 rounded-[32px] overflow-hidden bg-white shadow-xl border border-stone-200 relative min-h-0 group">
          {capturedImage ? (
            <>
              <img
                src={capturedImage}
                className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-1000"
                alt="Baseline"
              />
              {/* Mask overlay on baseline image */}
              {maskOverlay && selectedRegion && (
                <img
                  src={maskOverlay}
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-300"
                  alt="Region mask"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-300 text-sm">
              No image
            </div>
          )}
          <div className="absolute top-5 left-5 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full border border-stone-100 text-[10px] font-black tracking-widest uppercase text-stone-800 shadow-sm">
            Original
          </div>
          {selectedRegion && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-4 py-2 bg-blue-500/90 backdrop-blur-md rounded-full text-[9px] font-black tracking-widest uppercase text-white shadow-lg">
              Region Selected
            </div>
          )}
        </div>
      </div>

      {/* Design Panel */}
      <div className="flex-1 flex flex-col min-h-0">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mb-3 text-center">
          Design
        </span>
        <div className="flex-1 rounded-[32px] overflow-hidden bg-white shadow-xl border border-stone-200 relative min-h-0 group">
          {isProcessing && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 backdrop-blur-md">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-900/60">
                  Generating...
                </span>
              </div>
            </div>
          )}
          <img
            src={activeImage || capturedImage || ""}
            className={`w-full h-full object-contain group-hover:scale-[1.02] transition-all duration-1000 ${
              isProcessing ? "opacity-30 blur-sm" : "opacity-100"
            }`}
            alt="Simulation"
          />
          <div className="absolute top-5 right-5 px-4 py-2 bg-stone-900/90 backdrop-blur-md rounded-full text-[10px] font-black tracking-widest uppercase text-white/95 border border-white/10 shadow-lg">
            Active Design
          </div>
          {hasUnappliedChanges && !isProcessing && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-4 py-2 bg-amber-500/90 backdrop-blur-md rounded-full text-[9px] font-black tracking-widest uppercase text-white shadow-lg animate-pulse">
              Press Apply to Generate
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
