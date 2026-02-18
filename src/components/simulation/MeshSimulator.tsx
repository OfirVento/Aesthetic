"use client";

import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import { MeshRenderer, FILLER_MORPH_TARGETS, BOTOX_ZONES } from "@/lib/meshSimulation";
import type { SimulationState } from "@/lib/meshSimulation";
import { detectFaceLandmarks } from "@/lib/mediapipe";
import type { LandmarkPoint } from "@/lib/mediapipe";

interface MeshSimulatorProps {
  imageDataUrl: string;
  simulationState: SimulationState;
  /** Pre-detected landmarks — skip face detection if provided */
  landmarks?: LandmarkPoint[] | null;
  /** Scale canvas to fill parent container (use with CSS positioning) */
  fitContainer?: boolean;
  onReady?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export interface MeshSimulatorRef {
  exportImage: () => string | null;
  updateSimulation: (state: SimulationState) => void;
}

export const MeshSimulator = forwardRef<MeshSimulatorRef, MeshSimulatorProps>(
  function MeshSimulator(
    {
      imageDataUrl,
      simulationState,
      landmarks: landmarksProp,
      fitContainer = false,
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
    const imageAspectRef = useRef(1); // natural width / natural height
    const initializingRef = useRef(false);

    // Expose methods via ref — updateSimulation bypasses React effects
    useImperativeHandle(ref, () => ({
      exportImage: () => {
        if (!rendererRef.current) return null;
        return rendererRef.current.toDataURL("image/png");
      },
      updateSimulation: (state: SimulationState) => {
        if (rendererRef.current) {
          rendererRef.current.updateSimulation(state);
        }
      },
    }));

    // Initialize renderer when image changes (but NOT when simulationState changes)
    useEffect(() => {
      if (!canvasRef.current || !imageDataUrl || initializingRef.current) return;

      const initRenderer = async () => {
        initializingRef.current = true;

        try {
          setError(null);
          setIsInitialized(false);

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

          // Store aspect ratio for ResizeObserver
          imageAspectRef.current = img.naturalWidth / img.naturalHeight;

          // Calculate dimensions maintaining aspect ratio
          const maxWidth = fitContainer ? 800 : 600;
          const maxHeight = fitContainer ? 800 : 600;
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

          // Use pre-detected landmarks if available, otherwise detect
          const landmarks = landmarksProp ?? await detectFaceLandmarks(img);
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
    // Only re-run when imageDataUrl or landmarks prop changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imageDataUrl, landmarksProp]);

    // Update renderer when simulation state changes (separate effect)
    useEffect(() => {
      if (rendererRef.current && isInitialized) {
        rendererRef.current.updateSimulation(simulationState);
      }
    }, [simulationState, isInitialized]);

    // Handle container resizing for fitContainer mode
    useEffect(() => {
      if (!fitContainer || !containerRef.current) return;

      const observer = new ResizeObserver((entries) => {
        const { width: cw, height: ch } = entries[0].contentRect;
        if (cw > 0 && ch > 0 && rendererRef.current) {
          // Fit image aspect ratio inside the container (like object-fit: contain)
          const aspect = imageAspectRef.current;
          let newW: number, newH: number;
          if (cw / ch > aspect) {
            // Container is wider than image — height-limited
            newH = Math.min(Math.round(ch), 800);
            newW = Math.round(newH * aspect);
          } else {
            // Container is taller than image — width-limited
            newW = Math.min(Math.round(cw), 800);
            newH = Math.round(newW / aspect);
          }
          setDimensions({ width: newW, height: newH });
          rendererRef.current.resize(newW, newH);
        }
      });

      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }, [fitContainer]);

    return (
      <div
        ref={containerRef}
        className={`relative ${fitContainer ? "flex items-center justify-center" : ""} ${className}`}
      >
        {/* Canvas - sized explicitly to preserve aspect ratio */}
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="rounded-lg block"
          style={{ width: dimensions.width, height: dimensions.height }}
        />

        {/* Loading overlay - shown on top of canvas */}
        {!isInitialized && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-lg">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-stone-900 border-t-transparent rounded-full mx-auto mb-2" />
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                Initializing 3D Preview...
              </span>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900/10 rounded-lg border border-red-300/50">
            <div className="text-center text-red-500 p-4">
              <p className="text-xs font-bold">3D Preview Unavailable</p>
              <p className="text-[10px] mt-1 text-red-400">{error}</p>
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
