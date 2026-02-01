"use client";

import { useSessionStore } from "@/lib/store/session";
import { buildInpaintPrompt } from "@/lib/prompts";
import { REGION_CONFIGS } from "@/components/controls/controlsConfig";
import RegionPresets from "@/components/canvas/RegionPresets";
import ContextualPanel from "@/components/controls/ContextualPanel";
import ComparisonView from "./ComparisonView";
import HistoryTray from "./HistoryTray";

export default function SimulationWorkbench() {
  const {
    capturedImage,
    activeImage,
    selectedRegion,
    controlValues,
    notes,
    isProcessing,
    setIsProcessing,
    addVersion,
    setStep,
  } = useSessionStore();

  const hasValues =
    selectedRegion &&
    Object.values(controlValues).some((v) => v > 0);

  const handleApply = async () => {
    if (!selectedRegion || !hasValues || !capturedImage) return;

    const prompt = buildInpaintPrompt(selectedRegion, controlValues, notes);
    if (!prompt) return;

    setIsProcessing(true);

    try {
      // TODO: Replace with Nano Banana Pro (Gemini AI) inpainting API call
      // For now, simulate a delay and use the original image as placeholder
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const config = REGION_CONFIGS[selectedRegion];
      addVersion({
        id: `v-${Date.now()}`,
        timestamp: Date.now(),
        region: selectedRegion,
        regionLabel: config.label,
        controlValues: { ...controlValues },
        notes,
        prompt,
        inputImage: activeImage || capturedImage,
        outputImage: activeImage || capturedImage, // placeholder until API connected
      });
    } catch (error) {
      console.error("Simulation error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalize = () => {
    setStep("results");
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-stone-100 fade-in">
      {/* Toolbar: Region presets + tools */}
      <div className="bg-white border-b border-stone-200 px-6 py-3 flex items-center gap-4 shrink-0">
        <RegionPresets />
        <div className="ml-auto flex items-center gap-2">
          {/* Brush / Lasso tools will go here in Phase 1.4 */}
          <span className="text-[9px] font-black uppercase tracking-widest text-stone-300">
            Tools
          </span>
        </div>
      </div>

      {/* Main content: Comparison + Contextual Panel */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Side-by-side comparison */}
        <ComparisonView />

        {/* Contextual controls floating panel */}
        {selectedRegion && (
          <div className="w-80 p-4 overflow-y-auto no-scrollbar shrink-0">
            <ContextualPanel />
          </div>
        )}
      </div>

      {/* Bottom bar: Actions + History */}
      <div className="h-32 bg-white border-t border-stone-200 flex z-30 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="w-72 border-r border-stone-100 px-6 flex flex-col justify-center gap-2 bg-stone-50/30">
          <button
            onClick={handleApply}
            disabled={isProcessing || !hasValues}
            className={`w-full py-4 rounded-full font-black text-[10px] uppercase tracking-[0.25em] shadow-lg transition-all active:scale-[0.98] ${
              isProcessing || !hasValues
                ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                : "bg-stone-900 text-white hover:bg-black hover:shadow-stone-900/20"
            }`}
          >
            {isProcessing ? "Processing..." : "Apply Simulation"}
          </button>
          <button
            onClick={handleFinalize}
            className="w-full text-stone-400 py-1 font-black text-[9px] uppercase tracking-widest hover:text-stone-900 transition-colors"
          >
            Finalize Styling
          </button>
        </div>

        <HistoryTray />
      </div>
    </div>
  );
}
