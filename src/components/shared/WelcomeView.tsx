"use client";

import { useSessionStore } from "@/lib/store/session";
import ImageUpload from "./ImageUpload";

interface WelcomeViewProps {
  onStartCapture: () => void;
}

export default function WelcomeView({ onStartCapture }: WelcomeViewProps) {
  const { setCapturedImage } = useSessionStore();

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center fade-in">
      <div className="mb-12 w-32 h-32 rounded-full overflow-hidden border border-stone-100 shadow-sm p-1">
        <img
          src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400"
          alt="Aesthetic preview"
          className="w-full h-full object-cover rounded-full"
        />
      </div>

      <h1 className="font-serif text-4xl mb-6 text-stone-800 tracking-tight">
        Curate Your Best Self
      </h1>
      <p className="text-stone-400 mb-12 leading-relaxed max-w-sm text-sm">
        Experience high-fidelity simulations for subtle facial refinements.
        Driven by anatomical precision and aesthetic vision.
      </p>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={onStartCapture}
          className="bg-stone-900 text-white py-5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl"
        >
          Begin Face Scan
        </button>

        <ImageUpload
          onUpload={setCapturedImage}
          className="text-stone-400 py-4 font-black text-[10px] uppercase tracking-[0.2em] hover:text-stone-900 transition-colors"
        >
          Or Upload Profile
        </ImageUpload>
      </div>
    </div>
  );
}
