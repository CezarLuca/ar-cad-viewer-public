"use client";
import React from "react";

interface ScreenshotButtonProps {
    startScreenshot: () => void;
}

const ScreenshotButton: React.FC<ScreenshotButtonProps> = ({
    startScreenshot,
}) => {
    return (
        <button
            onClick={startScreenshot}
            className="absolute bottom-24 right-8 z-30 pointer-events-auto bg-gray-50 hover:bg-gray-300 border-2 border-gray-900 rounded-full shadow-lg p-2 transition-all"
            title="Take Screenshot"
        >
            {/* Camera Icon SVG */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect
                    x="3"
                    y="7"
                    width="18"
                    height="12"
                    rx="2"
                    fill="#030813"
                    opacity="0.3"
                />
                <path
                    d="M9 7l1.5-2h3L15 7"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
                <circle cx="12" cy="13" r="3" fill="#020307" />
                <circle cx="12" cy="13" r="1.5" fill="#ffffff" />
            </svg>
        </button>
    );
};

export default ScreenshotButton;
