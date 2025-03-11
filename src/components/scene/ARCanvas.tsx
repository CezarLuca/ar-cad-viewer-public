"use client";

import { Canvas } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { Suspense, useEffect, useRef, useState } from "react";
import ARScene from "./ARScene";
import ModelControls from "./ui/ModelControls";
import { ModelConfigProvider } from "@/context/ModelConfigContext";
import * as THREE from "three";

const store = createXRStore();

export default function ARCanvas() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [modelPlaced, setModelPlaced] = useState(false);
    const [isARPresenting, setIsARPresenting] = useState(false);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    // Handle canvas resize
    useEffect(() => {
        const updateSize = () => {
            if (!containerRef.current) return;
            setCanvasSize({
                width: containerRef.current.clientWidth,
                height: containerRef.current.clientHeight,
            });
        };

        // Initial size
        updateSize();

        // Update on resize
        window.addEventListener("resize", updateSize);

        // Create an observer for element size changes
        const resizeObserver = new ResizeObserver(updateSize);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            window.removeEventListener("resize", updateSize);
            resizeObserver.disconnect();
        };
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
            <div className="fixed top-11 right-14 z-20">
                <button
                    onClick={enterAR}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    {modelPlaced && isARPresenting
                        ? "Adjust Model"
                        : "Enter AR"}
                </button>
            </div>

            {/* Canvas Container - Fixed responsive classes */}
            <div
                ref={containerRef}
                className="relative w-full h-[80vh] md:w-[95vw] mx-auto pt-8 z-10"
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
                        if (canvasSize.width && canvasSize.height) {
                            gl.setSize(canvasSize.width, canvasSize.height);

                            if (camera instanceof THREE.PerspectiveCamera) {
                                camera.aspect =
                                    canvasSize.width / canvasSize.height;
                                camera.updateProjectionMatrix();
                            }
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
                    <div className="absolute top-8 left-0 right-0 bottom-0 z-30 pointer-events-none">
                        <ModelControls />
                    </div>
                )}
            </div>
        </ModelConfigProvider>
    );
}
