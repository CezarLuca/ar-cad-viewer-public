import { useRef, useEffect, useCallback } from "react";
import { WebGLRenderer, Scene, PerspectiveCamera, Quaternion } from "three";
import { useModelConfig } from "@/context/ModelConfigContext";
import { useTracking } from "@/context/TrackingContext";
import { useAR } from "@/context/ARContext";

// Then update the parameter types:
export const useARSession = ({
    rendererRef,
    sceneRef,
    cameraRef,
    containerRef,
    imgBitmap,
}: {
    rendererRef: React.RefObject<WebGLRenderer | null>;
    sceneRef: React.RefObject<Scene | null>;
    cameraRef: React.RefObject<PerspectiveCamera | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;
    imgBitmap: ImageBitmap | null;
}) => {
    // Get model config context
    const { config } = useModelConfig();
    const { updateTracking } = useTracking();
    const { setIsARPresenting } = useAR();

    // Internal mutable references
    const xrRefSpaceRef = useRef<XRReferenceSpace | null>(null);
    const currentSessionRef = useRef<XRSession | null>(null);

    // Store the initial configuration when AR starts
    const initialConfigRef = useRef<{
        position: [number, number, number];
        rotation: [number, number, number];
        scale: [number, number, number];
    } | null>(null);

    // Reload Function
    const handleARSessionEnd = useCallback(() => {
        console.log("AR session ended, reloading page...");

        // First reset the AR state in React context
        setIsARPresenting(false);

        // Reset tracking data
        updateTracking({
            position: [0, 0, 0],
            quaternion: new Quaternion(),
            isTracking: false,
        });

        // Small delay to ensure React has time to update state
        setTimeout(() => {
            // Reload the page with the same URL parameters
            window.location.reload();
        }, 500);
    }, [setIsARPresenting, updateTracking]);

    const cleanupSession = () => {
        initialConfigRef.current = null;

        try {
            const session = currentSessionRef.current;

            if (session) {
                try {
                    session.removeEventListener("end", onSessionEnded);
                } catch (e) {
                    console.warn(
                        "Could not remove event listener from session:",
                        e
                    );
                }
            }

            if (rendererRef.current && rendererRef.current.xr) {
                try {
                    rendererRef.current.xr.setSession(null);
                } catch (e) {
                    console.warn(
                        "Could not set XR session to null on renderer:",
                        e
                    );
                }
            }

            currentSessionRef.current = null;
            xrRefSpaceRef.current = null;
            console.log("AR Session Cleanup Complete");
        } catch (error) {
            console.warn("Error during AR session cleanup:", error);
        }
    };

    const getXRSessionInit = (
        mode: string,
        options: {
            referenceSpaceType?: XRReferenceSpaceType;
            sessionInit?: XRSessionInit;
        }
    ): XRSessionInit => {
        if (options.referenceSpaceType && rendererRef.current) {
            rendererRef.current.xr.setReferenceSpaceType(
                options.referenceSpaceType
            );
        }
        const space = options.referenceSpaceType || "local-floor";
        const sessionInit = options.sessionInit || {};
        if (space === "viewer") return sessionInit;
        if (space === "local" && mode.startsWith("immersive"))
            return sessionInit;
        if (
            (sessionInit.optionalFeatures &&
                sessionInit.optionalFeatures.includes(space)) ||
            (sessionInit.requiredFeatures &&
                sessionInit.requiredFeatures.includes(space))
        ) {
            return sessionInit;
        }
        const newInit = { ...sessionInit, requiredFeatures: [space] };
        if (sessionInit.requiredFeatures) {
            newInit.requiredFeatures = newInit.requiredFeatures.concat(
                sessionInit.requiredFeatures as (
                    | "local"
                    | "local-floor"
                    | "bounded-floor"
                    | "unbounded"
                )[]
            );
        }
        return newInit;
    };

    const onXRFrame = (time: number, frame: XRFrame) => {
        const session = frame.session;
        if (!session) return;

        session.requestAnimationFrame(onXRFrame);

        if (!xrRefSpaceRef.current) return;

        if (rendererRef.current && sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
        }

        for (const result of frame.getImageTrackingResults()) {
            const poseResult = frame.getPose(
                result.imageSpace,
                xrRefSpaceRef.current
            );

            if (poseResult) {
                const { position, orientation } = poseResult.transform;

                // Store tracking data in TrackingContext
                updateTracking({
                    // Convert from XRRigidTransform to our tracking format
                    position: [position.x, position.y, position.z],
                    quaternion: new Quaternion(
                        orientation.x,
                        orientation.y,
                        orientation.z,
                        orientation.w
                    ),
                    isTracking: true,
                });

                // No direct model manipulation here!
                // TrackedObject component will handle this
            }
        }
    };

    const onSessionEnded = () => {
        cleanupSession();
        handleARSessionEnd();
    };

    // Listen for XR session end events at the window level
    useEffect(() => {
        // This helps catch system-initiated session terminations like the Android gesture
        const handleVisibilityChange = () => {
            if (
                document.visibilityState === "hidden" &&
                currentSessionRef.current
            ) {
                // The user has likely switched away from the app or used a gesture to exit AR
                handleARSessionEnd();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, [handleARSessionEnd]);

    const startAR = () => {
        return new Promise<void>((resolve, reject) => {
            if (currentSessionRef.current) {
                cleanupSession();
                resolve();
                return;
            }

            // Check resources
            if (
                !rendererRef.current ||
                !sceneRef.current ||
                !cameraRef.current
            ) {
                console.error("3D resources not ready");
                reject(new Error("3D resources not ready"));
                return;
            }

            // Store the current config as the initial offset
            initialConfigRef.current = {
                position: [...config.position] as [number, number, number],
                rotation: [...config.rotation] as [number, number, number],
                scale: [...config.scale] as [number, number, number],
            };

            // Reset tracking state
            updateTracking({
                position: [0, 0, 0],
                quaternion: new Quaternion(),
                isTracking: false,
            });

            // Wait briefly to ensure any previous rendering is complete
            setTimeout(() => {
                if (!imgBitmap) {
                    alert("Tracking image is not ready. Please wait.");
                    reject(new Error("Tracking image is not ready"));
                    return;
                }

                console.log(
                    "Starting AR with initial config:",
                    initialConfigRef.current
                );

                const options: XRSessionInit = {
                    requiredFeatures: ["dom-overlay", "image-tracking"],
                    trackedImages: [
                        {
                            image: imgBitmap,
                            widthInMeters: 0.01,
                        },
                    ],
                    domOverlay: { root: containerRef.current || document.body },
                };

                const sessionInit = getXRSessionInit("immersive-ar", {
                    referenceSpaceType: "local",
                    sessionInit: options,
                });

                if (navigator.xr) {
                    navigator.xr
                        .requestSession("immersive-ar", sessionInit)
                        .then((session) => {
                            currentSessionRef.current = session;
                            session.addEventListener("end", onSessionEnded);
                            rendererRef.current!.xr.setSession(session);
                            session
                                .requestReferenceSpace("local")
                                .then((refSpace) => {
                                    xrRefSpaceRef.current = refSpace;
                                    session.requestAnimationFrame(onXRFrame);
                                    resolve();
                                })
                                .catch(reject);
                        })
                        .catch((error) => {
                            console.error("Failed to start AR session:", error);
                            alert("Failed to start AR session.");
                            reject(error);
                        });
                } else {
                    alert("WebXR is not supported on this device/browser.");
                    reject(new Error("WebXR not supported"));
                }
            }, 500);
        });
    };
    return { startAR, currentSessionRef };
};
