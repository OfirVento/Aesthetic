import React from 'react';
import { useStore } from '@/store/session';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

export const HistoryTray = () => {
    const { history, currentDesignImage, originalImage, setOriginalImage } = useStore();

    const handleSelect = (url: string) => {
        // In a real app we might want a proper 'setActiveVersion' action
        // For now we just piggyback on setOriginalImage to update the view, 
        // but conceptually we should probably split 'original' vs 'viewing'
        useStore.setState({ currentDesignImage: url });
    };

    const isCurrent = (url: string) => currentDesignImage === url;

    return (
        <div className="h-full flex items-center px-8 gap-8 overflow-hidden">

            {/* Label */}
            <div className="flex-shrink-0 flex flex-col items-start pr-8 border-r border-stone-200 h-16 justify-center">
                <div className="flex items-center gap-2 text-stone-400 mb-1">
                    <Clock size={12} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">History</span>
                </div>
                <div className="w-8 h-0.5 bg-stone-900 rounded-full"></div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 flex gap-4 overflow-x-auto no-scrollbar items-center h-full py-4 px-2">

                {/* Original */}
                {originalImage && (
                    <button
                        onClick={() => handleSelect(originalImage)}
                        className={cn(
                            "w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 relative transition-all duration-300 group",
                            isCurrent(originalImage)
                                ? "border-stone-900 shadow-xl scale-105"
                                : "border-transparent opacity-60 hover:opacity-100"
                        )}
                    >
                        <img src={originalImage} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                        <span className="absolute bottom-1 left-0 right-0 text-[8px] text-white font-bold text-center uppercase tracking-wider drop-shadow-md">Original</span>
                    </button>
                )}

                {/* Versions */}
                {history.map((item, idx) => (
                    <button
                        key={item.id}
                        onClick={() => handleSelect(item.resultImage)}
                        className={cn(
                            "w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 relative transition-all duration-300 group",
                            isCurrent(item.resultImage)
                                ? "border-stone-900 shadow-xl scale-105"
                                : "border-transparent opacity-60 hover:opacity-100"
                        )}
                    >
                        <img src={item.resultImage} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />

                        {/* Badge for Region */}
                        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-stone-900 border border-white" />

                        <span className="absolute bottom-1 left-0 right-0 text-[8px] text-white font-bold text-center uppercase tracking-wider drop-shadow-md">
                            {item.region} #{idx + 1}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};
