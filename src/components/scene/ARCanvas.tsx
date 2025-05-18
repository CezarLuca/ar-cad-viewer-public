"use client";

import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { ModelConfigProvider } from "@/context/ModelConfigContext";
import { useAR } from "@/context/ARContext";
import { TrackingProvider } from "@/context/TrackingContext";
import { useScreenshot } from "@/context/ScreenshotContext";
import Regular3DScene from "./Regular3DScene";
import ARScene from "./ARScene";
import ModelControls from "./ui/ModelControls";
import OrbitControlsUI from "./ui/OrbitControlsUI";
import ScreenshotButton from "./ui/ScreenshotButton";
import ScreenshotOverlay from "./ui/ScreenshotOverlay";

export default function ARCanvas() {
    const { isARPresenting, containerRef } = useAR();
    const orbitControlsRef = useRef<OrbitControlsImpl | null>(null);
    const canvasWrapperRef = useRef<HTMLDivElement | null>(null);
    const { setScreenshot, isFraming, setIsFraming, frameSize } =
        useScreenshot();

    const handleScreenshot = () => {
        if (!canvasWrapperRef.current) return;
        const canvas = canvasWrapperRef.current.querySelector(
            "canvas"
        ) as HTMLCanvasElement;
        if (!canvas) return;

        // Calculate the cropping rectangle (centered)
        const canvasRect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / canvasRect.width;
        const cropSize = frameSize * scaleX;

        const cropX = (canvas.width - cropSize) / 2;
        const cropY = (canvas.height - cropSize) / 2;

        // Create a temporary canvas to draw the cropped area
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = cropSize;
        tempCanvas.height = cropSize;
        const ctx = tempCanvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(
            canvas,
            cropX,
            cropY,
            cropSize,
            cropSize,
            0,
            0,
            cropSize,
            cropSize
        );

        setScreenshot(tempCanvas.toDataURL("image/png"));
        // setIsFraming(false);
    };

    // Start framing mode
    const startScreenshot = () => setIsFraming(true);

    return (
        <ModelConfigProvider>
            <div
                ref={containerRef}
                className="relative mx-0 w-full h-auto mt-14"
            >
                {isARPresenting ? (
                    <TrackingProvider>
                        <Suspense fallback={null}>
                            <ARScene />
                        </Suspense>
                    </TrackingProvider>
                ) : (
                    <div
                        ref={canvasWrapperRef}
                        className="relative w-full h-full"
                    >
                        <Canvas
                            shadows
                            camera={{ position: [1, 1, 1], fov: 50 }}
                            className="w-full h-full"
                            gl={{ preserveDrawingBuffer: true }}
                        >
                            <Suspense fallback={null}>
                                <Regular3DScene
                                    orbitControlsRef={orbitControlsRef}
                                />
                            </Suspense>
                        </Canvas>
                        {/* Screenshot Button triggers framing mode */}
                        {!isFraming && (
                            <ScreenshotButton
                                startScreenshot={startScreenshot}
                            />
                        )}
                        {/* Framing Overlay */}
                        {isFraming && (
                            <ScreenshotOverlay
                                onCapture={handleScreenshot}
                                onCancel={() => setIsFraming(false)}
                            />
                        )}
                    </div>
                )}

                {/* Controls Overlay for regular scene */}
                {!isARPresenting && !isFraming && (
                    <>
                        <div className="absolute top-0 left-0 right-0 bottom-0 z-20 pointer-events-none">
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
