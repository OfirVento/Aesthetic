"use client";

import { useState, useEffect } from "react";
import { getStoredApiKey, setStoredApiKey } from "@/lib/api/gemini";

interface ApiKeyPromptProps {
  onKeySet: () => void;
}

export default function ApiKeyPrompt({ onKeySet }: ApiKeyPromptProps) {
  const [key, setKey] = useState("");
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const stored = getStoredApiKey();
    if (stored) setHasKey(true);
  }, []);

  if (hasKey) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      setStoredApiKey(key.trim());
      setHasKey(true);
      onKeySet();
    }
  };

  return (
    <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 shrink-0">
      <form onSubmit={handleSubmit} className="flex items-center gap-3 max-w-2xl mx-auto">
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 shrink-0">
          Gemini API Key Required
        </span>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Enter your Gemini API key..."
          className="flex-1 text-xs bg-white border border-amber-200 rounded-full px-4 py-2 focus:outline-none focus:border-amber-400 placeholder:text-amber-300"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-stone-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-black transition-colors"
        >
          Save
        </button>
      </form>
    </div>
  );
}
