"use client";

import { useModelConfig } from "@/context/ModelConfigContext";

interface ARControlsProps {
    modelPlaced: boolean;
    isPresenting: boolean; // Use this prop instead of useXR
}

export default function ARControls({
    modelPlaced,
    isPresenting,
}: ARControlsProps) {
    const { config, updateConfig } = useModelConfig();

    // Debug logging to verify states
    console.log("AR Controls - Model Placed:", modelPlaced);
    console.log("AR Controls - Is Presenting:", isPresenting);

    // Calculate scale value from model position for display purposes
    const scale = Math.max(0.1, Math.min(2.0, config.position[1] + 0.5));

    // Only show controls in AR mode and when model is placed
    if (!isPresenting || !modelPlaced) {
        console.log("AR Controls not showing because:", {
            isPresenting,
            modelPlaced,
        });
        return null;
    }

    // Handlers for model adjustments using ModelConfigContext
    const increaseScale = () => {
        const newScale = Math.min(scale + 0.1, 2.0);
        updateConfig({
            position: [config.position[0], newScale - 0.5, config.position[2]],
        });
    };

    const decreaseScale = () => {
        const newScale = Math.max(scale - 0.1, 0.1);
        updateConfig({
            position: [config.position[0], newScale - 0.5, config.position[2]],
        });
    };

    const rotateLeft = () => {
        updateConfig({
            rotation: [
                config.rotation[0],
                config.rotation[1] - Math.PI / 12,
                config.rotation[2],
            ],
        });
    };

    const rotateRight = () => {
        updateConfig({
            rotation: [
                config.rotation[0],
                config.rotation[1] + Math.PI / 12,
                config.rotation[2],
            ],
        });
    };

    return (
        <div
            className="fixed bottom-10 left-0 right-0 flex justify-center z-[1000]"
            style={{ pointerEvents: "auto", touchAction: "auto" }}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
        >
            <div className="bg-gray-800 bg-opacity-70 rounded-lg p-4 flex items-center space-x-4">
                <div className="flex flex-col items-center">
                    <span className="text-white text-sm mb-1">
                        Scale: {scale.toFixed(1)}
                    </span>
                    <div className="flex space-x-2">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                decreaseScale();
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl"
                        >
                            -
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                increaseScale();
                            }}
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
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                rotateLeft();
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center"
                        >
                            ⟲
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                rotateRight();
                            }}
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
