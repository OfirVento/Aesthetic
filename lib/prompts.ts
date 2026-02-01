import { SimulationState, SimulationRegion } from '@/types';

// Helper to generate the clinical prompt based on slider values
export const buildClinicalPrompt = (
    region: SimulationRegion,
    state: SimulationState
): string | null => {
    const controls = state[region];
    if (!controls) return null;

    // We only care about non-zero values for the active region
    // If all are 0, we might return null to skip generation (or a "no-op" prompt)
    const activeEntries = Object.entries(controls).filter(([_, val]) => val && val > 0);
    if (activeEntries.length === 0) return null;

    // 1. Build specific descriptions per control
    const descriptions: string[] = [];

    // LIPS Logic
    if (region === 'LIPS') {
        if (controls.volume && controls.volume > 0) {
            if (controls.volume < 30) descriptions.push(`subtle hydration effect (${controls.volume}%)`);
            else if (controls.volume < 60) descriptions.push(`moderate natural volume enhancement (${controls.volume}%)`);
            else descriptions.push(`bold augmentation with signficant fullness (${controls.volume}%)`);
        }
        if (controls.projection && controls.projection > 0) {
            descriptions.push(`forward projection of the vermillion border (${controls.projection}%)`);
        }
        if (controls.definition && controls.definition > 0) {
            descriptions.push(`crisp definition of the cupids bow and borders (${controls.definition}%)`);
        }
    }

    // JAWLINE Logic
    if (region === 'JAWLINE') {
        if (controls.definition && controls.definition > 0) {
            descriptions.push(`sharpening of the mandibular border (${controls.definition}%)`);
        }
        if (controls.contour && controls.contour > 0) {
            descriptions.push(`contouring of the jaw angle (${controls.contour}%)`);
        }
    }

    // CHEEKS Logic
    if (region === 'CHEEKS') {
        if (controls.volume && controls.volume > 0) {
            descriptions.push(`restoration of midface volume (${controls.volume}%)`);
        }
        if (controls.lift && controls.lift > 0) {
            descriptions.push(`visible lifting effect of the cheekbones (${controls.lift}%)`);
        }
    }

    // NOSE Logic
    if (region === 'NOSE') {
        if (controls.bridge_height && controls.bridge_height > 0) {
            descriptions.push(`straightening of the dorsal bridge (${controls.bridge_height}%)`);
        }
        if (controls.tip_projection && controls.tip_projection > 0) {
            descriptions.push(`refinement and projection of the nasal tip (${controls.tip_projection}%)`);
        }
    }

    // Fallback for generic/unmapped controls
    activeEntries.forEach(([key, val]) => {
        // If we haven't manually handled it above (simple check if description contains key for now, or just append everything remaining)
        // For safety, let's just make sure we capture anything we missed
        if (region !== 'LIPS' && region !== 'JAWLINE' && region !== 'CHEEKS' && region !== 'NOSE') {
            descriptions.push(`${key.replace('_', ' ')} enhancement (${val}%)`);
        }
    });

    const changeDescription = descriptions.join(', ');

    // 2. Construct the full system prompt
    return `
    SYSTEM INSTRUCTION: You are an expert medical aesthetic visualization engine.
    OBJECTIVE: Apply high-fidelity modifications to the ${region} region of the provided face.
    
    CLINICAL PARAMETERS:
    - Region: ${region}
    - Changes: ${changeDescription}
    
    CRITICAL CONSTRAINTS:
    - Maintain 100% identity of the person (eyes, hair, skin tone, background).
    - ONLY modify the ${region}. Do not touch other areas.
    - Photorealistic, clinical texturing. No beautification filters. 
    - Ensure lighting consistency.
  `;
};
