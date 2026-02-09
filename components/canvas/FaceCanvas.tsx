'use client';

import dynamic from 'next/dynamic';

const FaceCanvasClient = dynamic(
    () => import('./FaceCanvasClient').then((mod) => mod.FaceCanvas),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs tracking-widest uppercase">
                Initializing Canvas...
            </div>
        )
    }
);

export const FaceCanvas = () => {
    return <FaceCanvasClient />;
};
