"use client";

import React, { createContext, useContext, useState, useRef } from "react";
// import { XRSession, XRWebGLLayer } from "webxr-types"; // optional, for type hinting

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
                            requiredFeatures: ["local-floor", "dom-overlay"],
                            domOverlay: { root: containerRef.current },
                        }
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
