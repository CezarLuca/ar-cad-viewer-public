"use client";

import React, { createContext, useContext, useState, useRef } from "react";

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

// Helper function to load an image
const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });

export const ARProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [isARPresenting, setIsARPresenting] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [xrSession, setXRSession] = useState<XRSession | null>(null);

    // startARSession is called on a user gesture (e.g., button click)
    const startARSession = async () => {
        if (!navigator.xr || !containerRef.current) return;
        try {
            const imageUrl = new URL(
                "/markers/qrTracker.png",
                window.location.origin
            ).href;
            // Load the image element
            const img = await loadImage(imageUrl);
            // Create an ImageBitmap from the loaded image
            const bitmap = await createImageBitmap(img);

            const session = await navigator.xr.requestSession("immersive-ar", {
                requiredFeatures: [
                    "local-floor",
                    "dom-overlay",
                    "image-tracking",
                ],
                trackedImages: [
                    {
                        image: bitmap,
                        widthInMeters: 0.1,
                    },
                ],
                domOverlay: { root: containerRef.current },
            } as XRSessionInit);

            session.addEventListener("end", () => {
                setXRSession(null);
                setIsARPresenting(false);
            });
            // The ARCustomCanvas / ARScene will use the session
            setXRSession(session);
            setIsARPresenting(true);
        } catch (error) {
            console.error("Failed to start AR session:", error);
        }
    };

    const enterAR = async () => {
        // Must be triggered from a user gesture
        await startARSession();
    };

    const exitAR = () => {
        xrSession?.end();
        setXRSession(null);
        setIsARPresenting(false);
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
