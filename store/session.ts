import { create } from 'zustand';
import { AppState, SimulationRegion, SimulationState } from '@/types';

const INITIAL_REGION_STATE: SimulationState = {
    LIPS: { volume: 0, projection: 0, definition: 0, width: 0 },
    JAWLINE: { definition: 0, contour: 0, angle: 0 },
    CHIN: { projection: 0, length: 0, width: 0 },
    CHEEKS: { volume: 0, lift: 0, projection: 0 },
    NASOLABIAL: { smoothing: 0, depth_reduction: 0 },
    UPPER_FACE: { relaxation: 0, lift: 0, smoothing: 0 },
    TEAR_TROUGHS: { fill: 0, smoothing: 0 },
    NOSE: { bridge_height: 0, tip_projection: 0, width: 0 },
};

export const useStore = create<AppState>((set) => ({
    currentStep: 'SIMULATION', // Defaulting to SIMULATION for dev speed as requested
    originalImage: null,
    currentDesignImage: null,
    activeRegion: null,
    simulationState: INITIAL_REGION_STATE,
    history: [],

    setStep: (step) => set({ currentStep: step }),
    setOriginalImage: (url) => set({ originalImage: url, currentDesignImage: url }),
    setActiveRegion: (region) => set({ activeRegion: region }),

    updateRegionControl: (region, control, value) =>
        set((state) => ({
            simulationState: {
                ...state.simulationState,
                [region]: {
                    ...state.simulationState[region],
                    [control]: value,
                },
            },
        })),

    addToHistory: (item) =>
        set((state) => ({
            history: [...state.history, item],
            currentDesignImage: item.resultImage
        })),
}));
