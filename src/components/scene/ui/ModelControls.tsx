"use client";

import { useModelConfig } from "@/context/ModelConfigContext";
import { useState } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";

const CADSCALE = 0.01;

export default function ModelControls() {
    const { config, updateConfig } = useModelConfig();
    const [expandedSections, setExpandedSections] = useState({
        position: false,
        rotation: false,
        scale: false,
    });
    const [asymmetricScale, setAsymmetricScale] = useState(false);

    const toggleSection = (section: "position" | "rotation" | "scale") => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    // Handle scale changes with linked/unlinked behavior
    const handleScaleChange = (index: number, displayValue: number) => {
        // Convert from display value (1.0 = normal) to actual scale value (0.01 = normal)
        const actualValue = displayValue * CADSCALE;

        const newScale = [...config.scale] as typeof config.scale;

        if (asymmetricScale) {
            // If asymmetric, only change the specified axis
            newScale[index] = actualValue;
        } else {
            // If symmetric, change all axes proportionally based on previous ratio
            const ratio = actualValue / newScale[index];
            newScale[0] = newScale[0] * ratio;
            newScale[1] = newScale[1] * ratio;
            newScale[2] = newScale[2] * ratio;
        }

        updateConfig({ scale: newScale });
    };

    // Toggle asymmetric scaling
    const toggleAsymmetricScale = () => {
        setAsymmetricScale((prev) => !prev);

        // If switching back to symmetric, make all axes equal to X
        if (asymmetricScale) {
            const xValue = config.scale[0];
            updateConfig({
                scale: [xValue, xValue, xValue] as typeof config.scale,
            });
        }
    };

    // Convert actual scale values to display values
    const getDisplayScale = (index: number): number => {
        return config.scale[index] / CADSCALE;
    };

    // Determine if any sections are expanded
    const anySectionExpanded =
        expandedSections.position ||
        expandedSections.rotation ||
        expandedSections.scale;

    return (
        <div className="w-full flex justify-start">
            <div
                className={`bg-white/90 p-4 rounded-lg shadow-lg space-y-4 mx-4 mt-4 transition-all duration-300 ${
                    anySectionExpanded ? "max-w-xl w-full" : "w-auto"
                }`}
            >
                <div className="flex flex-col space-y-4">
                    {/* Position Controls */}
                    <div className="space-y-2 pointer-events-auto">
                        <button
                            onClick={() => toggleSection("position")}
                            className="flex items-center justify-between text-left font-medium text-sm text-gray-700 hover:text-gray-900 transition-colors whitespace-nowrap pr-2"
                        >
                            <span>Position</span>
                            {expandedSections.position ? (
                                <FiChevronDown className="h-4 w-4 ml-2" />
                            ) : (
                                <FiChevronRight className="h-4 w-4 ml-2" />
                            )}
                        </button>

                        {expandedSections.position && (
                            <div className="pt-2 space-y-3">
                                {["X", "Y", "Z"].map((axis, index) => (
                                    <div
                                        key={`pos-${axis}`}
                                        className="space-y-1"
                                    >
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>{`${axis}: `}</span>
                                            <span>
                                                {config.position[index].toFixed(
                                                    2
                                                )}
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="-3"
                                            max="3"
                                            step="0.1"
                                            value={config.position[index]}
                                            onChange={(e) => {
                                                const newPosition = [
                                                    ...config.position,
                                                ] as typeof config.position;
                                                newPosition[index] = parseFloat(
                                                    e.target.value
                                                );
                                                updateConfig({
                                                    position: newPosition,
                                                });
                                            }}
                                            className="w-full transition-slider transition-all duration-300"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Rotation Controls */}
                    <div className="space-y-2 pointer-events-auto">
                        <button
                            onClick={() => toggleSection("rotation")}
                            className="flex items-center justify-between text-left font-medium text-sm text-gray-700 hover:text-gray-900 transition-colors whitespace-nowrap pr-2"
                        >
                            <span>Rotation</span>
                            {expandedSections.rotation ? (
                                <FiChevronDown className="h-4 w-4 ml-2" />
                            ) : (
                                <FiChevronRight className="h-4 w-4 ml-2" />
                            )}
                        </button>

                        {expandedSections.rotation && (
                            <div className="pt-2 space-y-3">
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
                                            min={-Math.PI}
                                            max={Math.PI}
                                            step={0.01}
                                            value={config.rotation[index]}
                                            onChange={(e) => {
                                                const newRotation = [
                                                    ...config.rotation,
                                                ] as typeof config.rotation;
                                                newRotation[index] = parseFloat(
                                                    e.target.value
                                                );
                                                updateConfig({
                                                    rotation: newRotation,
                                                });
                                            }}
                                            className="w-full transition-slider transition-all duration-300"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Scale Controls */}
                    <div className="space-y-2 pointer-events-auto">
                        <button
                            onClick={() => toggleSection("scale")}
                            className="flex items-center justify-between text-left font-medium text-sm text-gray-700 hover:text-gray-900 transition-colors whitespace-nowrap pr-2"
                        >
                            <span>Scale</span>
                            {expandedSections.scale ? (
                                <FiChevronDown className="h-4 w-4 ml-2" />
                            ) : (
                                <FiChevronRight className="h-4 w-4 ml-2" />
                            )}
                        </button>

                        {expandedSections.scale && (
                            <div className="pt-2 space-y-3">
                                {/* Asymmetric scale toggle */}
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-gray-700">
                                        Scale asymmetrically
                                    </span>
                                    <button
                                        onClick={toggleAsymmetricScale}
                                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                            asymmetricScale
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        }`}
                                    >
                                        {asymmetricScale ? "On" : "Off"}
                                    </button>
                                </div>

                                {/* Scale sliders */}
                                {["X", "Y", "Z"].map((axis, index) => (
                                    <div
                                        key={`scale-${axis}`}
                                        className="space-y-1"
                                    >
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>{`${axis}: `}</span>
                                            <span>
                                                {getDisplayScale(index).toFixed(
                                                    2
                                                )}
                                                ×
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0.1"
                                            max="3"
                                            step="0.05"
                                            value={getDisplayScale(index)}
                                            onChange={(e) => {
                                                const displayValue = parseFloat(
                                                    e.target.value
                                                );
                                                handleScaleChange(
                                                    index,
                                                    displayValue
                                                );
                                            }}
                                            className="w-full transition-slider transition-all duration-300"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
