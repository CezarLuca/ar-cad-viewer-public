"use client";

import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { Group, Matrix4, Vector3 } from "three";
import { useXR, XRHitTest } from "@react-three/xr";
import { useThree, useFrame } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import CADModel from "./CADModel";
import ModelControls from "./ui/ModelControls";
import { useModelUrl } from "@/context/ModelUrlContext";
import { ModelConfigProvider } from "@/context/ModelConfigContext";

interface ARSceneProps {
    setIsARPresenting: (isPresenting: boolean) => void;
}

const engineModel = "/models/engine.glb";
useGLTF.preload(engineModel);

const AROverlayContent = ({
    onPlaceModel,
    isModelPlaced,
}: {
    onPlaceModel: () => void;
    isModelPlaced: boolean;
}) => {
    return (
        <div className="absolute top-12 left-0 right-0 bottom-0 z-20 pointer-events-none">
            {!isModelPlaced && (
                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-auto">
                    <button
                        onClick={onPlaceModel}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg"
                    >
                        Place Model
                    </button>
                </div>
            )}
            <ModelControls />
        </div>
    );
};

export default function ARScene({ setIsARPresenting }: ARSceneProps) {
    const { modelUrl } = useModelUrl();
    const modelRef = useRef<Group>(null);
    const { gl } = useThree();
    const { session, domOverlayRoot } = useXR();
    const matrixHelper = useRef(new Matrix4()); // Matrix helper for hit test position
    const hitTestPosition = useRef(new Vector3());

    // Add state for tracking model placement
    const [isModelPlaced, setIsModelPlaced] = useState(false);
    const [currentHitPosition, setCurrentHitPosition] =
        useState<Vector3 | null>(null);

    // If it's not the default model, preload it once when the component mounts
    useEffect(() => {
        if (modelUrl !== engineModel) {
            useGLTF.preload(modelUrl);
        }
    }, [modelUrl]);

    // Update parent about AR session status
    useEffect(() => {
        if (session) {
            const isVisible = session.visibilityState === "visible";
            setIsARPresenting(isVisible);
        } else {
            setIsARPresenting(false);
        }
    }, [session, setIsARPresenting]);

    // Set up AR session with camera passthrough
    useEffect(() => {
        if (session) {
            (async () => {
                try {
                    // Request local reference space for AR positioning
                    await session.requestReferenceSpace("bounded-floor");

                    // Enable alpha mode for transparent background (camera passthrough)
                    gl.setClearAlpha(0);

                    console.log(
                        "AR session established with camera passthrough"
                    );
                } catch (error) {
                    console.error("Failed to initialize AR session:", error);
                }
            })();
        }
    }, [session, gl]);

    // Sync hit test position with the CAD model only when placed
    useFrame(() => {
        if (modelRef.current && isModelPlaced && currentHitPosition) {
            modelRef.current.position.copy(currentHitPosition);
        }
    });

    // Render React components into the DOM overlay
    useEffect(() => {
        // Function to handle model placement
        const handlePlaceModel = () => {
            if (currentHitPosition) {
                hitTestPosition.current.copy(currentHitPosition);
                setIsModelPlaced(true);
            }
        };

        if (domOverlayRoot) {
            console.log("domOverlayRoot is available:", domOverlayRoot);
            const portalRoot = document.createElement("div");
            domOverlayRoot.appendChild(portalRoot);

            const root = ReactDOM.createRoot(portalRoot);

            // Wrap AROverlayContent with ModelConfigProvider to provide context
            root.render(
                <ModelConfigProvider>
                    <AROverlayContent
                        onPlaceModel={handlePlaceModel}
                        isModelPlaced={isModelPlaced}
                    />
                </ModelConfigProvider>
            );

            // Cleanup on unmount
            return () => {
                root.unmount();
                domOverlayRoot.removeChild(portalRoot);
            };
        }
    }, [domOverlayRoot, isModelPlaced, currentHitPosition]);

    return (
        <>
            {/* Hit test for positioning the model */}
            <XRHitTest
                onResults={(results, getWorldMatrix) => {
                    if (results.length > 0) {
                        // Get the world position from the hit test result
                        getWorldMatrix(matrixHelper.current, results[0]);
                        const position = new Vector3().setFromMatrixPosition(
                            matrixHelper.current
                        );

                        // Only update the current hit position for preview
                        if (!isModelPlaced) {
                            setCurrentHitPosition(position);
                        }
                    }
                }}
            />

            {/* Lighting setup */}
            <ambientLight intensity={1.5} color="#ffffff" />
            <directionalLight
                position={[5, 5, 5]}
                intensity={2}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />
            <Environment preset="sunset" />

            {/* Model with reference positioning */}
            <group ref={modelRef}>
                {/* Add a visual indicator for placement when not placed */}
                {!isModelPlaced && currentHitPosition && (
                    <mesh
                        position={[0, -0.01, 0]}
                        rotation={[-Math.PI / 2, 0, 0]}
                    >
                        <circleGeometry args={[0.15, 32]} />
                        <meshBasicMaterial
                            color="#4285F4"
                            opacity={0.5}
                            transparent
                        />
                    </mesh>
                )}
                <CADModel />
            </group>
        </>
    );
}
