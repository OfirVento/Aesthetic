"use client";

import { useState } from "react";
import type { AppStep } from "@/types";
import { useSessionStore } from "@/lib/store/session";
import SettingsModal from "./SettingsModal";

const STEPS: { key: AppStep; label: string }[] = [
  { key: "scan", label: "01 Scan" },
  { key: "simulation", label: "02 Simulation" },
  { key: "results", label: "03 Outcome" },
];

export default function Navigation() {
  const { step, reset } = useSessionStore();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <header className="px-6 py-4 flex justify-between items-center bg-white border-b border-stone-100 z-50 shrink-0">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={reset}
        >
          <div className="w-7 h-7 rounded-lg bg-stone-900 flex items-center justify-center text-white text-[10px] font-bold">
            A
          </div>
          <span className="font-serif text-lg tracking-tight text-stone-800">
            Aesthetic Styling
          </span>
        </div>

        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-6 text-[9px] font-black uppercase tracking-[0.2em] text-stone-300">
            {STEPS.map((s) => (
              <span
                key={s.key}
                className={step === s.key ? "text-stone-900 font-black" : ""}
              >
                {s.label}
              </span>
            ))}
          </nav>

          {/* Settings Icon */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors"
            title="Prompt Settings"
          >
            <svg
              className="w-5 h-5 text-stone-500 hover:text-stone-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </header>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
