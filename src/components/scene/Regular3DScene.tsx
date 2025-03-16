"use client";

import { Environment, Grid, OrbitControls } from "@react-three/drei";
import { useRef, useEffect, RefObject } from "react";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import CADModel from "./CADModel";

interface Regular3DSceneProps {
    orbitControlsRef?: RefObject<OrbitControlsImpl | null>;
}

export default function Regular3DScene({
    orbitControlsRef,
}: Regular3DSceneProps) {
    const localControlsRef = useRef<OrbitControlsImpl | null>(null);

    // If an external ref is provided, sync it with our local ref
    useEffect(() => {
        if (orbitControlsRef && localControlsRef.current) {
            // Use type assertion to handle the readonly constraint of RefObject
            (
                orbitControlsRef as { current: OrbitControlsImpl | null }
            ).current = localControlsRef.current;
        }
    }, [orbitControlsRef]); // Removed localControlsRef.current from dependencies

    return (
        <>
            <CADModel />

            {/* Environment lighting */}
            <Environment preset="sunset" background blur={0.4} />
            <ambientLight intensity={0.2} color="#ffffff" />
            <directionalLight position={[5, 5, 5]} intensity={1} />

            {/* XYZ Axis helper - red=X, green=Y, blue=Z */}
            <axesHelper args={[5]} />

            {/* Reference grid */}
            <Grid
                position={[0, 0, 0]}
                args={[10, 10]}
                cellSize={0.1}
                cellThickness={1}
                cellColor="#6f6f6f"
                sectionSize={0.5}
                sectionThickness={1.2}
                sectionColor="#a59595"
                fadeDistance={30}
                fadeStrength={1.5}
                side={THREE.DoubleSide}
            />

            {/* Orbit controls for camera */}
            <OrbitControls
                ref={localControlsRef}
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={0.1}
                maxDistance={30}
                makeDefault
            />
        </>
    );
}
