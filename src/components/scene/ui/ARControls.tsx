"use client";

import { useXR } from "@react-three/xr";
import { useEffect, useState } from "react";

interface ARControlsProps {
    onIncreaseScale: () => void;
    onDecreaseScale: () => void;
    onRotateLeft: () => void;
    onRotateRight: () => void;
    scale: number;
    modelPlaced: boolean;
}

export default function ARControls({
    onIncreaseScale,
    onDecreaseScale,
    onRotateLeft,
    onRotateRight,
    scale,
    modelPlaced,
}: ARControlsProps) {
    const { session } = useXR();
    const [isPresenting, setIsPresenting] = useState(false);

    useEffect(() => {
        if (session) {
            setIsPresenting(session.visibilityState === "visible");
        }
    }, [session]);

    // Only show controls in AR mode and when model is placed
    if (!isPresenting || !modelPlaced) return null;

    return (
        <div className="fixed bottom-10 left-0 right-0 flex justify-center z-50 pointer-events-auto">
            <div className="bg-gray-800 bg-opacity-70 rounded-lg p-4 flex items-center space-x-4">
                <div className="flex flex-col items-center">
                    <span className="text-white text-sm mb-1">
                        Scale: {scale.toFixed(1)}
                    </span>
                    <div className="flex space-x-2">
                        <button
                            onClick={onDecreaseScale}
                            className="bg-red-500 hover:bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl"
                        >
                            -
                        </button>
                        <button
                            onClick={onIncreaseScale}
                            className="bg-green-500 hover:bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl"
                        >
                            +
                        </button>
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <span className="text-white text-sm mb-1">Rotate</span>
                    <div className="flex space-x-2">
                        <button
                            onClick={onRotateLeft}
                            className="bg-blue-500 hover:bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center"
                        >
                            ⟲
                        </button>
                        <button
                            onClick={onRotateRight}
                            className="bg-blue-500 hover:bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center"
                        >
                            ⟳
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
