"use client";

import { create } from "zustand";
import type {
  AppStep,
  FacialRegion,
  RegionControlValues,
  VersionEntry,
} from "@/types";

interface SessionStore {
  // Navigation
  step: AppStep;
  setStep: (step: AppStep) => void;

  // Images
  capturedImage: string | null;
  setCapturedImage: (image: string) => void;
  activeImage: string | null;
  setActiveImage: (image: string | null) => void;

  // Region selection
  selectedRegion: FacialRegion | null;
  setSelectedRegion: (region: FacialRegion | null) => void;

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

  // Landmarks
  landmarks: number[][] | null;
  setLandmarks: (lm: number[][] | null) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  step: "scan" as AppStep,
  capturedImage: null,
  activeImage: null,
  selectedRegion: null,
  controlValues: {},
  notes: "",
  history: [],
  isProcessing: false,
  landmarks: null,
};

export const useSessionStore = create<SessionStore>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),

  setCapturedImage: (image) =>
    set({ capturedImage: image, activeImage: null, step: "simulation" }),

  setActiveImage: (image) => set({ activeImage: image }),

  setSelectedRegion: (region) =>
    set({ selectedRegion: region, controlValues: {}, notes: "" }),

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

  setLandmarks: (lm) => set({ landmarks: lm }),

  reset: () => set(initialState),
}));
