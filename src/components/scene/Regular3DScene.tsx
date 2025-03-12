"use client";

import { Environment, Grid, OrbitControls } from "@react-three/drei";
import CADModel from "./CADModel";

export default function Regular3DScene() {
    return (
        <>
            <CADModel url="/models/engine.glb" />

            {/* Environment lighting */}
            <Environment preset="sunset" background blur={0.5} />

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
            />

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
