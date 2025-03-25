"use client";

import { useEffect, useRef } from "react";
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

const AROverlayContent = () => {
    return (
        <div className="absolute top-12 left-0 right-0 bottom-0 z-20 pointer-events-none">
            <ModelControls />
        </div>
    );
};

export default function ARScene({ setIsARPresenting }: ARSceneProps) {
    const { modelUrl } = useModelUrl();
    const modelRef = useRef<Group>(null);
    const { gl } = useThree();
    const { session, domOverlayRoot } = useXR();

    // Matrix helper for hit test position
    const matrixHelper = useRef(new Matrix4());
    const hitTestPosition = useRef(new Vector3());

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

    // Sync hit test position with the CAD model
    useFrame(() => {
        if (modelRef.current) {
            modelRef.current.position.copy(hitTestPosition.current);
        }
    });

    // Render React components into the DOM overlay
    useEffect(() => {
        if (domOverlayRoot) {
            console.log("domOverlayRoot is available:", domOverlayRoot);
            const portalRoot = document.createElement("div");
            domOverlayRoot.appendChild(portalRoot);

            const root = ReactDOM.createRoot(portalRoot);

            // Wrap AROverlayContent with ModelConfigProvider to provide context
            root.render(
                <ModelConfigProvider>
                    <AROverlayContent />
                </ModelConfigProvider>
            );

            // Cleanup on unmount
            return () => {
                root.unmount();
                domOverlayRoot.removeChild(portalRoot);
            };
        }
    }, [domOverlayRoot]);

    return (
        <>
            {/* Hit test for positioning the model */}
            <XRHitTest
                onResults={(results, getWorldMatrix) => {
                    if (results.length > 0) {
                        // Get the world position from the hit test result
                        getWorldMatrix(matrixHelper.current, results[0]);
                        hitTestPosition.current.setFromMatrixPosition(
                            matrixHelper.current
                        );
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
                <CADModel />
            </group>
        </>
    );
}
