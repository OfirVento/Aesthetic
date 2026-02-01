'use client';

import { Navigation } from '@/components/shared/Navigation';
import { FaceCanvas } from '@/components/canvas/FaceCanvas';
import { RegionPresets } from '@/components/canvas/RegionPresets';
import { ContextualPanel } from '@/components/controls/ContextualPanel';
import { HistoryTray } from '@/components/panels/HistoryTray';

export default function Page() {
    return (
        <div className="h-screen w-screen flex flex-col bg-stone-50 overflow-hidden">
            <Navigation />

            <main className="flex-1 flex overflow-hidden relative">

                {/* Main Workspace */}
                <div className="flex-1 flex flex-col relative">

                    {/* Top Toolbar - Presets */}
                    <div className="h-16 border-b border-stone-200 bg-white flex items-center justify-center px-4 z-40">
                        {/* <RegionPresets /> */}
                        <div className="text-stone-400 text-xs tracking-widest uppercase">Region Presets Placeholder</div>
                    </div>

                    {/* Canvas Area */}
                    <div className="flex-1 bg-stone-100 flex items-center justify-center p-8 relative overflow-hidden">
                        <div className="w-full h-full max-w-5xl bg-white shadow-2xl rounded-sm overflow-hidden relative">
                            {/* <FaceCanvas /> */}
                            <div className="w-full h-full flex items-center justify-center text-stone-300 font-serif italic">
                                Canvas Area
                            </div>
                        </div>

                        {/* Floating Contextual Panel - Absolute positioned over canvas */}
                        {/* <ContextualPanel /> */}
                    </div>

                    {/* Bottom History Tray */}
                    <div className="h-40 border-t border-stone-200 bg-stone-50 z-40">
                        <HistoryTray />
                    </div>

                </div>

            </main>
        </div>
    );
}
