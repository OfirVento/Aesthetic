import React from 'react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/session';

export const Navigation = () => {
    const { currentStep, setStep } = useStore();

    const steps = [
        { id: 'SCAN', label: '01 SCAN' },
        { id: 'SIMULATION', label: '02 SIMULATION' },
        { id: 'RESULTS', label: '03 RESULTS' },
    ] as const;

    return (
        <nav className="h-16 border-b border-stone-200 bg-white/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
            <div className="font-serif text-xl font-medium tracking-tight text-stone-900">
                Aesthetic Styling
            </div>

            <div className="flex items-center gap-1">
                {steps.map((step) => (
                    <button
                        key={step.id}
                        onClick={() => setStep(step.id)}
                        className={cn(
                            "px-4 py-2 text-[10px] font-black tracking-[0.2em] uppercase rounded-full transition-all",
                            currentStep === step.id
                                ? "bg-stone-900 text-white shadow-md"
                                : "text-stone-400 hover:text-stone-600 hover:bg-stone-100"
                        )}
                    >
                        {step.label}
                    </button>
                ))}
            </div>

            <div className="w-24 flex justify-end">
                <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200" />
            </div>
        </nav>
    );
};
