"use client";

import { Html } from "@react-three/drei";
import { useModelConfig } from "@/context/ModelConfigContext";
import { Vector3 } from "three";
import { useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";

export default function ARSceneControls({
    modelPlaced,
}: {
    modelPlaced: boolean;
}) {
    const { config, updateConfig } = useModelConfig();
    const [controlPosition, setControlPosition] = useState(
        new Vector3(0, -0.3, -0.5)
    );
    const { camera } = useThree();

    // Calculate scale value from model position
    const scale = Math.max(0.1, Math.min(2.0, config.position[1] + 0.5));

    // Position controls in front of camera with offset
    useFrame(() => {
        if (modelPlaced) {
            // Get camera direction vector
            const direction = new Vector3();
            camera.getWorldDirection(direction);

            // Position controls in front of camera with offset
            const targetPosition = new Vector3()
                .copy(camera.position)
                .add(direction.multiplyScalar(0.5)) // Distance from camera
                .add(new Vector3(0, -0.2, 0)); // Slight downward offset

            // Smooth positioning
            setControlPosition((current) => current.lerp(targetPosition, 0.1));
        }
    });

    if (!modelPlaced) return null;

    // Handlers for model adjustments
    const increaseScale = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newScale = Math.min(scale + 0.1, 2.0);
        updateConfig({
            position: [config.position[0], newScale - 0.5, config.position[2]],
        });
    };

    const decreaseScale = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newScale = Math.max(scale - 0.1, 0.1);
        updateConfig({
            position: [config.position[0], newScale - 0.5, config.position[2]],
        });
    };

    const rotateLeft = (e: React.MouseEvent) => {
        e.stopPropagation();
        updateConfig({
            rotation: [
                config.rotation[0],
                config.rotation[1] - Math.PI / 12,
                config.rotation[2],
            ],
        });
    };

    const rotateRight = (e: React.MouseEvent) => {
        e.stopPropagation();
        updateConfig({
            rotation: [
                config.rotation[0],
                config.rotation[1] + Math.PI / 12,
                config.rotation[2],
            ],
        });
    };

    return (
        <Html
            position={controlPosition}
            transform
            distanceFactor={0.3}
            center
            className="threejs-html-container"
            // This helps with visibility against different backgrounds
            style={{
                width: "220px",
                pointerEvents: "auto",
                userSelect: "none",
            }}
        >
            <div className="bg-black bg-opacity-70 rounded-lg p-3 flex items-center space-x-4">
                <div className="flex flex-col items-center">
                    <span className="text-white text-sm mb-1">
                        Scale: {scale.toFixed(1)}
                    </span>
                    <div className="flex space-x-2">
                        <button
                            onClick={decreaseScale}
                            className="bg-red-500 hover:bg-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl"
                        >
                            -
                        </button>
                        <button
                            onClick={increaseScale}
                            className="bg-green-500 hover:bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl"
                        >
                            +
                        </button>
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <span className="text-white text-sm mb-1">Rotate</span>
                    <div className="flex space-x-2">
                        <button
                            onClick={rotateLeft}
                            className="bg-blue-500 hover:bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl"
                        >
                            ⟲
                        </button>
                        <button
                            onClick={rotateRight}
                            className="bg-blue-500 hover:bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl"
                        >
                            ⟳
                        </button>
                    </div>
                </div>
            </div>
        </Html>
    );
}
