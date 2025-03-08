"use client";

import { Canvas } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { Suspense, useEffect, useRef, useState } from "react";
import ARScene from "./ARScene";
import ModelControls from "./ui/ModelControls";
import { ModelConfigProvider } from "@/context/ModelConfigContext";

const store = createXRStore();

export default function ARCanvas() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [modelPlaced, setModelPlaced] = useState(false);
    const [isARPresenting, setIsARPresenting] = useState(false);

    // Handle canvas resize
    useEffect(() => {
        const handleResize = () => {
            if (!containerRef.current) return;
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // AR session configuration - simplified
    const enterAR = () => {
        store.enterAR();
    };

    // Log model status for development feedback
    useEffect(() => {
        if (modelPlaced) {
            console.log("Model has been placed in AR scene");
        }
    }, [modelPlaced]);

    return (
        <ModelConfigProvider>
            {/* AR Button for entering AR mode */}
            <div className="fixed top-4 right-4 z-20">
                <button
                    onClick={enterAR}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    {modelPlaced && isARPresenting
                        ? "Adjust Model"
                        : "Enter AR"}
                </button>
            </div>

            {/* Canvas Container - Updated for full width and 4/5 height */}
            <div
                ref={containerRef}
                className="relative w-full h-[80vh] mx-auto z-10"
            >
                <Canvas
                    shadows
                    camera={{ position: [0.5, 0.5, 0.5], fov: 50 }}
                    className="w-full h-full"
                    gl={{
                        antialias: true,
                        powerPreference: "high-performance",
                        alpha: true,
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
                            <ARScene
                                setModelPlaced={setModelPlaced}
                                setIsARPresenting={setIsARPresenting}
                            />
                        </Suspense>
                    </XR>
                </Canvas>

                {/* Controls overlay */}
                {!isARPresenting && (
                    <div className="absolute top-0 left-0 right-0 bottom-0 z-30 pointer-events-none">
                        <ModelControls />
                    </div>
                )}
            </div>
        </ModelConfigProvider>
    );
}
