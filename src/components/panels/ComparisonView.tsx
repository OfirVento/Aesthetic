"use client";

import { useMemo, useState, type Ref } from "react";
import { useSessionStore } from "@/lib/store/session";
import { MeshSimulator } from "@/components/simulation/MeshSimulator";
import type { MeshSimulatorRef } from "@/components/simulation/MeshSimulator";

interface ComparisonViewProps {
  meshRef?: Ref<MeshSimulatorRef>;
}

export default function ComparisonView({ meshRef }: ComparisonViewProps) {
  const {
    capturedImage,
    activeImage,
    isProcessing,
    maskOverlay,
    selectedRegion,
    controlValues,
    selectedSubRegion,
    landmarks,
    meshSimulationState,
  } = useSessionStore();

  const [meshReady, setMeshReady] = useState(false);
  const [meshError, setMeshError] = useState(false);

  // Show a visual hint on the Design panel when sliders have values but haven't been applied yet
  const hasUnappliedChanges = useMemo(() => {
    return selectedSubRegion && Object.values(controlValues).some((v) => v > 0);
  }, [selectedSubRegion, controlValues]);

  // Show live mesh preview when user is adjusting sliders (no Gemini result yet)
  const showMeshPreview = !activeImage && capturedImage && landmarks && !meshError;

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
          {/* Processing spinner overlay */}
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

          {/* Gemini result layer — visible when activeImage exists */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 z-[1] ${
              activeImage && !hasUnappliedChanges ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {activeImage && (
              <img
                src={activeImage}
                className="w-full h-full object-contain"
                alt="AI Generated"
              />
            )}
          </div>

          {/* Live mesh preview layer */}
          {showMeshPreview ? (
            <div className="w-full h-full flex items-center justify-center">
              <MeshSimulator
                ref={meshRef}
                imageDataUrl={capturedImage}
                simulationState={meshSimulationState}
                landmarks={landmarks}
                fitContainer
                className="w-full h-full"
                onReady={() => setMeshReady(true)}
                onError={() => setMeshError(true)}
              />
            </div>
          ) : (
            <img
              src={activeImage || capturedImage || ""}
              className={`w-full h-full object-contain group-hover:scale-[1.02] transition-all duration-1000 ${
                isProcessing ? "opacity-30 blur-sm" : "opacity-100"
              }`}
              alt="Simulation"
            />
          )}

          {/* Badge */}
          <div className="absolute top-5 right-5 z-[2] px-4 py-2 bg-stone-900/90 backdrop-blur-md rounded-full text-[10px] font-black tracking-widest uppercase text-white/95 border border-white/10 shadow-lg">
            {activeImage && !hasUnappliedChanges ? "AI Generated" : meshReady ? "Live Preview" : "Active Design"}
          </div>

          {/* Unapplied changes hint */}
          {hasUnappliedChanges && !isProcessing && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[2] px-4 py-2 bg-amber-500/90 backdrop-blur-md rounded-full text-[9px] font-black tracking-widest uppercase text-white shadow-lg animate-pulse">
              Press Apply for AI Quality
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
