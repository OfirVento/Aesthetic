"use client";

import type { AppStep } from "@/types";
import { useSessionStore } from "@/lib/store/session";

const STEPS: { key: AppStep; label: string }[] = [
  { key: "scan", label: "01 Scan" },
  { key: "simulation", label: "02 Simulation" },
  { key: "results", label: "03 Outcome" },
];

export default function Navigation() {
  const { step, reset } = useSessionStore();

  return (
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
    </header>
  );
}
