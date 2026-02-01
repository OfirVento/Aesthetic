import { SimulationRegion } from '@/types';

export interface ControlDefinition {
    id: string;
    label: string;
    min: number;
    max: number;
    step?: number;
}

export const REGION_CONTROLS: Record<SimulationRegion, ControlDefinition[]> = {
    LIPS: [
        { id: 'volume', label: 'Volume', min: 0, max: 100 },
        { id: 'projection', label: 'Projection', min: 0, max: 100 },
        { id: 'definition', label: 'Definition', min: 0, max: 100 },
        { id: 'width', label: 'Width', min: 0, max: 100 },
    ],
    JAWLINE: [
        { id: 'definition', label: 'Definition', min: 0, max: 100 },
        { id: 'contour', label: 'Contour', min: 0, max: 100 },
        { id: 'angle', label: 'Angle', min: 0, max: 100 },
    ],
    CHIN: [
        { id: 'projection', label: 'Projection', min: 0, max: 100 },
        { id: 'length', label: 'Length', min: 0, max: 100 },
        { id: 'width', label: 'Width', min: 0, max: 100 },
    ],
    CHEEKS: [
        { id: 'volume', label: 'Volume', min: 0, max: 100 },
        { id: 'lift', label: 'Lift', min: 0, max: 100 },
        { id: 'projection', label: 'Projection', min: 0, max: 100 },
    ],
    NASOLABIAL: [
        { id: 'smoothing', label: 'Smoothing', min: 0, max: 100 },
        { id: 'depth_reduction', label: 'Depth Reduction', min: 0, max: 100 },
    ],
    UPPER_FACE: [
        { id: 'relaxation', label: 'Relaxation (Toxin)', min: 0, max: 100 },
        { id: 'lift', label: 'Brow Lift', min: 0, max: 100 },
        { id: 'smoothing', label: 'Smoothing', min: 0, max: 100 },
    ],
    TEAR_TROUGHS: [
        { id: 'fill', label: 'Volume Fill', min: 0, max: 100 },
        { id: 'smoothing', label: 'Smoothing', min: 0, max: 100 },
    ],
    NOSE: [
        { id: 'bridge_height', label: 'Bridge Straightening', min: 0, max: 100 },
        { id: 'tip_projection', label: 'Tip Projection', min: 0, max: 100 },
        { id: 'width', label: 'Width Reduction', min: 0, max: 100 },
    ],
};
