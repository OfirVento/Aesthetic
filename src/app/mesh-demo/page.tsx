"use client";

import { useState, useRef } from "react";
import { MeshSimulator, useMeshSimulator, SimulationControls } from "@/components/simulation";
import type { MeshSimulatorRef } from "@/components/simulation/MeshSimulator";

export default function MeshDemoPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const simulatorRef = useRef<MeshSimulatorRef>(null);

  const {
    state,
    setFillerValue,
    setBotoxValue,
    reset,
  } = useMeshSimulator();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target?.result as string);
      setIsReady(false);
    };
    reader.readAsDataURL(file);
  };

  const handleExport = () => {
    const dataUrl = simulatorRef.current?.exportImage();
    if (dataUrl) {
      const link = document.createElement("a");
      link.download = "simulation-result.png";
      link.href = dataUrl;
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">3D Mesh Simulation Demo</h1>
          <p className="text-gray-400">
            Real-time filler and Botox simulation using WebGL mesh deformation
          </p>
        </div>

        {/* Upload Section */}
        {!imageUrl && (
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-12 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer inline-block"
            >
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-lg font-medium">Upload a face photo</p>
                <p className="text-sm mt-1">Click to select or drag and drop</p>
              </div>
            </label>
          </div>
        )}

        {/* Simulation Section */}
        {imageUrl && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Canvas Area */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Preview</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setImageUrl(null);
                        reset();
                      }}
                      className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
                    >
                      New Photo
                    </button>
                    {isReady && (
                      <button
                        onClick={handleExport}
                        className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 rounded"
                      >
                        Export
                      </button>
                    )}
                  </div>
                </div>

                <MeshSimulator
                  ref={simulatorRef}
                  imageDataUrl={imageUrl}
                  simulationState={state}
                  onReady={() => setIsReady(true)}
                  onError={(err) => console.error("Simulator error:", err)}
                  className="mx-auto"
                />

                {/* Status */}
                <div className="mt-4 text-center text-sm">
                  {isReady ? (
                    <span className="text-green-400">
                      ✓ Ready - Adjust sliders to simulate treatments
                    </span>
                  ) : (
                    <span className="text-yellow-400">
                      Initializing face mesh...
                    </span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="mt-4 bg-gray-900/50 rounded-lg p-4 text-sm text-gray-400">
                <h3 className="font-medium text-white mb-2">How it works:</h3>
                <ul className="space-y-1 list-disc list-inside">
                  <li>
                    <strong>Fillers:</strong> Mesh vertices expand along their
                    normals (volume injection simulation)
                  </li>
                  <li>
                    <strong>Botox:</strong> Normal map blur in specific UV zones
                    (wrinkle relaxation)
                  </li>
                  <li>
                    <strong>Real-time:</strong> All rendering happens on GPU via
                    WebGL shaders
                  </li>
                  <li>
                    <strong>Preserves detail:</strong> Original skin texture is
                    never regenerated
                  </li>
                </ul>
              </div>
            </div>

            {/* Controls */}
            <div className="lg:col-span-1">
              <SimulationControls
                state={state}
                onFillerChange={setFillerValue}
                onBotoxChange={setBotoxValue}
                onReset={reset}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
