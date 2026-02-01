export type SimulationRegion =
    | 'LIPS'
    | 'JAWLINE'
    | 'CHIN'
    | 'CHEEKS'
    | 'NASOLABIAL'
    | 'UPPER_FACE'
    | 'TEAR_TROUGHS'
    | 'NOSE';

export interface RegionControls {
    // Common generic values 0-100
    volume?: number;
    projection?: number;
    definition?: number;
    width?: number;
    lift?: number;
    smoothing?: number;
    tightening?: number;
    [key: string]: number | undefined;
}

export interface SimulationState {
    LIPS: RegionControls;
    JAWLINE: RegionControls;
    CHIN: RegionControls;
    CHEEKS: RegionControls;
    NASOLABIAL: RegionControls;
    UPPER_FACE: RegionControls;
    TEAR_TROUGHS: RegionControls;
    NOSE: RegionControls;
}

export interface HistoryItem {
    id: string;
    timestamp: number;
    originalImage: string;
    resultImage: string;
    region: SimulationRegion;
    controls: RegionControls;
    maskData?: string; // TBD format
}

export interface AppState {
    currentStep: 'SCAN' | 'SIMULATION' | 'RESULTS';
    originalImage: string | null;
    currentDesignImage: string | null;
    activeRegion: SimulationRegion | null;
    simulationState: SimulationState;
    history: HistoryItem[];

    // Actions
    setStep: (step: 'SCAN' | 'SIMULATION' | 'RESULTS') => void;
    setOriginalImage: (url: string) => void;
    setActiveRegion: (region: SimulationRegion | null) => void;
    updateRegionControl: (region: SimulationRegion, control: string, value: number) => void;
    addToHistory: (item: HistoryItem) => void;
}
