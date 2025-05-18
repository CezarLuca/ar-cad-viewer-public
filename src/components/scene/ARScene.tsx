/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { useARThreeScene } from "@/hooks/useARTreeScene";
import { useARSession } from "@/hooks/useARSession";
import { useModelUrl } from "@/context/ModelUrlContext";
import { ModelConfigProvider } from "@/context/ModelConfigContext";
import { useTracking } from "@/context/TrackingContext";
import AROverlayContent from "./ui/AROverlayContent";
import { TrackedObject } from "./TrackedObject";

const ARScene: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const portalRootRef = useRef<HTMLDivElement>(null);
    const rootRef = useRef<ReactDOM.Root | null>(null);
    const [imgBitmap, setImgBitmap] = useState<ImageBitmap | null>(null);
    const [isARActive, setIsARActive] = useState(false);
    const { modelUrl } = useModelUrl();
    const { tracking } = useTracking();

    // Initialize Three.js scene with our model URL
    const { rendererRef, sceneRef, cameraRef, cubeRef, loadError } =
        useARThreeScene(containerRef, modelUrl);

    // Setup AR session hook
    const { startAR, currentSessionRef } = useARSession({
        rendererRef,
        sceneRef,
        cameraRef,
        containerRef,
        imgBitmap,
    });

    useEffect(() => {
        if (!isARActive || !cubeRef.current) return;

        if (tracking.isTracking) {
            console.log("Tracking active, object being positioned");
        }
    }, [isARActive, cubeRef, tracking.isTracking]);

    // Display load error as an overlay if present
    useEffect(() => {
        if (loadError) {
            console.error("Model loading error:", loadError);
            // You could add UI feedback here, such as a toast or alert
            alert(`Failed to load 3D model: ${loadError}`);
        }
    }, [loadError]);

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

    // Only start AR if model loaded successfully and image is ready
    useEffect(() => {
        if (imgBitmap && !loadError && cubeRef.current) {
            startAR()
                .then(() => setIsARActive(true))
                .catch((err) =>
                    console.error("Error starting AR session:", err)
                );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imgBitmap, loadError, cubeRef]);

    // Cleanup AR session on unmount ("Exit AR")
    useEffect(() => {
        const session = currentSessionRef.current;
        return () => {
            if (session) {
                try {
                    session.end();
                } catch (error) {
                    console.warn("Error ending AR session:", error);
                    // Force page reload as fallback
                    window.location.reload();
                }
            }
        };
    }, [currentSessionRef]);

    // Render overlay content
    useEffect(() => {
        if (!isARActive || !containerRef.current) return;

        // Capture the current container value to use in cleanup
        const currentContainer = containerRef.current;

        // Only create the portal if it doesn't exist yet
        if (!portalRootRef.current) {
            const portalRoot = document.createElement("div");
            portalRoot.className = "absolute inset-0 z-30";
            currentContainer.appendChild(portalRoot);
            portalRootRef.current = portalRoot;

            // Store the root for later cleanup
            rootRef.current = ReactDOM.createRoot(portalRoot);

            // Render with ModelConfigProvider but NOT with initialConfig prop
            rootRef.current.render(
                <ModelConfigProvider>
                    <AROverlayContent />
                </ModelConfigProvider>
            );
        }

        // Cleanup only when component unmounts or AR becomes inactive
        return () => {
            if (rootRef.current) {
                rootRef.current.unmount();
                rootRef.current = null;
            }
            if (portalRootRef.current) {
                // Use the captured container value from above
                currentContainer.removeChild(portalRootRef.current);
                portalRootRef.current = null;
            }
        };
    }, [containerRef, isARActive]);

    return (
        <div className="relative h-full w-full bg-black">
            {isARActive && cubeRef.current && !loadError && (
                <TrackedObject object={cubeRef} />
            )}
            <img
                id="bitmap"
                ref={imgRef}
                src="/markers/tracker3.png"
                alt="tracking"
                className="hidden"
                crossOrigin="anonymous"
            />
            <div ref={containerRef} className="absolute inset-0" />
            {loadError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white p-4 z-50">
                    <div className="bg-red-900 p-6 rounded-lg max-w-md">
                        <h3 className="text-xl font-bold mb-2">
                            Model Loading Error
                        </h3>
                        <p>{loadError}</p>
                        <p className="mt-4">
                            Please try with a different model or check if the
                            file exists.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ARScene;
