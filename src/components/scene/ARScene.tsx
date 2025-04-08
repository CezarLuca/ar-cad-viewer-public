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

    // Start WebXR session and set up image tracking
    useEffect(() => {
        const startARSession = async () => {
            if (navigator.xr && isARPresenting) {
                try {
                    const session = await navigator.xr.requestSession(
                        "immersive-ar",
                        {
                            requiredFeatures: [
                                "image-tracking",
                                "local-floor",
                                "dom-overlay",
                            ],
                        }
                    );

                    // Load the image to be tracked
                    const image = new Image();
                    image.src = "/markers/qrTracker.png";
                    await image.decode();

                    const imageBitmap = await createImageBitmap(image);

                    session.updateRenderState({
                        domOverlay: { root: containerRef.current },
                        trackedImages: [
                            { image: imageBitmap, widthInMeters: 0.1 }, // Specify the real-world size
                        ],
                    });

                    session.addEventListener("end", () => {
                        console.log("AR session ended.");
                    });

                    // Request the reference space once and await it.
                    const referenceSpace = await session.requestReferenceSpace(
                        "local"
                    );

                    // Handle image tracking results
                    const onXRFrame = (
                        time: DOMHighResTimeStamp,
                        frame: XRFrame
                    ) => {
                        const imageTrackingResults =
                            frame.getImageTrackingResults();

                        imageTrackingResults.forEach((result) => {
                            if (
                                result.imageSpace &&
                                result.trackingState === "tracked"
                            ) {
                                // We assume result.imageSpace is a XRReferenceSpace here.
                                const pose = frame.getPose(
                                    result.imageSpace as XRReferenceSpace,
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

                        session.requestAnimationFrame(onXRFrame);
                    };

                    session.requestAnimationFrame(onXRFrame);
                } catch (error) {
                    console.error("Failed to start AR session:", error);
                }
            }
        };

        if (isARPresenting) {
            startARSession();
        }
    }, [isARPresenting, containerRef]);

    // Render overlay content
    useEffect(() => {
        // Capture the current container element
        const currentContainer = containerRef.current;
        const portalRoot = document.createElement("div");
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
            // Use the captured container element for cleanup
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
