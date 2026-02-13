"use client";

import { useState } from "react";
import { useSessionStore } from "@/lib/store/session";
import Navigation from "@/components/shared/Navigation";
import WelcomeView from "@/components/shared/WelcomeView";
import CaptureView from "@/components/shared/CaptureView";
import SimulationWorkbench from "@/components/panels/SimulationWorkbench";
import ResultsView from "@/components/results/ResultsView";

export default function Home() {
  const { step } = useSessionStore();
  const [showCapture, setShowCapture] = useState(false);

  return (
    <div className="h-screen bg-stone-50 text-slate-900 flex flex-col overflow-hidden">
      <Navigation />
      <main className="flex-1 overflow-hidden relative">
        {step === "scan" &&
          (showCapture ? (
            <CaptureView />
          ) : (
            <WelcomeView onStartCapture={() => setShowCapture(true)} />
          ))}
        {step === "simulation" && <SimulationWorkbench />}
        {step === "results" && <ResultsView />}
      </main>
    </div>
  );
}
