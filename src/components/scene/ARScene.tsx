/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { useARThreeScene } from "@/hooks/useARTreeScene";
import { useARSession } from "@/hooks/useARSession";

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

    // Automatically start AR session when image is ready
    useEffect(() => {
        if (imgBitmap) {
            startAR();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imgBitmap]);

    // Cleanup AR session on unmount ("Exit AR")
    useEffect(() => {
        const session = currentSessionRef.current;
        return () => {
            if (session) {
                session.end();
            }
        };
    }, [currentSessionRef]);

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
        </div>
    );
};

export default ARScene;
