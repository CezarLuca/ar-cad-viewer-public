"use client";

import { Canvas } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { Suspense, useEffect, useRef, useState } from "react";
import ARScene from "./ARScene";
import ModelControls from "./ui/ModelControls";
import ARControls from "./ui/ARControls";
import { ModelConfigProvider } from "@/context/ModelConfigContext";

const store = createXRStore();

export default function ARCanvas() {
    const containerRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
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

    // AR session configuration with DOM Overlay
    const enterAR = async () => {
        // Check if the browser supports DOM Overlay
        if (navigator.xr && "domOverlayState" in XRSession.prototype) {
            // Configure XR with DOM overlay
            store.enterAR();
        } else {
            // Fallback for browsers without DOM Overlay support
            store.enterAR();
            console.warn("DOM Overlay not supported in this browser");
        }
    };

    return (
        <ModelConfigProvider>
            {/* AR Button for entering AR mode */}
            <div className="fixed top-4 right-4 z-10">
                <button
                    onClick={enterAR}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Enter AR
                </button>
            </div>

            {/* Canvas Container */}
            <div
                ref={containerRef}
                className="relative w-full max-w-6xl mx-auto"
                style={{
                    aspectRatio: "2 / 1",
                    height: "auto !important",
                }}
            >
                <Canvas
                    shadows
                    camera={{ position: [0.5, 0.5, 0.5], fov: 50 }}
                    className="relative top-1 left-1 right-1 w-full h-full"
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

                {/* DOM Overlay container - IMPORTANT part for AR UI */}
                <div
                    ref={overlayRef}
                    className="ar-overlay"
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        pointerEvents: "none", // Only allow interaction with buttons
                    }}
                >
                    <ARControls
                        modelPlaced={modelPlaced}
                        isPresenting={isARPresenting}
                    />
                </div>
            </div>

            {/* Controls container for non-AR mode */}
            {!isARPresenting && (
                <div className="top-1 left-1 w-full h-full pointer-events-auto">
                    <ModelControls />
                </div>
            )}
        </ModelConfigProvider>
    );
}
