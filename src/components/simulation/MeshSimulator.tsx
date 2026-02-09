"use client";

import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import { MeshRenderer, FILLER_MORPH_TARGETS, BOTOX_ZONES } from "@/lib/meshSimulation";
import type { SimulationState } from "@/lib/meshSimulation";
import { detectFaceLandmarks } from "@/lib/mediapipe";

interface MeshSimulatorProps {
  imageDataUrl: string;
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
      simulationState,
      onReady,
      onError,
      className = "",
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<MeshRenderer | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dimensions, setDimensions] = useState({ width: 512, height: 512 });
    const initializingRef = useRef(false);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      exportImage: () => {
        if (!rendererRef.current) return null;
        return rendererRef.current.toDataURL("image/png");
      },
    }));

    // Initialize renderer when image changes (but NOT when simulationState changes)
    useEffect(() => {
      if (!canvasRef.current || !imageDataUrl || initializingRef.current) return;

      const initRenderer = async () => {
        initializingRef.current = true;

        try {
          setError(null);

          // Clean up previous renderer
          if (rendererRef.current) {
            rendererRef.current.dispose();
            rendererRef.current = null;
          }

          // Create image element to get dimensions and detect landmarks
          const img = new Image();
          img.crossOrigin = "anonymous";

          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = imageDataUrl;
          });

          // Calculate dimensions maintaining aspect ratio
          const maxWidth = 600;
          const maxHeight = 600;
          let width = img.naturalWidth;
          let height = img.naturalHeight;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }

          setDimensions({ width: Math.round(width), height: Math.round(height) });

          // Detect face landmarks
          const landmarks = await detectFaceLandmarks(img);
          if (!landmarks) {
            throw new Error("No face detected in image");
          }

          // Create renderer with correct dimensions
          rendererRef.current = new MeshRenderer(
            canvasRef.current!,
            Math.round(width),
            Math.round(height)
          );
          await rendererRef.current.initialize(imageDataUrl, landmarks);

          setIsInitialized(true);
          onReady?.();
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error.message);
          onError?.(error);
        } finally {
          initializingRef.current = false;
        }
      };

      initRenderer();

      return () => {
        if (rendererRef.current) {
          rendererRef.current.dispose();
          rendererRef.current = null;
        }
      };
    // Only re-run when imageDataUrl changes, not simulationState
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imageDataUrl]);

    // Update renderer when simulation state changes (separate effect)
    useEffect(() => {
      const hasFillers = Object.keys(simulationState.fillerValues).length > 0;
      const hasBotox = Object.keys(simulationState.botoxValues).length > 0;
      console.log("[MeshSimulator] Effect fired. isInitialized:", isInitialized, "hasRenderer:", !!rendererRef.current, "hasFillers:", hasFillers, "hasBotox:", hasBotox);
      if (rendererRef.current && isInitialized) {
        rendererRef.current.updateSimulation(simulationState);
      }
    }, [simulationState, isInitialized]);

    return (
      <div ref={containerRef} className={`relative ${className}`}>
        {/* Canvas - always visible once we have dimensions */}
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="rounded-lg block"
          style={{
            width: dimensions.width,
            height: dimensions.height,
            backgroundColor: '#1a1a2e'
          }}
        />

        {/* Loading overlay - shown on top of canvas */}
        {!isInitialized && !error && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-gray-900/80 rounded-lg"
          >
            <div className="text-center text-gray-400">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
              <p>Detecting face...</p>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-red-900/20 rounded-lg border border-red-500/50"
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
