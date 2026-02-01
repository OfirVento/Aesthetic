import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

let faceMesh: FaceMesh | null = null;

export const initFaceMesh = async () => {
    if (faceMesh) return faceMesh;

    faceMesh = new FaceMesh({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
    });

    faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    await faceMesh.initialize();
    return faceMesh;
};

export const getFaceMesh = () => faceMesh;

export const detectFace = (imageElement: HTMLImageElement): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        const mesh = await initFaceMesh();
        if (!mesh) return reject('Failed to init mesh');

        mesh.onResults((results) => {
            resolve(results);
        });

        await mesh.send({ image: imageElement });
    });
};
