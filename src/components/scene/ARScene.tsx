"use client";

import { Interactive, useXR } from "@react-three/xr";
import { useEffect, useState } from "react";
import CADModel from "./CADModel";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Group, Intersection } from "three";
import { useRef } from "react";

export default function ARScene() {
    const { session } = useXR();
    const [isPresenting, setIsPresenting] = useState(false);

    useEffect(() => {
        if (session) {
            setIsPresenting(session.visibilityState === "visible");
        }
    }, [session]);
    const [modelPlaced, setModelPlaced] = useState(false);
    const modelRef = useRef<Group>(null);
    const { gl } = useThree();

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

        // Clean up
        return () => {
            setModelPlaced(false);
        };
    }, [session, gl]);

    // Place model handler for AR
    const handleSelect = (event: { intersection: Intersection }) => {
        if (modelRef.current && !modelPlaced) {
            // Position the model at the hit point
            const hitPoint = event.intersection.point;
            modelRef.current.position.set(hitPoint.x, hitPoint.y, hitPoint.z);
            setModelPlaced(true);
        }
    };

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

            {/* Environment for non-AR mode */}
            {!isPresenting && (
                <Environment preset="sunset" background blur={0.5} />
            )}

            {/* Model placement in AR mode */}
            {isPresenting ? (
                <>
                    {/* AR placement surface */}
                    <Interactive onSelect={handleSelect}>
                        <mesh
                            rotation={[-Math.PI / 2, 0, 0]}
                            position={[0, 0, 0]}
                            visible={!modelPlaced}
                        >
                            <planeGeometry args={[100, 100]} />
                            <meshBasicMaterial
                                color="#fff"
                                opacity={0.2}
                                transparent
                                wireframe
                            />
                        </mesh>
                    </Interactive>

                    {/* Model with reference positioning */}
                    <group ref={modelRef}>
                        <CADModel url="/models/engine.glb" />
                    </group>
                </>
            ) : (
                <>
                    {/* Regular non-AR viewing */}
                    <CADModel url="/models/engine.glb" />
                    <OrbitControls
                        enablePan={true}
                        enableZoom={true}
                        enableRotate={true}
                        minDistance={1}
                        maxDistance={30}
                    />
                </>
            )}
        </>
    );
}
