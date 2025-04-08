"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
    WebGLRenderer,
    WebGLRendererParameters,
    PerspectiveCamera,
} from "three";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import ARScene from "./ARScene";
import Regular3DScene from "./Regular3DScene";
import ModelControls from "./ui/ModelControls";
import OrbitControlsUI from "./ui/OrbitControlsUI";
import { ModelConfigProvider } from "@/context/ModelConfigContext";
import { useAR } from "@/context/ARContext";
// import "webxr-polyfill";

export default function ARCanvas() {
    const orbitControlsRef = useRef<OrbitControlsImpl | null>(null);
    const { isARPresenting, containerRef } = useAR(); // Use ARContext
    const canvasSize = {
        width: containerRef.current?.clientWidth || 0,
        height: containerRef.current?.clientHeight || 0,
    };

    // Create an XR-compatible renderer
    const createRenderer = async (props?: WebGLRendererParameters) => {
        const renderer = new WebGLRenderer({
            antialias: true, // Smooth edges
            powerPreference: "high-performance", // Prioritize performance
            alpha: true, // Transparency for AR use
            ...props, // Include other props passed from Canvas if needed
        });
        return renderer;
    };

    // Handle canvas resize
    useEffect(() => {
        const updateSize = () => {
            if (!containerRef.current) return;
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;
            containerRef.current.style.width = `${width}px`;
            containerRef.current.style.height = `${height}px`;
        };

        updateSize();

        window.addEventListener("resize", updateSize);

        return () => {
            window.removeEventListener("resize", updateSize);
        };
    }, [containerRef]);

    return (
        <ModelConfigProvider>
            {/* Canvas Container */}
            <div
                ref={containerRef}
                className="relative w-full h-[90vh] md:h-[80vh] mx-auto pt-14"
            >
                <Canvas
                    shadows
                    camera={{ position: [1, 1, 1], fov: 50 }}
                    className="w-full h-full"
                    gl={createRenderer}
                    onCreated={({ gl, camera }) => {
                        if (canvasSize.width && canvasSize.height) {
                            gl.setSize(canvasSize.width, canvasSize.height);

                            if (camera instanceof PerspectiveCamera) {
                                camera.aspect =
                                    canvasSize.width / canvasSize.height;
                                camera.updateProjectionMatrix();
                            }
                        }
                    }}
                >
                    {/* 3D Scene */}
                    {!isARPresenting && (
                        <Suspense fallback={null}>
                            <Regular3DScene
                                orbitControlsRef={orbitControlsRef}
                            />
                        </Suspense>
                    )}

                    {/* AR Scene */}
                    {isARPresenting && (
                        <Suspense fallback={null}>
                            <ARScene />
                        </Suspense>
                    )}
                </Canvas>

                {/* Controls Overlay */}
                {!isARPresenting && (
                    <>
                        <div className="absolute top-12 left-0 right-0 bottom-0 z-20 pointer-events-none">
                            <ModelControls />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
                            <OrbitControlsUI
                                orbitControlsRef={orbitControlsRef}
                            />
                        </div>
                    </>
                )}
            </div>
        </ModelConfigProvider>
    );
}
