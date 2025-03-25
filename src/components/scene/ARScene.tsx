"use client";

import ReactDOM from "react-dom/client";
import { Environment, useGLTF } from "@react-three/drei";
import { Group } from "three";
import {
    useXR,
    useXRPlanes,
    useXRAnchor,
    XROrigin,
    XRSpace,
    XRPlaneModel,
} from "@react-three/xr";
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useRef } from "react";
import { useModelUrl } from "@/context/ModelUrlContext";
import CADModel from "./CADModel";
import ModelControls from "./ui/ModelControls";
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

const ErrorPopup = () => {
    return (
        <div className="absolute top-1/4 left-0 right-0 flex justify-center pointer-events-auto">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md shadow-lg max-w-xs">
                <div className="flex items-center mb-2">
                    <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <span className="font-bold">No Surface Detected</span>
                </div>
                <p>
                    Please scan your environment by moving your device around to
                    detect a surface for placing the 3D model.
                </p>
            </div>
        </div>
    );
};

export default function ARScene({ setIsARPresenting }: ARSceneProps) {
    const { modelUrl } = useModelUrl();
    const modelRef = useRef<Group>(null);
    const { gl } = useThree();
    const { session, domOverlayRoot } = useXR();
    const detectedPlanes = useXRPlanes("floor");
    const [anchor, requestAnchor] = useXRAnchor();

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

    // Handle plane detection for CAD model placement
    useEffect(() => {
        if (detectedPlanes.length > 0) {
            console.log("Detected planes:", detectedPlanes);
            const firstPlane = detectedPlanes[0];
            if (firstPlane.planeSpace) {
                // Request anchor relative to detected plane's space
                requestAnchor({
                    relativeTo: "space",
                    space: firstPlane.planeSpace,
                });
            } else {
                console.error("Plane does not have a valid planeSpace.");
            }
        }
    }, [detectedPlanes, requestAnchor]);

    // Render React components into the DOM overlay
    useEffect(() => {
        if (domOverlayRoot) {
            console.log("domOverlayRoot is available:", domOverlayRoot);
            const portalRoot = document.createElement("div");
            domOverlayRoot.appendChild(portalRoot);

            const root = ReactDOM.createRoot(portalRoot);

            // Wrap components with ModelConfigProvider to provide context
            root.render(
                <ModelConfigProvider>
                    {detectedPlanes.length > 0 ? (
                        <AROverlayContent />
                    ) : (
                        <>
                            <ErrorPopup />
                            <AROverlayContent />
                        </>
                    )}
                </ModelConfigProvider>
            );
            // Cleanup on unmount
            return () => {
                root.unmount();
                domOverlayRoot.removeChild(portalRoot);
            };
        }
    }, [domOverlayRoot, detectedPlanes.length]);

    return (
        <>
            {/* Define XR Origin */}
            <XROrigin scale={1} position={[0, 0, 0]}>
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

                {/* Model with reference positioning and anchor attachment */}
                {anchor && (
                    <group ref={modelRef}>
                        <CADModel />
                    </group>
                )}
            </XROrigin>

            {/* Render detected planes */}
            {detectedPlanes.map((plane) => (
                <XRSpace
                    space={plane.planeSpace}
                    key={detectedPlanes.indexOf(plane)}
                >
                    <XRPlaneModel plane={plane}>
                        <meshBasicMaterial color="red" />
                    </XRPlaneModel>
                </XRSpace>
            ))}

            {/* CAD Model placement (optional: attach to first detected plane) */}
            {detectedPlanes[0]?.planeSpace && (
                <XRSpace space={detectedPlanes[0].planeSpace}>
                    <group ref={modelRef}>
                        <CADModel />
                    </group>
                </XRSpace>
            )}
        </>
    );
}
