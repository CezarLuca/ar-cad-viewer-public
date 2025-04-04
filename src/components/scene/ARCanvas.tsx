"use client";

import { Canvas } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { Suspense, useEffect, useRef, useState } from "react";
import ARScene from "./ARScene";
import ModelControls from "./ui/ModelControls";
import OrbitControlsUI from "./ui/OrbitControlsUI";
import { ModelConfigProvider } from "@/context/ModelConfigContext";
import { PerspectiveCamera } from "three";
import Regular3DScene from "./Regular3DScene";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import ARQRScene from "./ARQRScene";

const store = createXRStore({
    domOverlay: true,
});

// Export the enterAR function so the AR page can use it
export const enterAR = () => {
    store.enterAR();
};

export default function ARCanvas() {
    const containerRef = useRef<HTMLDivElement>(null);
    const orbitControlsRef = useRef<OrbitControlsImpl | null>(null);
    const [isARPresenting, setIsARPresenting] = useState(false);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const [viewMode, setViewMode] = useState<"3d" | "qr">("3d");

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

    return (
        <ModelConfigProvider>
            {/* Canvas Container - Fixed responsive classes */}
            <div
                ref={containerRef}
                className="relative w-full h-[90vh] md:h-[80vh] mx-auto pt-14"
            >
                <Canvas
                    shadows
                    camera={{ position: [1, 1, 1], fov: 50 }}
                    className="w-full h-full"
                    gl={{
                        antialias: true,
                        powerPreference: "high-performance",
                        alpha: true,
                    }}
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
                    {/* Regular scene outside of XR context */}
                    {!isARPresenting && viewMode === "3d" && (
                        <Suspense fallback={null}>
                            <Regular3DScene
                                orbitControlsRef={orbitControlsRef}
                            />
                        </Suspense>
                    )}

                    {/* AR scene inside XR context */}
                    <XR store={store}>
                        <Suspense fallback={null}>
                            <ARScene setIsARPresenting={setIsARPresenting} />
                        </Suspense>
                    </XR>
                </Canvas>

                {/* AR QR scene for QR code detection */}
                {isARPresenting && viewMode === "qr" && (
                    <Suspense fallback={null}>
                        <ARQRScene />
                    </Suspense>
                )}

                {/* Controls overlay - MOVED OUTSIDE THE CANVAS */}
                {!isARPresenting && (
                    <>
                        {/* Mode selector buttons */}
                        <div className="absolute bottom-4 right-4 flex gap-2 z-50">
                            <button
                                className="cursor-pointer border border-gray-300 rounded px-4 py-2 bg-gray-500 text-gray-100 shadow-md shadow-gray-700 hover:bg-gray-600 hover:border-gray-500"
                                onClick={() => setViewMode("3d")}
                            >
                                3D View
                            </button>
                            <button
                                className="cursor-pointer border border-gray-300 rounded px-4 py-2 bg-gray-500 text-gray-100 shadow-md shadow-gray-700 hover:bg-gray-600 hover:border-gray-500"
                                onClick={() => setViewMode("qr")}
                            >
                                AR View
                            </button>
                        </div>
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
