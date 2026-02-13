"use client";

import { FILLER_MORPH_TARGETS, BOTOX_ZONES } from "@/lib/meshSimulation";
import type { SimulationState } from "@/lib/meshSimulation";

interface SimulationControlsProps {
  state: SimulationState;
  onFillerChange: (name: string, value: number) => void;
  onBotoxChange: (name: string, value: number) => void;
  onReset: () => void;
}

export function SimulationControls({
  state,
  onFillerChange,
  onBotoxChange,
  onReset,
}: SimulationControlsProps) {
  // Group filler targets by category
  const fillersByCategory = FILLER_MORPH_TARGETS.reduce(
    (acc, target) => {
      if (!acc[target.category]) {
        acc[target.category] = [];
      }
      acc[target.category].push(target);
      return acc;
    },
    {} as Record<string, typeof FILLER_MORPH_TARGETS>
  );

  // Group botox zones by category
  const botoxByCategory = BOTOX_ZONES.reduce(
    (acc, zone) => {
      if (!acc[zone.category]) {
        acc[zone.category] = [];
      }
      acc[zone.category].push(zone);
      return acc;
    },
    {} as Record<string, typeof BOTOX_ZONES>
  );

  const formatLabel = (name: string): string => {
    return name
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .replace(/^\s+/, "")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 space-y-6 max-h-[600px] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">3D Simulation</h3>
        <button
          onClick={onReset}
          className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
        >
          Reset All
        </button>
      </div>

      {/* Filler Controls */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-blue-400 border-b border-blue-400/30 pb-1">
          💉 Fillers (Volume)
        </h4>

        {Object.entries(fillersByCategory).map(([category, targets]) => (
          <div key={category} className="space-y-2">
            <h5 className="text-sm font-medium text-gray-300 capitalize">
              {formatLabel(category)}
            </h5>

            {targets.map((target) => (
              <div key={target.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400">
                    {formatLabel(target.name.replace(`${category}_`, ""))}
                  </label>
                  <span className="text-xs text-gray-500">
                    {Math.round((state.fillerValues[target.name] || 0) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={(state.fillerValues[target.name] || 0) * 100}
                  onChange={(e) =>
                    onFillerChange(target.name, Number(e.target.value) / 100)
                  }
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Botox Controls */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-purple-400 border-b border-purple-400/30 pb-1">
          💆 Botox (Smoothing)
        </h4>

        {Object.entries(botoxByCategory).map(([category, zones]) => (
          <div key={category} className="space-y-2">
            <h5 className="text-sm font-medium text-gray-300 capitalize">
              {formatLabel(category)}
            </h5>

            {zones.map((zone) => (
              <div key={zone.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400">
                    {formatLabel(zone.name)}
                  </label>
                  <span className="text-xs text-gray-500">
                    {Math.round((state.botoxValues[zone.name] || 0) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={(state.botoxValues[zone.name] || 0) * 100}
                  onChange={(e) =>
                    onBotoxChange(zone.name, Number(e.target.value) / 100)
                  }
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
        <p>
          <strong>Fillers:</strong> Mesh deformation along vertex normals
        </p>
        <p>
          <strong>Botox:</strong> Normal map blur for wrinkle relaxation
        </p>
      </div>
    </div>
  );
}
