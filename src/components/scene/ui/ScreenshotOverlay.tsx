"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { useScreenshot } from "@/context/ScreenshotContext";

interface ScreenshotOverlayProps {
    onCapture: () => void;
    onCancel: () => void;
}

const ScreenshotOverlay: React.FC<ScreenshotOverlayProps> = ({
    onCapture,
    onCancel,
}) => {
    const { screenshot, setScreenshot, setIsFraming, frameSize, setFrameSize } =
        useScreenshot();
    const overlayRef = useRef<HTMLDivElement>(null);

    // Responsive frame size calculation
    useEffect(() => {
        function updateFrameSize() {
            const width = window.innerWidth;
            if (width < 640) {
                setFrameSize(width);
            } else {
                setFrameSize(width / 2);
            }
        }
        updateFrameSize();
        window.addEventListener("resize", updateFrameSize);
        return () => window.removeEventListener("resize", updateFrameSize);
    }, [setFrameSize]);

    // If screenshot exists, show the result overlay
    if (screenshot) {
        return (
            <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
                <div className="relative bg-gray-100/50 rounded-lg shadow-lg p-6">
                    <button
                        className="absolute top-0 right-1 text-gray-800 hover:text-gray-600 text-3xl"
                        onClick={() => {
                            setScreenshot(null);
                            setIsFraming(false);
                        }}
                        aria-label="Close screenshot"
                    >
                        ×
                    </button>
                    <Image
                        src={screenshot}
                        alt="Screenshot"
                        className="max-w-[90vw] max-h-[90vh] rounded"
                        width={frameSize}
                        height={frameSize}
                        style={{ objectFit: "contain" }}
                        unoptimized
                    />
                </div>
            </div>
        );
    }

    // Otherwise, show the framing overlay
    return (
        <div
            ref={overlayRef}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
            {/* SVG overlay with rectangular transparent hole */}
            <svg
                className="absolute inset-0 w-full h-full pointer-events-auto"
                style={{ display: "block", pointerEvents: "none" }}
            >
                <defs>
                    <mask id="rect-mask">
                        {/* Full white = visible, black = transparent */}
                        <rect width="100%" height="100%" fill="white" />
                        <rect
                            x={`calc(50% - ${frameSize / 2}px)`}
                            y={`calc(50% - ${frameSize / 2}px)`}
                            width={frameSize}
                            height={frameSize}
                            fill="black"
                            rx="16"
                        />
                    </mask>
                </defs>
                <rect
                    width="100%"
                    height="100%"
                    fill="rgba(0,0,0,0.5)"
                    mask="url(#rect-mask)"
                />
            </svg>
            {/* Framing rectangle border */}
            <div
                className="absolute flex items-center justify-center"
                style={{
                    width: frameSize,
                    height: frameSize,
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "none",
                }}
            >
                <div className="border-4 border-blue-400 rounded-lg w-full h-full bg-transparent" />
            </div>
            {/* Buttons */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-auto">
                <button
                    onClick={onCapture}
                    className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"
                >
                    Capture
                </button>
                <button
                    onClick={onCancel}
                    className="bg-gray-300 text-gray-800 px-6 py-2 rounded shadow hover:bg-gray-400"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default ScreenshotOverlay;
