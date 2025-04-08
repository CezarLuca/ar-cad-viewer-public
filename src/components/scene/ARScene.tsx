"use client";

import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { Group, Matrix4 } from "three";
import { Environment, useGLTF } from "@react-three/drei";
import CADModel from "./CADModel";
import AROverlayContent from "./ui/AROverlayContent";
import { useModelUrl } from "@/context/ModelUrlContext";
import { ModelConfigProvider } from "@/context/ModelConfigContext";
import { useAR } from "@/context/ARContext";

const engineModel = "/models/engine.glb";
useGLTF.preload(engineModel);

export default function ARScene() {
    const { isARPresenting, containerRef } = useAR(); // Access ARContext
    const { modelUrl } = useModelUrl();
    const modelRef = useRef<Group>(null); // Reference to the 3D model group
    const [trackedImageMatrix, setTrackedImageMatrix] =
        useState<Matrix4 | null>(null);
    const [isModelPlaced, setIsModelPlaced] = useState(false);

    // Preload model if not the default engine model
    useEffect(() => {
        if (modelUrl !== engineModel) {
            useGLTF.preload(modelUrl);
        }
    }, [modelUrl]);

    // Handle tracked image results
    useEffect(() => {
        const onXRFrame = (
            session: XRSession,
            frame: XRFrame,
            referenceSpace: XRReferenceSpace
        ) => {
            const imageTrackingResults = frame.getImageTrackingResults();

            imageTrackingResults.forEach((result) => {
                if (result.imageSpace && result.trackingState === "tracked") {
                    const pose = frame.getPose(
                        result.imageSpace,
                        referenceSpace
                    );
                    if (pose) {
                        const matrix = new Matrix4().fromArray(
                            pose.transform.matrix
                        );
                        setTrackedImageMatrix(matrix);
                    }
                }
            });

            session.requestAnimationFrame((time, frame) =>
                onXRFrame(session, frame, referenceSpace)
            );
        };

        if (isARPresenting) {
            // Retrieve session and reference space from ARContext
            const startTracking = async () => {
                if (navigator.xr) {
                    const session = await navigator.xr.requestSession(
                        "immersive-ar",
                        {
                            requiredFeatures: ["image-tracking"],
                            trackedImages: [
                                {
                                    image: await createImageBitmap(new Image()),
                                    widthInMeters: 0.1,
                                },
                            ],
                        } as XRSessionInit
                    );
                    const referenceSpace = await session.requestReferenceSpace(
                        "local"
                    );

                    session.requestAnimationFrame((time, frame) =>
                        onXRFrame(session, frame, referenceSpace)
                    );
                }
            };

            startTracking();
        }
    }, [isARPresenting]);

    // Render overlay content
    useEffect(() => {
        const portalRoot = document.createElement("div");
        const currentContainer = containerRef.current;

        if (currentContainer) {
            currentContainer.appendChild(portalRoot);
        }
        const root = ReactDOM.createRoot(portalRoot);

        root.render(
            <ModelConfigProvider>
                <AROverlayContent
                    onPlaceModel={() => {
                        if (trackedImageMatrix) {
                            setIsModelPlaced(true);
                            console.log(
                                "Model placed at tracked image location."
                            );
                        } else {
                            console.error(
                                "No tracked image available for placement."
                            );
                        }
                    }}
                    isModelPlaced={isModelPlaced}
                />
            </ModelConfigProvider>
        );

        return () => {
            root.unmount();
            if (currentContainer) {
                currentContainer.removeChild(portalRoot);
            }
        };
    }, [containerRef, isModelPlaced, trackedImageMatrix]);

    return (
        <>
            <ambientLight intensity={1.5} color="#ffffff" />
            <directionalLight
                position={[5, 5, 5]}
                intensity={2}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />
            <Environment preset="sunset" />

            {/* Render CADModel relative to the tracked image */}
            <group ref={modelRef} matrixAutoUpdate={false}>
                {trackedImageMatrix && (
                    <mesh matrix={trackedImageMatrix.toArray()}>
                        <CADModel />
                    </mesh>
                )}
            </group>
        </>
    );
}
