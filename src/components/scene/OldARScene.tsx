"use client";

import { useXR } from "@react-three/xr";
import { useEffect } from "react";
import CADModel from "./CADModel";
import { Environment, OrbitControls } from "@react-three/drei";

export default function ARScene() {
    const { session } = useXR();

    // Basic camera feed initialization
    useEffect(() => {
        if (session) {
            (async () => {
                try {
                    await session.requestReferenceSpace("local");
                    // Camera feed is automatically handled by WebXR
                    import("@react-three/drei").then(({ useGLTF }) => {
                        useGLTF.preload("/models/engine.glb");
                    });
                } catch (error) {
                    console.error("Failed to request reference space:", error);
                }
            })();
        }
    }, [session]);

    return (
        <>
            {/* <pointLight position={[10, 10, 10]} intensity={1} /> */}
            <ambientLight intensity={1.5} color="#ffffff" />
            <directionalLight
                position={[5, 5, 5]}
                intensity={2}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />

            <Environment preset="sunset" background blur={0.5} />

            <CADModel url="/models/engine.glb" />

            <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={1}
                maxDistance={30}
            />
        </>
    );
}
