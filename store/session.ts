import { create } from 'zustand';
import { SimulationState, SimulationRegion } from '@/types';

interface SessionStore {
    // Phase 1: Basic View + Scan Step
    step: 'SCAN' | 'SIMULATION' | 'RESULTS';
    setStep: (step: 'SCAN' | 'SIMULATION' | 'RESULTS') => void;

    originalImage: string | null; // Base64 or URL
    setOriginalImage: (url: string | null) => void;

    currentDesignImage: string | null; // The one currently being viewed/edited
    setCurrentDesignImage: (url: string | null) => void;

    activeRegion: SimulationRegion | null;
    setActiveRegion: (region: SimulationRegion | null) => void;

    isGenerating: boolean;
    setIsGenerating: (loading: boolean) => void;

    simulationState: SimulationState;
    updateRegionControl: (region: SimulationRegion, controlId: string, value: number) => void;

    history: Array<{
        id: string;
        timestamp: number;
        originalImage: string; // The base for this generation
        resultImage: string;   // The output
        region: SimulationRegion;
        controls: Record<string, number>;
    }>;
    addToHistory: (entry: any) => void;
}

import { persist, createJSONStorage } from 'zustand/middleware';

export const useStore = create<SessionStore>()(
    persist(
        (set) => ({
            step: 'SCAN',
            setStep: (step) => set({ step }),

            originalImage: null,
            setOriginalImage: (url) => set({ originalImage: url, currentDesignImage: null, history: [], step: 'SIMULATION' }),

            currentDesignImage: null,
            setCurrentDesignImage: (url) => set({ currentDesignImage: url }),

            activeRegion: null,
            setActiveRegion: (region) => set({ activeRegion: region }),

            isGenerating: false,
            setIsGenerating: (loading) => set({ isGenerating: loading }),

            simulationState: {
                LIPS: {},
                JAWLINE: {},
                CHIN: {},
                CHEEKS: {},
                NASOLABIAL: {},
                UPPER_FACE: {},
                TEAR_TROUGHS: {},
                NOSE: {}
            },
            updateRegionControl: (region, controlId, value) =>
                set((state) => ({
                    simulationState: {
                        ...state.simulationState,
                        [region]: {
                            ...state.simulationState[region],
                            [controlId]: value
                        }
                    }
                })),

            history: [],
            addToHistory: (entry) => set((state) => ({
                history: [entry, ...state.history],
                currentDesignImage: entry.resultImage
            }))
        }),
        {
            name: 'cl-aesthetic-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                history: state.history,
                originalImage: state.originalImage,
                simulationState: state.simulationState
            })
        }
    )
);
