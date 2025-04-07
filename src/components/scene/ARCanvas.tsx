"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import ARScene from "./ARScene";
import ModelControls from "./ui/ModelControls";
import OrbitControlsUI from "./ui/OrbitControlsUI";
import { ModelConfigProvider } from "@/context/ModelConfigContext";
import { PerspectiveCamera } from "three";
import Regular3DScene from "./Regular3DScene";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export default function ARCanvas() {
    const containerRef = useRef<HTMLDivElement>(null);
    const orbitControlsRef = useRef<OrbitControlsImpl | null>(null);
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

        updateSize();

        window.addEventListener("resize", updateSize);

        const resizeObserver = new ResizeObserver(updateSize);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            window.removeEventListener("resize", updateSize);
            resizeObserver.disconnect();
        };
    }, []);

    // Handle AR session setup
    const enterAR = async () => {
        if (navigator.xr) {
            const isSupported = await navigator.xr.isSessionSupported(
                "immersive-ar"
            );
            if (isSupported) {
                const session = await navigator.xr.requestSession(
                    "immersive-ar",
                    {
                        requiredFeatures: ["local-floor", "dom-overlay"],
                        domOverlay: { root: containerRef.current! },
                    }
                );

                session.addEventListener("end", () => {
                    console.log("AR session ended.");
                    setIsARPresenting(false);
                });

                // Create WebXRLayer for rendering
                session.updateRenderState({
                    baseLayer: new XRWebGLLayer(
                        session,
                        document.createElement("canvas").getContext("webgl")!
                    ),
                });

                setIsARPresenting(true);
                console.log("AR session started!");
            } else {
                console.error("AR not supported on this device.");
            }
        }
    };

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
                            <ARScene setIsARPresenting={setIsARPresenting} />
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

            {/* AR Toggle Button */}
            <div className="absolute top-4 left-4 z-10">
                <button
                    onClick={enterAR}
                    className="px-4 py-2 bg-blue-500 text-white rounded shadow"
                >
                    {isARPresenting ? "Exit AR" : "Enter AR"}
                </button>
            </div>
        </ModelConfigProvider>
    );
}
