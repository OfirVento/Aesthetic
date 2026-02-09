// We cannot import FaceMesh at the top level because it breaks SSR build
// We will dynamically import it inside the initialize function

let faceMeshInstance: any = null;

export const initFaceMesh = async () => {
    if (typeof window === 'undefined') return null; // Server guard
    if (faceMeshInstance) return faceMeshInstance;

    // Dynamic import
    const { FaceMesh } = await import('@mediapipe/face_mesh');

    faceMeshInstance = new FaceMesh({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
    });

    faceMeshInstance.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    await faceMeshInstance.initialize();
    return faceMeshInstance;
};

export const getFaceMesh = () => faceMeshInstance;

export const detectFace = (imageElement: HTMLImageElement): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        const mesh = await initFaceMesh();
        if (!mesh) return reject('Failed to init mesh');

        mesh.onResults((results: any) => {
            resolve(results);
        });

        await mesh.send({ image: imageElement });
    });
};
