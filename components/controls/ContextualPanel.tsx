import React, { useState } from 'react';
import { useStore } from '@/store/session';
import { REGION_CONTROLS } from './controlsConfig';
import { X, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildClinicalPrompt } from '@/lib/prompts';

export const ContextualPanel = () => {
    const { activeRegion, simulationState, updateRegionControl, setActiveRegion, currentDesignImage, addToHistory } = useStore();
    const [isGenerating, setIsGenerating] = useState(false);

    if (!activeRegion) return null;

    const controls = REGION_CONTROLS[activeRegion];
    if (!controls) return null;

    const handleApply = async () => {
        if (!currentDesignImage) return;

        const prompt = buildClinicalPrompt(activeRegion, simulationState);
        if (!prompt) {
            // No changes to apply
            return;
        }

        setIsGenerating(true);
        try {
            const res = await fetch('/api/inpaint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: currentDesignImage,
                    prompt: prompt
                })
            });

            const data = await res.json();
            if (data.success && data.image) {
                addToHistory({
                    id: Date.now().toString(),
                    timestamp: Date.now(),
                    originalImage: currentDesignImage,
                    resultImage: data.image,
                    region: activeRegion,
                    controls: { ...simulationState[activeRegion] }
                });
                // Optionally close panel or keep open? Let's keep open for refinement
            } else {
                console.error("Generation failed", data.error);
                alert("Simulation failed: " + data.error);
            }

        } catch (e) {
            console.error(e);
            alert("Network error");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="absolute top-10 right-10 w-72 bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-5 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-lg text-stone-900 capitalize italic">
                    {activeRegion.toLowerCase().replace('_', ' ')}
                </h3>
                <button
                    onClick={() => setActiveRegion(null)}
                    className="text-stone-400 hover:text-stone-900"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Sliders */}
            <div className="space-y-6">
                {controls.map((control) => {
                    const regionState = simulationState[activeRegion];
                    const value = regionState ? (regionState[control.id] || 0) : 0;

                    return (
                        <div key={control.id} className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-stone-500">
                                    {control.label}
                                </label>
                                <span className={cn(
                                    "text-[10px] font-mono",
                                    value > 0 ? "text-stone-900 font-bold" : "text-stone-300"
                                )}>
                                    {value}%
                                </span>
                            </div>

                            <div className="relative h-4 flex items-center group">
                                <input
                                    type="range"
                                    min={control.min}
                                    max={control.max}
                                    step={control.step || 5}
                                    value={value}
                                    onChange={(e) => updateRegionControl(activeRegion, control.id, parseInt(e.target.value))}
                                    className="w-full h-1 bg-stone-200 rounded-full appearance-none cursor-pointer accent-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10 z-20 opacity-0 absolute inset-0"
                                />
                                {/* Custom Track */}
                                <div className="w-full h-1 bg-stone-200 rounded-full overflow-hidden absolute top-1/2 -translate-y-1/2 z-10">
                                    <div
                                        className="h-full bg-stone-900 transition-all duration-75"
                                        style={{ width: `${value}%` }}
                                    />
                                </div>
                                {/* Thumb Knob (visual only) */}
                                <div
                                    className="h-3 w-3 bg-white border-2 border-stone-900 rounded-full shadow-sm absolute top-1/2 -translate-y-1/2 z-10 pointer-events-none transition-all duration-75"
                                    style={{ left: `calc(${value}% - 6px)` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer Actions */}
            <div className="mt-8 pt-4 border-t border-stone-100 flex gap-2">
                <button
                    className="flex-1 bg-stone-900 text-white py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait"
                    onClick={handleApply}
                    disabled={isGenerating}
                >
                    {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                    {isGenerating ? 'Simulating...' : 'Apply'}
                </button>
            </div>

        </div>
    );
};
