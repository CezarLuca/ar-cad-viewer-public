"use client";
import { useEffect, useRef, useState } from "react";
import { useARThreeScene } from "@/hooks/useARTreeScene";
import { useARSession } from "@/hooks/useARSession";
import ARButton from "./ui/ARButton";

const ARScene: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const [imgBitmap, setImgBitmap] = useState<ImageBitmap | null>(null);

    // Initialize Three.js scene
    const { rendererRef, sceneRef, cameraRef, earthCubeRef } =
        useARThreeScene(containerRef);

    // Setup AR session hook
    const { startAR, currentSessionRef } = useARSession({
        rendererRef,
        sceneRef,
        cameraRef,
        earthCubeRef,
        containerRef,
        imgBitmap,
    });

    // Manage image loading
    useEffect(() => {
        if (!imgRef.current) return;
        const imgEl = imgRef.current;
        const handleLoad = () => {
            createImageBitmap(imgEl)
                .then((bitmap) => setImgBitmap(bitmap))
                .catch((err) =>
                    console.error("Error creating ImageBitmap:", err)
                );
        };
        if (imgEl.complete && imgEl.naturalHeight !== 0) {
            handleLoad();
        } else {
            imgEl.addEventListener("load", handleLoad);
        }
        return () => imgEl.removeEventListener("load", handleLoad);
    }, []);

    return (
        <div className="relative h-full w-full bg-black">
            <img
                id="bitmap"
                ref={imgRef}
                src="/markers/Lego-Part.png"
                alt="tracking"
                className="hidden"
                crossOrigin="anonymous"
            />
            <div ref={containerRef} className="absolute inset-0" />
            <ARButton
                onClick={startAR}
                currentSession={currentSessionRef.current}
            />
        </div>
    );
};

export default ARScene;
