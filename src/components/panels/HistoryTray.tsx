"use client";

import { useEffect, useRef } from "react";
import { useSessionStore } from "@/lib/store/session";

export default function HistoryTray() {
  const { capturedImage, activeImage, setActiveImage, history } =
    useSessionStore();

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to newest entry when history grows
  useEffect(() => {
    if (scrollRef.current && history.length > 0) {
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollWidth,
        behavior: "smooth",
      });
    }
  }, [history.length]);

  return (
    <div className="flex-1 px-10 flex items-center gap-10 overflow-hidden">
      <div className="flex-shrink-0 flex flex-col items-start pr-8 border-r border-stone-100">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mb-1.5">
          History
        </span>
        <div className="w-12 h-1 bg-stone-900 rounded-full" />
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar items-center py-4 h-full"
      >
        {/* Original baseline thumbnail */}
        <button
          onClick={() => setActiveImage(null)}
          title="Original baseline"
          className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all duration-500 flex-shrink-0 relative ${
            !activeImage
              ? "border-stone-900 scale-110 shadow-xl z-10"
              : "border-transparent opacity-40 hover:opacity-100"
          }`}
        >
          {capturedImage && (
            <img
              src={capturedImage}
              className="w-full h-full object-cover"
              alt="Original"
            />
          )}
          <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[7px] text-white font-bold text-center py-0.5">
            BASE
          </div>
        </button>

        {/* Version history thumbnails */}
        {history.map((entry, index) => (
          <button
            key={entry.id}
            onClick={() => setActiveImage(entry.outputImage)}
            title={`V${index + 1} — ${entry.categoryLabel}: ${entry.subRegionLabel}`}
            className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all duration-500 flex-shrink-0 relative ${
              activeImage === entry.outputImage
                ? "border-stone-900 scale-110 shadow-xl z-10"
                : "border-transparent opacity-40 hover:opacity-100"
            }`}
          >
            <img
              src={entry.outputImage}
              className="w-full h-full object-cover"
              alt={`V${index + 1} ${entry.regionLabel}`}
            />
            <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[7px] text-white font-bold text-center py-0.5 truncate px-1">
              V{index + 1}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
