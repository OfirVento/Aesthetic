'use client';

import { Navigation } from '@/components/shared/Navigation';
import { FaceCanvas } from '@/components/canvas/FaceCanvas';
import { RegionPresets } from '@/components/canvas/RegionPresets';
import { ContextualPanel } from '@/components/controls/ContextualPanel';
import { HistoryTray } from '@/components/panels/HistoryTray';
import { UploadZone } from '@/components/canvas/UploadZone';
import { useStore } from '@/store/session';

export default function Page() {
    const { step } = useStore();

    return (
        <div className="h-screen w-screen flex flex-col bg-stone-50 overflow-hidden">
            <Navigation />

            <main className="flex-1 flex overflow-hidden relative">

                {/* Main Workspace */}
                <div className="flex-1 flex flex-col relative">

                    {/* Top Toolbar - Presets (Only in Simulation) */}
                    <div className={`h-16 border-b border-stone-200 bg-white flex items-center justify-center px-4 z-40 transition-all duration-300 ${step === 'SIMULATION' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                        {step === 'SIMULATION' && <RegionPresets />}
                    </div>

                    {/* Canvas Area */}
                    <div className="flex-1 bg-stone-100 flex items-center justify-center p-8 relative overflow-hidden">

                        {step === 'SCAN' ? (
                            <UploadZone />
                        ) : (
                            <>
                                <div className="w-full h-full max-w-5xl bg-white shadow-2xl rounded-sm overflow-hidden relative animate-in zoom-in-95 duration-500">
                                    <FaceCanvas />
                                </div>
                                <ContextualPanel />
                            </>
                        )}

                    </div>

                    {/* Bottom History Tray (Only in Simulation) */}
                    <div className={`h-40 border-t border-stone-200 bg-stone-50 z-40 transition-all duration-300 ${step === 'SIMULATION' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 pointer-events-none'}`}>
                        <HistoryTray />
                    </div>

                </div>

            </main>
        </div>
    );
}
