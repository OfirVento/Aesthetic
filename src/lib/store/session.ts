"use client";

import { create } from "zustand";
import type {
  AppStep,
  FacialRegion,
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

  // Region selection
  selectedRegion: FacialRegion | null;
  setSelectedRegion: (region: FacialRegion | null) => void;
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
  selectedRegion: null,
  maskOverlay: null,
  controlValues: {},
  notes: "",
  history: [],
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

  setSelectedRegion: (region) =>
    set({ selectedRegion: region, controlValues: {}, notes: "", maskOverlay: null }),

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
