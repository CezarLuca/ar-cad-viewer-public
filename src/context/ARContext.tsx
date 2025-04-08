"use client";

import React, { createContext, useContext, useState, useRef } from "react";

interface XRSessionInitExtended extends XRSessionInit {
    trackedImages?: {
        image: Promise<ImageBitmap>;
        widthInMeters: number;
    }[];
}

interface ARContextValue {
    isARPresenting: boolean;
    containerRef: React.RefObject<HTMLDivElement | null>;
    enterAR: () => Promise<void>;
    exitAR: () => void;
}

const ARContext = createContext<ARContextValue>({
    isARPresenting: false,
    containerRef: { current: null },
    enterAR: async () => {},
    exitAR: () => {},
});

const image = new Image();
image.src = "/markers/qrTracker.png";
await image.decode();
const imageBitmapPromise = createImageBitmap(image);
imageBitmapPromise
    .then((bitmap) => {
        console.log("Image bitmap created:", bitmap);
    })
    .catch((error) => {
        console.error("Error creating image bitmap:", error);
    });

export const ARProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [isARPresenting, setIsARPresenting] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const enterAR = async () => {
        if (navigator.xr && containerRef.current) {
            const isSupported = await navigator.xr.isSessionSupported(
                "immersive-ar"
            );
            if (isSupported) {
                try {
                    const session = await navigator.xr.requestSession(
                        "immersive-ar",
                        {
                            requiredFeatures: [
                                "local-floor",
                                "dom-overlay",
                                "image-tracking",
                            ],
                            trackedImages: [
                                {
                                    image: imageBitmapPromise,
                                    widthInMeters: 0.1, // Specify the real-world size
                                },
                            ],
                            domOverlay: { root: containerRef.current },
                        } as XRSessionInitExtended
                    );

                    session.addEventListener("end", () => {
                        console.log("AR session ended.");
                        setIsARPresenting(false);
                    });

                    session.updateRenderState({
                        baseLayer: new XRWebGLLayer(
                            session,
                            document
                                .createElement("canvas")
                                .getContext("webgl")!
                        ),
                    });

                    setIsARPresenting(true);
                    console.log("AR session started!");
                } catch (error) {
                    console.error("Failed to start AR session:", error);
                }
            } else {
                console.error("AR not supported on this device.");
            }
        }
    };

    const exitAR = () => {
        // In a real app you would call session.end() if you have stored the session.
        setIsARPresenting(false);
        console.log("AR session exited.");
    };

    return (
        <ARContext.Provider
            value={{ isARPresenting, containerRef, enterAR, exitAR }}
        >
            {children}
        </ARContext.Provider>
    );
};

export const useAR = () => useContext(ARContext);
