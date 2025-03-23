"use client";

import { useXR } from "@react-three/xr";
import { useEffect, useState } from "react";
import CADModel from "./CADModel";
import { Environment, useGLTF, Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Group } from "three";
import { useRef } from "react";
import { useModelUrl } from "@/context/ModelUrlContext";

interface ARSceneProps {
    setIsARPresenting: (isPresenting: boolean) => void;
}

const engineModel = "/models/engine.glb";
useGLTF.preload(engineModel);

export default function ARScene({ setIsARPresenting }: ARSceneProps) {
    const { modelUrl } = useModelUrl();
    const modelRef = useRef<Group>(null);
    const { gl } = useThree();
    const { session } = useXR();
    const [viewportDimensions, setViewportDimensions] = useState({
        width: 0,
        height: 0,
    });

    // If it's not the default model, preload it once when the component mounts
    useEffect(() => {
        if (modelUrl !== engineModel) {
            useGLTF.preload(modelUrl);
        }
    }, [modelUrl]);

    // Update parent about AR session status and update viewport dimensions
    useEffect(() => {
        if (session) {
            // Calculate dimensions (e.g., 80% of screen width/height)
            const width = window.innerWidth * 0.8;
            const height = window.innerHeight * 0.8;
            setViewportDimensions({ width, height });
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

            {/* Viewport overlay - added to create a "window" effect */}
            {session && (
                <Html fullscreen>
                    <div
                        className="fixed inset-0 pointer-events-none"
                        style={{
                            boxShadow: "0 0 0 100vmax rgba(0, 0, 0, 0.8)",
                            width: `${viewportDimensions.width}px`,
                            height: `${viewportDimensions.height}px`,
                            left: `${
                                (window.innerWidth - viewportDimensions.width) /
                                2
                            }px`,
                            top: `${
                                (window.innerHeight -
                                    viewportDimensions.height) /
                                2
                            }px`,
                        }}
                    />
                </Html>
            )}
        </>
    );
}
