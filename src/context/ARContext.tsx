"use client";

import React, {
    createContext,
    useContext,
    useState,
    useRef,
    useEffect,
} from "react";

interface XRSessionInitExtended extends XRSessionInit {
    trackedImages?: {
        // image: Promise<ImageBitmap>;
        image: ImageBitmap;
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

export const ARProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [isARPresenting, setIsARPresenting] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [imageBitmapPromise, setImageBitmapPromise] =
        useState<Promise<ImageBitmap> | null>(null);

    // Load the image and create an ImageBitmap on the client side
    useEffect(() => {
        const loadTrackedImage = async () => {
            const image = new Image();
            image.src = "/markers/qrTracker.png";
            await image.decode();
            const bitmap = createImageBitmap(image);
            setImageBitmapPromise(bitmap);
        };

        loadTrackedImage().catch((error) => {
            console.error("Error loading tracked image:", error);
        });
    }, []);

    const enterAR = async () => {
        if (navigator.xr && containerRef.current && imageBitmapPromise) {
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
                                    image: await imageBitmapPromise, // Wait for the promise to resolve
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
        // In a real app, you would call session.end() if you have stored the session.
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
