"use client";

import { useState } from "react";
import { useSessionStore } from "@/lib/store/session";
import VisualMapping from "./VisualMapping";
import ClinicalRecipe from "./ClinicalRecipe";

export default function ResultsView() {
  const { reset } = useSessionStore();
  const [activeTab, setActiveTab] = useState<"visual" | "recipe">("visual");

  return (
    <div className="h-full flex flex-col bg-stone-50 overflow-hidden fade-in">
      {/* Header with tabs */}
      <div className="bg-white border-b border-stone-200 px-8 pt-8 shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 block mb-1">
                Step 03 — Final Outcome
              </span>
              <h1 className="font-serif text-3xl text-stone-800 italic">
                Clinical Treatment Plan
              </h1>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-[9px] font-black uppercase tracking-widest text-stone-300">
                Protocol ID
              </p>
              <p className="text-xs font-mono text-stone-500">
                #AES-{Math.floor(Math.random() * 9000) + 1000}
              </p>
            </div>
          </div>
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("visual")}
              className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${
                activeTab === "visual"
                  ? "border-stone-900 text-stone-900"
                  : "border-transparent text-stone-300 hover:text-stone-400"
              }`}
            >
              Visual Mapping
            </button>
            <button
              onClick={() => setActiveTab("recipe")}
              className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${
                activeTab === "recipe"
                  ? "border-stone-900 text-stone-900"
                  : "border-transparent text-stone-300 hover:text-stone-400"
              }`}
            >
              Clinical Recipe
            </button>
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-8">
        <div className="max-w-4xl mx-auto h-full">
          {activeTab === "visual" ? <VisualMapping /> : <ClinicalRecipe />}

          <div className="flex justify-center gap-4 mt-12 pb-12">
            <button
              onClick={() => window.print()}
              className="px-8 py-4 bg-white border border-stone-200 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-stone-900 hover:bg-stone-50 transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-print" /> Print Protocol
            </button>
            <button
              onClick={reset}
              className="px-10 py-4 bg-stone-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all"
            >
              New Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
