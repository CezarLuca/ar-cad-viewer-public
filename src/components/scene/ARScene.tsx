"use client";

import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { Group, Matrix4, Vector3 } from "three";
import { useXR, XRHitTest, useXRAnchor, XRSpace } from "@react-three/xr";
import { useFrame } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import AROverlayContent from "./ui/AROverlayContent";
import { useModelUrl } from "@/context/ModelUrlContext";
import { ModelConfigProvider } from "@/context/ModelConfigContext";
import CADModel from "./CADModel";
// import qrTracker from "markers/frame.png";

// interface ARSceneProps {
//     setIsARPresenting: (isPresenting: boolean) => void;
// }

const engineModel = "/models/engine.glb";
useGLTF.preload(engineModel);

export default function ARScene() {
    const { modelUrl } = useModelUrl();
    const modelRef = useRef<Group>(null);
    // const { gl } = useThree();
    const { session, domOverlayRoot } = useXR();
    const matrixHelper = useRef(new Matrix4()); // Matrix helper for hit test position
    // const hitTestPosition = useRef(new Vector3());
    const hitTestResultRef = useRef<XRHitTestResult | null>(null);
    const [isModelPlaced, setIsModelPlaced] = useState(false);
    const [currentHitPosition, setCurrentHitPosition] =
        useState<Vector3 | null>(null);
    // useXRAnchor hook gives us the current anchor and a function to request one
    const [anchor, requestAnchor] = useXRAnchor();

    // If it's not the default model, preload it once when the component mounts
    useEffect(() => {
        if (modelUrl !== engineModel) {
            useGLTF.preload(modelUrl);
        }
    }, [modelUrl]);

    // If the model is already anchored and placed, sync the model position
    useFrame(() => {
        if (modelRef.current && isModelPlaced && currentHitPosition) {
            modelRef.current.position.copy(currentHitPosition);
        }
    });

    // Render React components into the DOM overlay
    useEffect(() => {
        const handlePlaceModel = async () => {
            console.log("Place model button clicked");
            // console.log("Current hit position:", currentHitPosition);
            if (hitTestResultRef.current && session) {
                // Request an anchor relative to the hit test result
                requestAnchor({
                    relativeTo: "hit-test-result",
                    hitTestResult: hitTestResultRef.current,
                });
                setIsModelPlaced(true);
                console.log(
                    "Anchor requested at hit test result: ",
                    currentHitPosition
                );
            } else if (!hitTestResultRef.current && session) {
                try {
                    // Await the XRReferenceSpace before passing it to requestAnchor
                    const referenceSpace = await session.requestReferenceSpace(
                        "local-floor"
                    );
                    requestAnchor({
                        relativeTo: "space",
                        space: referenceSpace,
                    });
                    setIsModelPlaced(true);
                    console.warn("No valid hit test available for anchoring");
                } catch (error) {
                    console.error("Failed to request reference space:", error);
                }
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
                        currentHitPosition={currentHitPosition}
                    />
                </ModelConfigProvider>
            );

            // Cleanup on unmount
            return () => {
                root.unmount();
                domOverlayRoot.removeChild(portalRoot);
            };
        }
    }, [
        domOverlayRoot,
        isModelPlaced,
        currentHitPosition,
        session,
        requestAnchor,
    ]);

    return (
        <>
            <XRHitTest
                onResults={(results, getWorldMatrix) => {
                    if (results.length > 0) {
                        // Save the hit test result for later anchoring
                        hitTestResultRef.current = results[0];
                        getWorldMatrix(matrixHelper.current, results[0]);
                        const position = new Vector3().setFromMatrixPosition(
                            matrixHelper.current
                        );
                        console.log("Hit test results:", results);
                        console.log("Hit position:", position);
                        if (!isModelPlaced) {
                            setCurrentHitPosition(position);
                        }
                    } else {
                        console.log("No hit test results found.");
                        hitTestResultRef.current = null;
                        setCurrentHitPosition(null);
                    }
                }}
            />

            <ambientLight intensity={1.5} color="#ffffff" />
            <directionalLight
                position={[5, 5, 5]}
                intensity={2}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />
            <Environment preset="sunset" />

            {/* If anchor exists, wrap the model group in XRSpace */}
            {anchor ? (
                <XRSpace space={anchor.anchorSpace}>
                    <group ref={modelRef}>
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
                </XRSpace>
            ) : (
                <group ref={modelRef}>
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
            )}
        </>
    );
}
