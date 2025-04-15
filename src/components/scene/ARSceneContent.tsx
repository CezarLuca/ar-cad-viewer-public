"use client";
import React from "react";
// import { useThree } from "@react-three/fiber";
import CADModel from "./CADModel";
// import { useModelConfig } from "@/context/ModelConfigContext";

// This component handles adding the CAD model to the Three.js scene
const ARSceneContent: React.FC = () => {
    // const { scene } = useThree();
    // const { config } = useModelConfig();

    return (
        <>
            <CADModel />
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        </>
    );
};

export default ARSceneContent;
