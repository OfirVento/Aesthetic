import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { useStore } from '@/store/session';
import { detectFace } from '@/lib/mediapipe';
import { getIndicesForRegion } from '@/lib/landmarks';

export const FaceCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
    const [landmarks, setLandmarks] = useState<any[] | null>(null);
    const { currentDesignImage, originalImage, activeRegion } = useStore();
    const [imageLoaded, setImageLoaded] = useState(false);

    // 1. Initialize Canvas
    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        // Canvas initialization
        const canvas = new fabric.Canvas(canvasRef.current, {
            selection: false,
            renderOnAddRemove: true,
            preserveObjectStacking: true,
            backgroundColor: '#f5f5f4', // stone-100
        });

        // Add extra data property to store transform info
        // @ts-ignore
        canvas.data = {};

        setFabricCanvas(canvas);

        const resizeOps = () => {
            if (containerRef.current && canvas) {
                canvas.setWidth(containerRef.current.clientWidth);
                canvas.setHeight(containerRef.current.clientHeight);
                canvas.renderAll();
            }
        };

        const resizeObserver = new ResizeObserver(resizeOps);
        resizeObserver.observe(containerRef.current);

        return () => {
            canvas.dispose();
            resizeObserver.disconnect();
        };
    }, []);

    // 2. Load Image & Run Detection
    useEffect(() => {
        if (!fabricCanvas) return;

        // Use current design if available, else original, else fallback
        const imgUrl = currentDesignImage || originalImage || "https://images.unsplash.com/photo-1534030347209-56781b48d269?q=80&w=2160&auto=format&fit=crop";

        // Reset
        fabricCanvas.clear();
        fabricCanvas.setBackgroundColor('#f5f5f4', () => { });
        setLandmarks(null);
        setImageLoaded(false);

        // Create hidden image element for MediaPipe (needs clean DOM element)
        const imgEl = document.createElement('img');
        imgEl.crossOrigin = 'anonymous';
        imgEl.src = imgUrl;

        imgEl.onload = async () => {
            // A. Add to Fabric
            const fabricImg = new fabric.Image(imgEl, {
                selectable: false,
                evented: false,
            });

            const containerW = fabricCanvas.width || 800;
            const containerH = fabricCanvas.height || 600;

            // Scale to fit (contain) inside canvas
            // We use a specific logic to ensure coordinates match
            const scale = Math.min(
                (containerW * 0.9) / imgEl.width,
                (containerH * 0.9) / imgEl.height
            );

            // Center logic
            const finalW = imgEl.width * scale;
            const finalH = imgEl.height * scale;
            const left = (containerW - finalW) / 2;
            const top = (containerH - finalH) / 2;

            fabricImg.set({
                scaleX: scale,
                scaleY: scale,
                left: left,
                top: top,
            });

            fabricCanvas.add(fabricImg);
            fabricCanvas.sendToBack(fabricImg);
            fabricCanvas.renderAll();
            setImageLoaded(true);

            // B. Run MediaPipe Detection
            try {
                console.log('Running Face Detection...');
                const results = await detectFace(imgEl);
                if (results && results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                    console.log('Face Detected!', results.multiFaceLandmarks[0].length);
                    // Store landmarks with metadata needed to map them to canvas
                    setLandmarks(results.multiFaceLandmarks[0]);

                    // Metadata for mapping normalized points back to canvas pixels
                    // @ts-ignore
                    fabricCanvas.data = {
                        scale,
                        left,
                        top,
                        width: imgEl.width,
                        height: imgEl.height
                    };
                }
            } catch (err) {
                console.error('Face Detection Failed', err);
            }
        };

    }, [fabricCanvas, currentDesignImage, originalImage]);

    // 3. Draw Active Region Mask
    useEffect(() => {
        // @ts-ignore
        if (!fabricCanvas || !activeRegion || !landmarks || !fabricCanvas.data) return;

        // Clear previous masks
        fabricCanvas.getObjects().forEach(obj => {
            if (obj.type === 'path' || obj.type === 'polygon') fabricCanvas.remove(obj);
        });

        const indices = getIndicesForRegion(activeRegion);
        if (!indices || indices.length === 0) return;

        // Transform landmarks to canvas coordinates
        // @ts-ignore
        const { scale, left, top, width, height } = fabricCanvas.data;

        const points = indices.map(idx => {
            const pt = landmarks[idx];
            // MediaPipe returns normalized 0..1 coordinates
            // We map them to the original image dimensions, then scale/position them onto the canvas
            return {
                x: left + (pt.x * width * scale),
                y: top + (pt.y * height * scale)
            };
        });

        // Create a Polygon from points
        const poly = new fabric.Polygon(points, {
            fill: 'rgba(255, 255, 255, 0.2)',
            stroke: '#ffffff',
            strokeWidth: 1.5,
            objectCaching: false,
            selectable: false,
            evented: false,
            strokeDashArray: [5, 5] // cosmetic
        });

        // Animation loop (simple pulse)
        // @ts-ignore
        const animate = () => {
            // @ts-ignore
            if (!poly.canvas) return; // stopped
            poly.animate('opacity', poly.opacity === 1 ? 0.4 : 1, {
                duration: 1000,
                onChange: fabricCanvas.renderAll.bind(fabricCanvas),
                onComplete: animate
            });
        };
        animate();

        fabricCanvas.add(poly);
        fabricCanvas.requestRenderAll();

    }, [fabricCanvas, activeRegion, landmarks]);

    const [depthMap, setDepthMap] = useState<string | null>(null);
    const [showDepth, setShowDepth] = useState(false);

    // ... (existing logic)

    const toggleDepth = async () => {
        if (showDepth) {
            setShowDepth(false);
            return;
        }

        if (depthMap) {
            setShowDepth(true);
            return;
        }

        // Fetch depth
        if (!currentDesignImage && !originalImage) return;

        try {
            console.log("Generating depth map...");
            const res = await fetch('/api/depth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: currentDesignImage || originalImage })
            });
            const data = await res.json();
            if (data.success) {
                setDepthMap(data.depthMap);
                setShowDepth(true);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div ref={containerRef} className="w-full h-full bg-stone-100/50 relative group/canvas">

            {/* Main Canvas Layer */}
            <div className={`w-full h-full transition-opacity duration-500 ${showDepth ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <canvas ref={canvasRef} className="w-full h-full" />
            </div>

            {/* Depth View Layer (Overlay) */}
            {showDepth && depthMap && (
                <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
                    <img src={depthMap} className="h-full object-contain opacity-80" />
                    <div className="absolute bottom-10 text-white text-xs font-mono uppercase">Depth Map Visualization</div>
                </div>
            )}

            {/* Loading Indicator */}
            {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center text-stone-400 text-xs tracking-widest uppercase">
                    Loading Image...
                </div>
            )}

            {/* 3D Toggle Button */}
            <button
                onClick={toggleDepth}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur border border-stone-200 p-2 rounded-full shadow-lg text-stone-900 opacity-60 hover:opacity-100 transition-all font-black text-[9px] uppercase tracking-widest z-30"
            >
                {showDepth ? 'Exit 2.5D' : 'View Depth'}
            </button>

        </div>
    );
};
