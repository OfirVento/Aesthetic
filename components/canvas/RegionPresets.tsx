import React from 'react';
import { useStore } from '@/store/session';
import { SimulationRegion } from '@/types';
import { cn } from '@/lib/utils';
import { MousePointer2, ScanFace, Paintbrush } from 'lucide-react';

const REGION_PRESETS: { id: SimulationRegion; label: string }[] = [
    { id: 'LIPS', label: 'Lips' },
    { id: 'JAWLINE', label: 'Jawline' },
    { id: 'CHIN', label: 'Chin' },
    { id: 'CHEEKS', label: 'Cheeks' },
    { id: 'NASOLABIAL', label: 'Nasolabial' },
    { id: 'UPPER_FACE', label: 'Upper Face' },
    { id: 'TEAR_TROUGHS', label: 'Tear Troughs' },
    { id: 'NOSE', label: 'Nose' },
];

export const RegionPresets = () => {
    const { activeRegion, setActiveRegion } = useStore();

    return (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 w-full justify-center">

            {/* Tools Group */}
            <div className="flex items-center gap-1 mr-4 pr-4 border-r border-stone-200">
                <button className="p-2 text-stone-400 hover:text-stone-900 transition-colors">
                    <MousePointer2 size={16} />
                </button>
                <button className="p-2 text-stone-400 hover:text-stone-900 transition-colors">
                    <Paintbrush size={16} />
                </button>
            </div>

            {/* Presets Group */}
            <div className="flex items-center gap-2">
                {REGION_PRESETS.map((preset) => (
                    <button
                        key={preset.id}
                        onClick={() => setActiveRegion(activeRegion === preset.id ? null : preset.id)}
                        className={cn(
                            "px-4 py-1.5 text-[10px] font-black tracking-[0.15em] uppercase rounded-full border transition-all whitespace-nowrap",
                            activeRegion === preset.id
                                ? "bg-stone-900 text-white border-stone-900 shadow-md transform scale-105"
                                : "bg-white text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-700"
                        )}
                    >
                        {preset.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
