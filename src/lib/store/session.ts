"use client";

import { create } from "zustand";
import type {
  AppStep,
  RegionCategory,
  SubRegion,
  RegionControlValues,
  VersionEntry,
} from "@/types";
import type { LandmarkPoint } from "@/lib/mediapipe";
import type { SimulationState } from "@/lib/meshSimulation/types";
import {
  mapControlsToSimulation,
  buildCumulativeSimulation,
} from "@/lib/meshSimulation/controlMapping";

interface SessionStore {
  // Navigation
  step: AppStep;
  setStep: (step: AppStep) => void;

  // Images
  capturedImage: string | null;
  setCapturedImage: (image: string) => void;
  activeImage: string | null;
  setActiveImage: (image: string | null) => void;

  // Face detection
  landmarks: LandmarkPoint[] | null;
  setLandmarks: (lm: LandmarkPoint[] | null) => void;
  isDetecting: boolean;
  setIsDetecting: (val: boolean) => void;

  // Hierarchical region selection
  selectedCategory: RegionCategory | null;
  setSelectedCategory: (category: RegionCategory | null) => void;
  selectedSubRegion: SubRegion | null;
  setSelectedSubRegion: (subRegion: SubRegion | null) => void;
  expandedCategories: RegionCategory[];
  toggleCategoryExpanded: (category: RegionCategory) => void;
  acknowledgedGatedCategories: RegionCategory[];
  acknowledgeGatedCategory: (category: RegionCategory) => void;

  // Legacy - kept for compatibility (maps to selectedSubRegion)
  selectedRegion: SubRegion | null;
  setSelectedRegion: (region: SubRegion | null) => void;
  maskOverlay: string | null;
  setMaskOverlay: (overlay: string | null) => void;

  // Controls
  controlValues: RegionControlValues;
  setControlValue: (key: string, value: number) => void;
  resetControls: () => void;

  // Notes
  notes: string;
  setNotes: (notes: string) => void;

  // History
  history: VersionEntry[];
  addVersion: (entry: VersionEntry) => void;

  // Mesh simulation (derived from controls + history)
  meshSimulationState: SimulationState;

  // Processing
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;

  // Error
  error: string | null;
  setError: (error: string | null) => void;

  // Reset
  reset: () => void;
}

const EMPTY_SIM_STATE: SimulationState = { fillerValues: {}, botoxValues: {} };

const initialState = {
  step: "scan" as AppStep,
  capturedImage: null,
  activeImage: null,
  landmarks: null,
  isDetecting: false,
  // Hierarchical selection
  selectedCategory: null as RegionCategory | null,
  selectedSubRegion: null as SubRegion | null,
  expandedCategories: [] as RegionCategory[],
  acknowledgedGatedCategories: [] as RegionCategory[],
  // Legacy
  selectedRegion: null as SubRegion | null,
  maskOverlay: null,
  controlValues: {},
  notes: "",
  history: [] as VersionEntry[],
  meshSimulationState: EMPTY_SIM_STATE,
  isProcessing: false,
  error: null,
};

/**
 * Recompute the mesh simulation state from history + current live slider values.
 * Called whenever controlValues, selectedSubRegion, or history change.
 */
function computeMeshState(
  history: VersionEntry[],
  selectedSubRegion: SubRegion | null,
  controlValues: RegionControlValues
): SimulationState {
  // Build cumulative state from all applied history entries
  let state = buildCumulativeSimulation(
    history.map((h) => ({ subRegion: h.subRegion, controlValues: h.controlValues }))
  );

  // Overlay current live slider values as a preview
  if (selectedSubRegion && Object.values(controlValues).some((v) => v > 0)) {
    state = mapControlsToSimulation(selectedSubRegion, controlValues, state);
  }

  return state;
}

export const useSessionStore = create<SessionStore>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),

  setCapturedImage: (image) =>
    set({
      capturedImage: image,
      activeImage: null,
      step: "simulation",
      landmarks: null,
      isDetecting: true,
      meshSimulationState: EMPTY_SIM_STATE,
    }),

  setActiveImage: (image) => set({ activeImage: image }),

  setLandmarks: (lm) => set({ landmarks: lm, isDetecting: false }),
  setIsDetecting: (val) => set({ isDetecting: val }),

  // Hierarchical selection
  setSelectedCategory: (category) =>
    set((state) => ({
      selectedCategory: category,
      expandedCategories: category && !state.expandedCategories.includes(category)
        ? [...state.expandedCategories, category]
        : state.expandedCategories,
    })),

  setSelectedSubRegion: (subRegion) =>
    set((state) => ({
      selectedSubRegion: subRegion,
      selectedRegion: subRegion, // Keep legacy field in sync
      controlValues: {},
      notes: "",
      maskOverlay: null,
      activeImage: null, // Clear Gemini result so mesh preview resumes
      // Recompute with no live controls (sliders reset to 0)
      meshSimulationState: computeMeshState(state.history, subRegion, {}),
    })),

  toggleCategoryExpanded: (category) =>
    set((state) => ({
      expandedCategories: state.expandedCategories.includes(category)
        ? state.expandedCategories.filter((c) => c !== category)
        : [...state.expandedCategories, category],
    })),

  acknowledgeGatedCategory: (category) =>
    set((state) => ({
      acknowledgedGatedCategories: state.acknowledgedGatedCategories.includes(category)
        ? state.acknowledgedGatedCategories
        : [...state.acknowledgedGatedCategories, category],
    })),

  // Legacy - maps to setSelectedSubRegion
  setSelectedRegion: (region) =>
    set((state) => ({
      selectedRegion: region,
      selectedSubRegion: region,
      controlValues: {},
      notes: "",
      maskOverlay: null,
      activeImage: null,
      meshSimulationState: computeMeshState(state.history, region, {}),
    })),

  setMaskOverlay: (overlay) => set({ maskOverlay: overlay }),

  setControlValue: (key, value) =>
    set((state) => {
      const newControlValues = { ...state.controlValues, [key]: value };
      return {
        controlValues: newControlValues,
        meshSimulationState: computeMeshState(
          state.history,
          state.selectedSubRegion,
          newControlValues
        ),
      };
    }),

  resetControls: () =>
    set((state) => ({
      controlValues: {},
      notes: "",
      meshSimulationState: computeMeshState(state.history, state.selectedSubRegion, {}),
    })),

  setNotes: (notes) => set({ notes }),

  addVersion: (entry) =>
    set((state) => {
      const newHistory = [...state.history, entry];
      return {
        history: newHistory,
        activeImage: entry.outputImage,
        // Recompute cumulative mesh state with the new history entry
        meshSimulationState: computeMeshState(newHistory, state.selectedSubRegion, state.controlValues),
      };
    }),

  setIsProcessing: (val) => set({ isProcessing: val }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));
