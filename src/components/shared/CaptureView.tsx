"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSessionStore } from "@/lib/store/session";

export default function CaptureView() {
  const { setCapturedImage } = useSessionStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setupCamera = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("MediaDevices API not supported");
      return;
    }
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1280, height: 720 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraReady(true);
      }
    } catch {
      setError("Camera access denied");
    }
  }, []);

  useEffect(() => {
    setupCamera();
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((t) => t.stop());
      }
    };
  }, [setupCamera]);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current && isCameraReady) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        setCapturedImage(canvas.toDataURL("image/jpeg", 0.9));
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) =>
        setCapturedImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-full flex flex-col bg-stone-900 relative fade-in">
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {!isCameraReady && (
          <div className="absolute inset-0 z-10 bg-stone-900 flex flex-col items-center justify-center p-8 text-center">
            {error ? (
              <div className="max-w-xs">
                <p className="text-stone-500 text-[10px] font-black uppercase tracking-widest mb-6">
                  {error}
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white text-stone-900 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest"
                >
                  Manual Upload
                </button>
              </div>
            ) : (
              <span className="text-stone-700 text-[10px] font-black uppercase tracking-widest animate-pulse">
                Initializing Lens...
              </span>
            )}
          </div>
        )}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-80 border border-white/20 rounded-[100px] shadow-[0_0_0_2000px_rgba(0,0,0,0.5)]" />
        </div>
      </div>

      <div className="bg-white p-12 flex flex-col items-center">
        <h2 className="text-stone-800 font-serif text-xl mb-2">
          Align Portrait
        </h2>
        <p className="text-stone-400 text-[9px] font-black uppercase tracking-widest mb-10">
          Capture or upload for simulation
        </p>

        <div className="flex items-center gap-12">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-stone-300 hover:text-stone-900 transition-colors"
          >
            <i className="fa-solid fa-image text-xl" />
          </button>
          <button
            onClick={takePhoto}
            disabled={!isCameraReady}
            className={`w-20 h-20 rounded-full border-4 p-1 transition-all ${
              isCameraReady
                ? "border-stone-100 hover:border-stone-900"
                : "opacity-10"
            }`}
          >
            <div className="w-full h-full bg-stone-900 rounded-full" />
          </button>
          <div className="w-5" />
        </div>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileUpload}
        />
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
