"use client";

import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { ModelConfigProvider } from "@/context/ModelConfigContext";
import { useAR } from "@/context/ARContext";
import { TrackingProvider } from "@/context/TrackingContext";
import Regular3DScene from "./Regular3DScene";
import ARScene from "./ARScene";
import ModelControls from "./ui/ModelControls";
import OrbitControlsUI from "./ui/OrbitControlsUI";

export default function ARCanvas() {
    const { isARPresenting, containerRef } = useAR();
    const orbitControlsRef = useRef<OrbitControlsImpl | null>(null);

    return (
        <ModelConfigProvider>
            <div
                ref={containerRef}
                className="relative w-full h-[90vh] md:h-[80vh] mx-auto pt-14"
            >
                {isARPresenting ? (
                    <TrackingProvider>
                        <Suspense fallback={null}>
                            <ARScene />
                        </Suspense>
                    </TrackingProvider>
                ) : (
                    <Canvas
                        shadows
                        camera={{ position: [1, 1, 1], fov: 50 }}
                        className="w-full h-full"
                    >
                        <Suspense fallback={null}>
                            <Regular3DScene
                                orbitControlsRef={orbitControlsRef}
                            />
                        </Suspense>
                    </Canvas>
                )}

                {/* Controls Overlay for regular scene */}
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
