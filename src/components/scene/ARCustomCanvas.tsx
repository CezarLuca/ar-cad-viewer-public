"use client";

import { Canvas } from "@react-three/fiber";
import {
    WebGLRenderer,
    WebGLRendererParameters,
    PerspectiveCamera,
} from "three";
import ARScene from "./ARScene";
import { Suspense } from "react";

const createXRRenderer = async (props?: WebGLRendererParameters) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2", { xrCompatible: true });
    if (!context) {
        throw new Error("Failed to create XR-compatible WebGL2 context");
    }
    const renderer = new WebGLRenderer({
        canvas,
        context,
        antialias: true,
        powerPreference: "high-performance",
        alpha: true,
        ...props,
    });
    renderer.xr.enabled = true;
    return renderer;
};

export default function ARCustomCanvas() {
    return (
        <Canvas
            shadows
            camera={{ position: [1, 1, 1], fov: 50 }}
            gl={createXRRenderer}
            className="w-full h-full"
            onCreated={({ camera }) => {
                if (camera instanceof PerspectiveCamera) {
                    camera.updateProjectionMatrix();
                }
            }}
        >
            <Suspense fallback={null}>
                <ARScene />
            </Suspense>
        </Canvas>
    );
}
