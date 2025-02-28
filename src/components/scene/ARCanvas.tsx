"use client";

import { Canvas } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { Suspense, useEffect, useRef } from "react";
import ARScene from "./ARScene";
import ModelControls from "./ui/ModelControls";
import { ModelConfigProvider } from "@/context/ModelConfigContext";

const store = createXRStore();

export default function ARCanvas() {
    const containerRef = useRef<HTMLDivElement>(null);

    // Handle canvas resize
    useEffect(() => {
        const handleResize = () => {
            if (!containerRef.current) return;
            // const { width, height } =
            //     containerRef.current.getBoundingClientRect();

            // // Update camera aspect ratio if needed
            // // This will be handled automatically by r3f in most cases
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <ModelConfigProvider>
            {/* Canvas Container */}
            <div
                ref={containerRef}
                className="relative w-full max-w-6xl mx-auto"
                style={{
                    aspectRatio: "2 / 1",
                    height: "auto !important", // Override any inline styles
                }}
            >
                <Canvas
                    shadows
                    camera={{ position: [3, 3, 3], fov: 50 }}
                    className="relative top-1 left-1 right-1 w-full h-full"
                    gl={{
                        antialias: true,
                        powerPreference: "high-performance",
                    }}
                    onCreated={({ gl, camera }) => {
                        // Force initial size calculation
                        gl.setSize(
                            containerRef.current?.clientWidth || 0,
                            containerRef.current?.clientHeight || 0
                        );

                        // Optional: Add resize observer
                        const observer = new ResizeObserver(() => {
                            gl.setSize(
                                containerRef.current?.clientWidth || 0,
                                containerRef.current?.clientHeight || 0
                            );
                            camera.updateProjectionMatrix();
                        });

                        if (containerRef.current) {
                            observer.observe(containerRef.current);
                        }
                    }}
                >
                    <XR store={store}>
                        <Suspense fallback={null}>
                            <ARScene />
                        </Suspense>
                    </XR>
                </Canvas>
            </div>
            {/* Controls container - overlay on top */}
            <div className="top-1 left-1 w-full h-full pointer-events-auto">
                <ModelControls />
            </div>
        </ModelConfigProvider>
    );
}
