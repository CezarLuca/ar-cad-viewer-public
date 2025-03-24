"use client";

import ReactDOM from "react-dom/client";
import { Environment, useGLTF } from "@react-three/drei";
import { Group } from "three";
import { useXR } from "@react-three/xr";
import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { useRef } from "react";
import { useModelUrl } from "@/context/ModelUrlContext";
import CADModel from "./CADModel";

interface ARSceneProps {
    setIsARPresenting: (isPresenting: boolean) => void;
}

const engineModel = "/models/engine.glb";
useGLTF.preload(engineModel);

const AROverlayContent = () => {
    const [textColorRed, setTextColorRed] = useState(false);

    return (
        <div className="absolute top-4 left-4 p-4 bg-white bg-opacity-40 pointer-events-auto z-50">
            <p>AR Mode Active</p>
            <button
                onClick={() => setTextColorRed(!textColorRed)}
                className={textColorRed ? "text-red-500" : "text-green-500"}
            >
                Change my color
            </button>
        </div>
    );
};

export default function ARScene({ setIsARPresenting }: ARSceneProps) {
    const { modelUrl } = useModelUrl();
    const modelRef = useRef<Group>(null);
    const { gl } = useThree();
    const { session, domOverlayRoot } = useXR();

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
                    await session.requestReferenceSpace("local");

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

    // Render React components into the DOM overlay
    useEffect(() => {
        if (domOverlayRoot) {
            console.log("domOverlayRoot is available:", domOverlayRoot);
            const portalRoot = document.createElement("div");
            domOverlayRoot.appendChild(portalRoot);

            const root = ReactDOM.createRoot(portalRoot);
            root.render(<AROverlayContent />);

            // Cleanup on unmount
            return () => {
                root.unmount();
                domOverlayRoot.removeChild(portalRoot);
            };
        }
    }, [domOverlayRoot]);

    return (
        <>
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
