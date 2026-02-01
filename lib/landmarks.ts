// Landmark indices for specific facial regions based on MediaPipe 468 points
// These define the polygons for masking

export const LANDMARK_INDICES = {
    LIPS: [
        // Outer lip
        61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291,
        409, 270, 269, 267, 0, 37, 39, 40, 185, 61,
        // Inner lip (to exclude mouth opening if needed, but for volume we usually include it)
        // For simple mask we usually just take the outer hull
    ],
    UPPER_LIP: [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191, 78, 61],
    LOWER_LIP: [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78, 61],

    JAWLINE: [
        // Left side
        172, 136, 150, 149, 176, 148, 152,
        // Right side
        377, 400, 378, 379, 365, 397, 288,
        // Chin connecting curve (simplified hull)
        // We often need to expand these points outwards to cover the skin, not just the bone line
    ],

    NOSE: [
        // Bridge and tip
        168, 6, 197, 195, 5, 4, 1, 19, 94, 2, 98, 97, 2, 326, 327, 294, 278, 279, 420, 429, 351, 417, 465,
        // Nostrils might be needed
    ],

    CHEEKS_LEFT: [
        // Approximate left cheek area
        123, 50, 205, 206, 207, 187, 147, 137, 227, 127, 162, 21, 54, 103, 67, 109, 10
    ],

    CHEEKS_RIGHT: [
        352, 280, 425, 426, 427, 411, 376, 366, 447, 356, 389, 251, 284, 332, 297, 338, 338
    ],

    NASOLABIAL_LEFT: [
        // Around the fold line
        205, 206, 207, 187, 147, 50, 36, 142, 100
    ],

    NASOLABIAL_RIGHT: [
        425, 426, 427, 411, 376, 280, 266, 371, 329
    ],

    TEAR_TROUGH_LEFT: [
        // Under eye
        226, 31, 228, 229, 230, 231, 232, 233, 244
    ],

    TEAR_TROUGH_RIGHT: [
        446, 261, 448, 449, 450, 451, 452, 453, 464
    ],
};

// Map our generic ID to the specific indices
import { SimulationRegion } from '@/types';

export const getIndicesForRegion = (region: SimulationRegion): number[] => {
    switch (region) {
        case 'LIPS': return LANDMARK_INDICES.LIPS;
        case 'JAWLINE': return LANDMARK_INDICES.JAWLINE; // Needs refinement for full polygon
        case 'NOSE': return LANDMARK_INDICES.NOSE;
        case 'CHEEKS': return [...LANDMARK_INDICES.CHEEKS_LEFT, ...LANDMARK_INDICES.CHEEKS_RIGHT];
        case 'NASOLABIAL': return [...LANDMARK_INDICES.NASOLABIAL_LEFT, ...LANDMARK_INDICES.NASOLABIAL_RIGHT];
        case 'TEAR_TROUGHS': return [...LANDMARK_INDICES.TEAR_TROUGH_LEFT, ...LANDMARK_INDICES.TEAR_TROUGH_RIGHT];
        // Add others as defined
        default: return [];
    }
};
