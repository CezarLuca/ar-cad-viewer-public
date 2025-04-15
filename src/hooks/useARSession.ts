import { useRef } from "react";
import {
    WebGLRenderer,
    Scene,
    PerspectiveCamera,
    Euler,
    Quaternion,
} from "three";
import { useModelConfig } from "@/context/ModelConfigContext";

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
    const { updateConfig } = useModelConfig();

    // Internal mutable references.
    const xrRefSpaceRef = useRef<XRReferenceSpace | null>(null);
    const currentSessionRef = useRef<XRSession | null>(null);

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

                // Update position through ModelConfigContext
                updateConfig({
                    position: [position.x, position.y, position.z],
                });

                // Convert quaternion to Euler angles for rotation
                const quaternion = new Quaternion(
                    orientation.x,
                    orientation.y,
                    orientation.z,
                    orientation.w
                );
                const euler = new Euler().setFromQuaternion(quaternion);

                // Update rotation through ModelConfigContext
                updateConfig({
                    rotation: [euler.x, euler.y, euler.z],
                });
            }
        }
    };

    const onSessionEnded = () => {
        if (currentSessionRef.current) {
            currentSessionRef.current.removeEventListener(
                "end",
                onSessionEnded
            );
        }
        if (rendererRef.current) {
            rendererRef.current.xr.setSession(null);
        }
        currentSessionRef.current = null;
        xrRefSpaceRef.current = null;
    };

    const startAR = () => {
        if (currentSessionRef.current) {
            currentSessionRef.current.end();
            return;
        }
        if (!imgBitmap) {
            alert("Tracking image is not ready. Please wait.");
            return;
        }
        const options: XRSessionInit = {
            requiredFeatures: ["dom-overlay", "image-tracking"],
            trackedImages: [
                {
                    image: imgBitmap,
                    widthInMeters: 0.2,
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
                    if (rendererRef.current) {
                        rendererRef.current.xr.setSession(session);
                    }
                    session.requestReferenceSpace("local").then((refSpace) => {
                        xrRefSpaceRef.current = refSpace;
                        session.requestAnimationFrame(onXRFrame);
                    });
                })
                .catch((error) => {
                    console.error("Failed to start AR session:", error);
                    alert("Failed to start AR session.");
                });
        } else {
            alert("WebXR is not supported on this device/browser.");
        }
    };

    return { startAR, currentSessionRef };
};
