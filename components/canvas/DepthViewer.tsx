import React, { useRef, useEffect, useState } from 'react';

interface DepthViewerProps {
    originalImage: string;
    depthMap: string;
    className?: string;
}

export const DepthViewer: React.FC<DepthViewerProps> = ({ originalImage, depthMap, className }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setMousePos({ x, y });
    };

    const handleMouseLeave = () => {
        setMousePos({ x: 0, y: 0 });
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`relative overflow-hidden cursor-move ${className}`}
            style={{ perspective: '1000px' }}
        >
            {/* We use a displacement filter trick or simple Parallax with CSS for V1 */}
            {/* A true WebGL displacement map is better but complex to setup in 1 file without Three.js */}
            {/* Let's use a dual-layer parallax for "Fake 3D" feel first which is surprisingly effective */}

            <div className="relative w-full h-full transform-style-3d transition-transform duration-100 ease-out"
                style={{
                    transform: `rotateY(${mousePos.x * 10}deg) rotateX(${mousePos.y * -10}deg)`
                }}>

                {/* Base Image */}
                <img src={originalImage} className="absolute inset-0 w-full h-full object-contain" />

                {/* Overlay Depth Map (Debug or Effect) - For now let's just use the tilt */}
                {/* Ideally we would displace pixels. For Step 1, let's just show the tilt to prove interaction */}
            </div>

            {/* Toggle to see Depth Map */}
            <div className="absolute top-2 left-2 group">
                <div className="w-8 h-8 rounded bg-black/50 overflow-hidden border border-white/20">
                    <img src={depthMap} className="w-full h-full opacity-80" />
                </div>
                <div className="hidden group-hover:block absolute top-0 left-10 bg-black/80 text-white text-[10px] p-1 rounded whitespace-nowrap">
                    Depth Map Active
                </div>
            </div>

        </div>
    );
};
