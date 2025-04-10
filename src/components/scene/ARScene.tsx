"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ReactDOM from "react-dom/client";
import { Group, Matrix4 } from "three";
import { Environment, useGLTF, Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
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
    const { gl, camera } = useThree();
    const [xrSession, setXRSession] = useState<XRSession | null>(null);

    // Preload model if not the default engine model
    useEffect(() => {
        if (modelUrl !== engineModel) {
            useGLTF.preload(modelUrl);
        }
    }, [modelUrl]);

    const initializeAR = useCallback(async () => {
        if (navigator.xr && isARPresenting && containerRef.current) {
            try {
                if (!gl) {
                    console.error("WebGL context not available.");
                    return;
                }

                // Skip calling gl.makeXRCompatible since the context is already XR-compatible.
                if (typeof gl.makeXRCompatible === "function") {
                    console.log(
                        "Skipping gl.makeXRCompatible because context is already XR-compatible."
                    );
                }

                const img = new Image();
                img.src = new URL(
                    "/markers/qrTracker.png",
                    window.location.origin
                ).href;
                await new Promise((resolve, reject) => {
                    img.onload = () => resolve(null);
                    img.onerror = () =>
                        reject(new Error("Failed to load image"));
                });

                const session = await navigator.xr.requestSession(
                    "immersive-ar",
                    {
                        requiredFeatures: [
                            "local-floor",
                            "dom-overlay",
                            "image-tracking",
                        ],
                        trackedImages: [
                            {
                                image: await createImageBitmap(img),
                                widthInMeters: 0.1,
                            },
                        ],
                        domOverlay: { root: containerRef.current },
                    } as XRSessionInit
                );

                session.addEventListener("end", () => {
                    console.log("AR session ended.");
                    setXRSession(null);
                });

                session.updateRenderState({
                    baseLayer: new XRWebGLLayer(session, gl.getContext()),
                });

                camera.matrixAutoUpdate = false;
                setXRSession(session);

                // Request a valid reference space from the session.
                const referenceSpace = await session.requestReferenceSpace(
                    "local-floor"
                );

                const onXRFrame = (time: number, frame: XRFrame) => {
                    if (!session) return;
                    const imageTrackingResults =
                        frame.getImageTrackingResults();
                    imageTrackingResults.forEach((result) => {
                        if (
                            result.imageSpace &&
                            result.trackingState === "tracked"
                        ) {
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
                    session.requestAnimationFrame(onXRFrame);
                };

                session.requestAnimationFrame(onXRFrame);
            } catch (error) {
                console.error("Failed to start AR session:", error);
            }
        }
    }, [gl, camera, containerRef, isARPresenting]);

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
            {/* Start AR button wrapped in <Html> so it renders as DOM */}
            {!xrSession && (
                <Html prepend>
                    <button
                        onClick={initializeAR}
                        style={{
                            position: "absolute",
                            zIndex: 1000,
                            padding: "8px 16px",
                            margin: "16px",
                        }}
                    >
                        Start AR
                    </button>
                </Html>
            )}
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
