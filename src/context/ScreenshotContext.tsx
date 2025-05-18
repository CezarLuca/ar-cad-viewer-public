import React, { createContext, useContext, useState, ReactNode } from "react";

interface ScreenshotContextType {
    screenshot: string | null;
    setScreenshot: (img: string | null) => void;
    startScreenshot: () => void;
    isFraming: boolean;
    setIsFraming: (val: boolean) => void;
    frameSize: number;
    setFrameSize: (val: number) => void;
}

const ScreenshotContext = createContext<ScreenshotContextType | undefined>(
    undefined
);

export function ScreenshotProvider({ children }: { children: ReactNode }) {
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [isFraming, setIsFraming] = useState(false);
    const [frameSize, setFrameSize] = useState(200);

    // Dummy, will be replaced in ARCanvas
    const startScreenshot = () => {};

    return (
        <ScreenshotContext.Provider
            value={{
                screenshot,
                setScreenshot,
                startScreenshot,
                isFraming,
                setIsFraming,
                frameSize,
                setFrameSize,
            }}
        >
            {children}
        </ScreenshotContext.Provider>
    );
}

export function useScreenshot() {
    const ctx = useContext(ScreenshotContext);
    if (!ctx)
        throw new Error("useScreenshot must be used within ScreenshotProvider");
    return ctx;
}
