"use client";

import { useXR } from "@react-three/xr";
import { useEffect } from "react";
import CADModel from "./CADModel";
import { Environment, useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Group } from "three";
import { useRef } from "react";

interface ARSceneProps {
    setIsARPresenting: (isPresenting: boolean) => void;
}

export default function ARScene({ setIsARPresenting }: ARSceneProps) {
    const modelRef = useRef<Group>(null);
    const { gl } = useThree();
    const { session } = useXR();

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

                    // Preload model
                    useGLTF.preload("/models/engine.glb");

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
                <CADModel url="/models/engine.glb" />
            </group>
        </>
    );
}
