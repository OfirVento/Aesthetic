import React from 'react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/session';
import Link from 'next/link';

export const Navigation = () => {
    const { step: currentStep, setStep } = useStore();

    const steps = [
        { id: 'SCAN', label: '01 SCAN' },
        { id: 'SIMULATION', label: '02 SIMULATION' },
        { id: 'RESULTS', label: '03 RESULTS' },
    ] as const;

    return (
        <nav className="h-16 border-b border-stone-200 bg-white/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
            <div className="font-serif text-xl font-medium tracking-tight text-stone-900">
                <Link href="/">Aesthetic Styling</Link>
            </div>

            <div className="flex items-center gap-1">
                {steps.map((stepItem) => (
                    <button
                        key={stepItem.id}
                        onClick={() => setStep(stepItem.id)}
                        className={cn(
                            "px-4 py-2 text-[10px] font-black tracking-[0.2em] uppercase rounded-full transition-all",
                            currentStep === stepItem.id
                                ? "bg-stone-900 text-white shadow-md"
                                : "text-stone-400 hover:text-stone-600 hover:bg-stone-100"
                        )}
                    >
                        {stepItem.label}
                    </button>
                ))}
            </div>

            <div className="w-24 flex justify-end">
                <Link href="/dashboard" className="text-[10px] uppercase font-bold text-stone-900 border border-stone-200 px-3 py-1.5 rounded-full hover:bg-stone-100 transition-colors">
                    My Patients
                </Link>
            </div>
        </nav>
    );
};
