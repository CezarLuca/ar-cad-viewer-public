"use client";

import { useModelConfig } from "@/context/ModelConfigContext";

export default function ModelControls() {
    const { config, updateConfig } = useModelConfig();

    return (
        <div className="w-full flex justify-center pointer-events-auto">
            <div className="bg-white/90 p-4 rounded-lg shadow-lg space-y-4 max-w-xl w-full mx-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                    {/* Position Controls */}
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-700">
                            Position
                        </h4>
                        {["X", "Y", "Z"].map((axis, index) => (
                            <div key={`pos-${axis}`} className="space-y-1">
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>{`${axis}: `}</span>
                                    <span>
                                        {config.position[index].toFixed(2)}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="-5"
                                    max="5"
                                    step="0.1"
                                    value={config.position[index]}
                                    onChange={(e) => {
                                        const newPosition = [
                                            ...config.position,
                                        ] as typeof config.position;
                                        newPosition[index] = parseFloat(
                                            e.target.value
                                        );
                                        updateConfig({ position: newPosition });
                                    }}
                                    className="w-full transition-slider transition-all duration-300"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Rotation Controls */}
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-700">
                            Rotation
                        </h4>
                        {["X", "Y", "Z"].map((axis, index) => (
                            <div
                                key={`rot-${axis}`}
                                className="space-y-1 text-gray-500"
                            >
                                <div className="flex justify-between text-xs">
                                    <span>{`${axis}: `}</span>
                                    <span>
                                        {(
                                            config.rotation[index] *
                                            (180 / Math.PI)
                                        ).toFixed(1)}
                                        °
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={-Math.PI * 2}
                                    max={Math.PI * 2}
                                    step={0.01}
                                    value={config.rotation[index]}
                                    onChange={(e) => {
                                        const newRotation = [
                                            ...config.rotation,
                                        ] as typeof config.rotation;
                                        newRotation[index] = parseFloat(
                                            e.target.value
                                        );
                                        updateConfig({ rotation: newRotation });
                                    }}
                                    className="w-full transition-slider transition-all duration-300"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
