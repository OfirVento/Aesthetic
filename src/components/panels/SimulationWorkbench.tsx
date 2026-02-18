"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSessionStore } from "@/lib/store/session";
import { usePromptsStore } from "@/lib/store/prompts";
import { buildInpaintPrompt, buildFullPrompt } from "@/lib/prompts";
import { getSubRegionConfig, getCategoryForSubRegion } from "@/components/controls/controlsConfig";
import { detectFaceLandmarks } from "@/lib/mediapipe";
import { generateRegionMask, generateRegionOverlay, maskToDataURL } from "@/lib/masks";
import { generateEditedImage } from "@/lib/api/gemini";
import type { MeshSimulatorRef } from "@/components/simulation/MeshSimulator";
import RegionPresets from "@/components/canvas/RegionPresets";
import ContextualPanel from "@/components/controls/ContextualPanel";
import ComparisonView from "./ComparisonView";
import HistoryTray from "./HistoryTray";

export default function SimulationWorkbench() {
  const {
    capturedImage,
    selectedSubRegion,
    controlValues,
    notes,
    isProcessing,
    isDetecting,
    landmarks,
    error,
    setIsProcessing,
    setLandmarks,
    setMaskOverlay,
    setActiveImage,
    setError,
    addVersion,
    setStep,
  } = useSessionStore();

  const { prompts } = usePromptsStore();

  const imageRef = useRef<HTMLImageElement | null>(null);
  const meshSimulatorRef = useRef<MeshSimulatorRef>(null);

  // Run face detection when image is loaded
  const runFaceDetection = useCallback(async () => {
    if (!capturedImage || landmarks) return;

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = capturedImage;
      });
      imageRef.current = img;

      const detected = await detectFaceLandmarks(img);
      if (detected) {
        setLandmarks(detected);
        setError(null);
      } else {
        setLandmarks(null);
        setError("No face detected. Try a clearer front-facing photo.");
      }
    } catch (err) {
      console.error("Face detection error:", err);
      setLandmarks(null);
      setError("Face detection failed. Continuing without landmarks.");
    }
  }, [capturedImage, landmarks, setLandmarks, setError]);

  useEffect(() => {
    runFaceDetection();
  }, [runFaceDetection]);

  // Generate mask overlay when sub-region is selected
  useEffect(() => {
    if (!selectedSubRegion || !landmarks || !imageRef.current) {
      setMaskOverlay(null);
      return;
    }

    const { naturalWidth, naturalHeight } = imageRef.current;
    const overlay = generateRegionOverlay(
      landmarks,
      selectedSubRegion,
      naturalWidth,
      naturalHeight
    );
    setMaskOverlay(maskToDataURL(overlay));
  }, [selectedSubRegion, landmarks, setMaskOverlay]);

  const hasValues =
    selectedSubRegion &&
    Object.values(controlValues).some((v) => v > 0);

  const handleApply = async () => {
    if (!selectedSubRegion || !hasValues || !capturedImage) return;

    // Capture mesh preview immediately for instant feedback
    const meshPreview = meshSimulatorRef.current?.exportImage() ?? null;
    if (meshPreview) {
      setActiveImage(meshPreview);
    }

    // Build the task prompt using configurable prompts from store
    const taskPrompt = buildInpaintPrompt(selectedSubRegion, controlValues, prompts, notes);
    if (!taskPrompt) {
      setError("No changes to apply. Adjust the sliders above 0% first.");
      return;
    }

    // Build the full prompt with system wrapper
    const fullPrompt = buildFullPrompt(taskPrompt, prompts.systemPrompt);

    setIsProcessing(true);
    setError(null);

    try {
      // Always use the original captured image as the base
      const sourceImage = capturedImage;

      // Generate mask if landmarks available
      let maskData: string | undefined;
      if (landmarks && imageRef.current) {
        const { naturalWidth, naturalHeight } = imageRef.current;
        const mask = generateRegionMask(
          landmarks,
          selectedSubRegion,
          naturalWidth,
          naturalHeight
        );
        maskData = maskToDataURL(mask);
      }

      // Call Gemini API for image generation
      const outputImage = await generateEditedImage(sourceImage, fullPrompt, maskData);

      const subRegionConfig = getSubRegionConfig(selectedSubRegion);
      const categoryConfig = getCategoryForSubRegion(selectedSubRegion);

      addVersion({
        id: `v-${Date.now()}`,
        timestamp: Date.now(),
        category: categoryConfig?.id ?? "lips",
        categoryLabel: categoryConfig?.label ?? "Unknown",
        subRegion: selectedSubRegion,
        subRegionLabel: subRegionConfig?.label ?? "Unknown",
        region: selectedSubRegion,
        regionLabel: subRegionConfig?.label ?? "Unknown",
        controlValues: { ...controlValues },
        notes,
        prompt: fullPrompt,
        inputImage: sourceImage,
        outputImage,
        meshPreviewImage: meshPreview ?? undefined,
        maskData,
      });
    } catch (err) {
      console.error("Simulation error:", err);

      // If Gemini fails but we have a mesh preview, save that as the output
      if (meshPreview) {
        const subRegionConfig = getSubRegionConfig(selectedSubRegion);
        const categoryConfig = getCategoryForSubRegion(selectedSubRegion);
        addVersion({
          id: `v-${Date.now()}`,
          timestamp: Date.now(),
          category: categoryConfig?.id ?? "lips",
          categoryLabel: categoryConfig?.label ?? "Unknown",
          subRegion: selectedSubRegion,
          subRegionLabel: subRegionConfig?.label ?? "Unknown",
          region: selectedSubRegion,
          regionLabel: subRegionConfig?.label ?? "Unknown",
          controlValues: { ...controlValues },
          notes,
          prompt: "(mesh preview — AI generation failed)",
          inputImage: capturedImage,
          outputImage: meshPreview,
          meshPreviewImage: meshPreview,
        });
      }

      setError(
        err instanceof Error
          ? err.message
          : "AI generation failed. Mesh preview saved as fallback."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalize = () => {
    setStep("results");
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-stone-100 fade-in">
      {/* Status bar */}
      {(isDetecting || error) && (
        <div
          className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest text-center shrink-0 ${
            error
              ? "bg-red-50 text-red-500 border-b border-red-100"
              : "bg-blue-50 text-blue-500 border-b border-blue-100"
          }`}
        >
          {isDetecting
            ? "Detecting facial landmarks..."
            : error}
        </div>
      )}

      {/* Landmark detection success */}
      {landmarks && !isDetecting && !error && (
        <div className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-center bg-emerald-50 text-emerald-600 border-b border-emerald-100 shrink-0">
          Face detected — {landmarks.length} landmarks mapped. Select a region to begin.
        </div>
      )}

      {/* Toolbar: Region presets + tools */}
      <div className="bg-white border-b border-stone-200 px-6 py-3 flex items-center gap-4 shrink-0">
        <RegionPresets />
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-stone-300">
            {landmarks ? "Presets Active" : "Loading..."}
          </span>
        </div>
      </div>

      {/* Main content: Comparison + Contextual Panel */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        <ComparisonView meshRef={meshSimulatorRef} />

        {selectedSubRegion && (
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
            {isProcessing ? "Generating..." : "Apply Simulation"}
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
