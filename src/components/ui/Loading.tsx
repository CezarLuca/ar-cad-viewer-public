"use client";

import React from "react";

type LoadingProps = {
    message?: string;
    size?: "sm" | "md" | "lg";
    fullScreen?: boolean;
    className?: string;
};

const sizeMap = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
};

export default function Loading({
    message = "Loading...",
    size = "md",
    fullScreen = false,
    className = "",
}: LoadingProps) {
    const spinnerSize = sizeMap[size] ?? sizeMap.md;

    const containerClasses = [
        fullScreen ? "fixed inset-0 z-50" : "",
        "flex items-center justify-center",
        fullScreen ? "bg-white/80 dark:bg-black/60" : "",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={containerClasses} role="status" aria-live="polite">
            <div className="flex flex-col items-center gap-4 p-4">
                <svg
                    className={`animate-spin text-gray-700 dark:text-gray-200 ${spinnerSize}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                </svg>

                <div className="flex flex-col items-center gap-1">
                    <span className="text-sm md:text-base text-gray-700 dark:text-gray-100">
                        {message}
                    </span>
                </div>
            </div>
        </div>
    );
}
