import { SimulationState, SimulationRegion } from '@/types';

// Helper to generate the prompt based on slider values, using artistic/retouching terminology
export const buildClinicalPrompt = (
    region: SimulationRegion,
    state: SimulationState
): string | null => {
    const controls = state[region];
    if (!controls) return null;

    const activeEntries = Object.entries(controls).filter(([_, val]) => val && val > 0);
    if (activeEntries.length === 0) return null;

    // 1. Build specific descriptions per control
    const descriptions: string[] = [];

    // LIPS Logic
    if (region === 'LIPS') {
        if (controls.volume && controls.volume > 0) {
            if (controls.volume < 15) descriptions.push(`very subtle lip hydration (${controls.volume}%)`);
            else if (controls.volume < 30) descriptions.push(`soft hydration look (${controls.volume}%)`);
            else if (controls.volume < 60) descriptions.push(`natural fullness enhancement (${controls.volume}%)`);
            else descriptions.push(`glamorous volume boost (${controls.volume}%)`);
        }
        if (controls.projection && controls.projection > 0) {
            descriptions.push(`${controls.projection < 20 ? 'slight' : 'enhanced'} lip profile projection (${controls.projection}%)`);
        }
        if (controls.definition && controls.definition > 0) {
            descriptions.push(`defined lip contour (${controls.definition}%)`);
        }
    }

    // JAWLINE Logic
    if (region === 'JAWLINE') {
        if (controls.definition && controls.definition > 0) {
            descriptions.push(`sculpted jawline definition (${controls.definition}%)`);
        }
        if (controls.contour && controls.contour > 0) {
            descriptions.push(`refined jaw angle contour (${controls.contour}%)`);
        }
    }

    // CHEEKS Logic
    if (region === 'CHEEKS') {
        if (controls.volume && controls.volume > 0) {
            descriptions.push(`restored cheek volume (${controls.volume}%)`);
        }
        if (controls.lift && controls.lift > 0) {
            descriptions.push(`visual cheekbone lift (${controls.lift}%)`);
        }
    }

    // NOSE Logic
    if (region === 'NOSE') {
        if (controls.bridge_height && controls.bridge_height > 0) {
            descriptions.push(`straightened nose bridge (${controls.bridge_height}%)`);
        }
        if (controls.tip_projection && controls.tip_projection > 0) {
            descriptions.push(`refined nose tip projection (${controls.tip_projection}%)`);
        }
    }

    // Fallback for generic/unmapped controls
    activeEntries.forEach(([key, val]) => {
        if (region !== 'LIPS' && region !== 'JAWLINE' && region !== 'CHEEKS' && region !== 'NOSE') {
            descriptions.push(`${key.replace('_', ' ')} enhancement (${val}%)`);
        }
    });

    const changeDescription = descriptions.join(', ');

    // 2. Construct the full system prompt - USING ARTISTIC/RETOUCHING PERSONA
    return `
    SYSTEM INSTRUCTION: You are an expert high-end portrait retoucher and digital artist.
    TASK: Retouch the ${region} area of the image to apply the following aesthetic enhancements.
    
    EDITING REQUEST:
    - Target Area: ${region}
    - Enhancements: ${changeDescription}
    
    GUIDELINES:
    - Style: Photorealistic, high-end beauty photography.
    - Blend: Seamless texture blending. No artificial smoothing.
    - Magnitude: Respect the requested intensity (e.g. 5% should be minimal/subtle, 80% should be dramatic).
    - Identity: Preserve original skin texture and facial identity. ONLY retouch the requested area.
    - Output: A single high-quality image file.
  `;
};
