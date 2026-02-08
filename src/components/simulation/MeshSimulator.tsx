"use client";

import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import { MeshRenderer, FILLER_MORPH_TARGETS, BOTOX_ZONES } from "@/lib/meshSimulation";
import type { SimulationState } from "@/lib/meshSimulation";
import { detectFaceLandmarks } from "@/lib/mediapipe";

interface MeshSimulatorProps {
  imageDataUrl: string;
  width?: number;
  height?: number;
  simulationState: SimulationState;
  onReady?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export interface MeshSimulatorRef {
  exportImage: () => string | null;
}

export const MeshSimulator = forwardRef<MeshSimulatorRef, MeshSimulatorProps>(
  function MeshSimulator(
    {
      imageDataUrl,
      width = 512,
      height = 512,
      simulationState,
      onReady,
      onError,
      className = "",
    },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<MeshRenderer | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      exportImage: () => {
        if (!rendererRef.current) return null;
        return rendererRef.current.toDataURL("image/png");
      },
    }));

    // Initialize renderer when image changes
    useEffect(() => {
      if (!canvasRef.current || !imageDataUrl) return;

      const initRenderer = async () => {
        try {
          setError(null);
          setIsInitialized(false);

          // Clean up previous renderer
          if (rendererRef.current) {
            rendererRef.current.dispose();
            rendererRef.current = null;
          }

          // Create image element to detect landmarks
          const img = new Image();
          img.crossOrigin = "anonymous";

          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = imageDataUrl;
          });

          // Detect face landmarks
          const landmarks = await detectFaceLandmarks(img);
          if (!landmarks) {
            throw new Error("No face detected in image");
          }

          // Create renderer
          rendererRef.current = new MeshRenderer(
            canvasRef.current!,
            width,
            height
          );
          await rendererRef.current.initialize(imageDataUrl, landmarks);

          setIsInitialized(true);
          onReady?.();
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error.message);
          onError?.(error);
        }
      };

      initRenderer();

      return () => {
        if (rendererRef.current) {
          rendererRef.current.dispose();
          rendererRef.current = null;
        }
      };
    }, [imageDataUrl, width, height, onReady, onError]);

    // Update renderer when simulation state changes
    useEffect(() => {
      if (rendererRef.current && isInitialized) {
        rendererRef.current.updateSimulation(simulationState);
      }
    }, [simulationState, isInitialized]);

    return (
    <div className={`relative ${className}`}>
      {/* Canvas for WebGL rendering */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-auto rounded-lg"
        style={{ display: isInitialized ? "block" : "none" }}
      />

      {/* Loading state */}
      {!isInitialized && !error && (
        <div
          className="flex items-center justify-center bg-gray-900 rounded-lg"
          style={{ width, height }}
        >
          <div className="text-center text-gray-400">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
            <p>Initializing 3D mesh...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div
          className="flex items-center justify-center bg-red-900/20 rounded-lg border border-red-500/50"
          style={{ width, height }}
        >
          <div className="text-center text-red-400 p-4">
            <p className="font-medium">Failed to initialize</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}
    </div>
    );
  }
);

// Export hooks for external control
export function useMeshSimulator() {
  const [state, setState] = useState<SimulationState>({
    fillerValues: {},
    botoxValues: {},
  });

  const setFillerValue = useCallback((name: string, value: number) => {
    setState((prev) => ({
      ...prev,
      fillerValues: {
        ...prev.fillerValues,
        [name]: Math.max(0, Math.min(1, value)),
      },
    }));
  }, []);

  const setBotoxValue = useCallback((name: string, value: number) => {
    setState((prev) => ({
      ...prev,
      botoxValues: {
        ...prev.botoxValues,
        [name]: Math.max(0, Math.min(1, value)),
      },
    }));
  }, []);

  const reset = useCallback(() => {
    setState({ fillerValues: {}, botoxValues: {} });
  }, []);

  return {
    state,
    setFillerValue,
    setBotoxValue,
    reset,
    fillerTargets: FILLER_MORPH_TARGETS,
    botoxZones: BOTOX_ZONES,
  };
}
