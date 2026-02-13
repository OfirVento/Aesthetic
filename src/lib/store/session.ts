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

  // Processing
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;

  // Error
  error: string | null;
  setError: (error: string | null) => void;

  // Reset
  reset: () => void;
}

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
  isProcessing: false,
  error: null,
};

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
    set({
      selectedSubRegion: subRegion,
      selectedRegion: subRegion, // Keep legacy field in sync
      controlValues: {},
      notes: "",
      maskOverlay: null,
    }),

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
    set({
      selectedRegion: region,
      selectedSubRegion: region,
      controlValues: {},
      notes: "",
      maskOverlay: null,
    }),

  setMaskOverlay: (overlay) => set({ maskOverlay: overlay }),

  setControlValue: (key, value) =>
    set((state) => ({
      controlValues: { ...state.controlValues, [key]: value },
    })),

  resetControls: () => set({ controlValues: {}, notes: "" }),

  setNotes: (notes) => set({ notes }),

  addVersion: (entry) =>
    set((state) => ({
      history: [...state.history, entry],
      activeImage: entry.outputImage,
    })),

  setIsProcessing: (val) => set({ isProcessing: val }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));
