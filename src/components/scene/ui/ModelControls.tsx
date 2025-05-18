"use client";

import { useModelConfig } from "@/context/ModelConfigContext";
import { useState } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import EditableValue from "./EditableValue";

const CADSCALE = 0.01;

export default function ModelControls() {
    const { config, updateConfig } = useModelConfig();
    const [expandedSections, setExpandedSections] = useState({
        position: false,
        rotation: false,
        scale: false,
    });
    const [asymmetricScale, setAsymmetricScale] = useState(false);
    const [useRadians, setUseRadians] = useState(false);

    const toggleSection = (section: "position" | "rotation" | "scale") => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const toggleRadiansMode = () => {
        setUseRadians((prev) => !prev);
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

    const resetPosition = () => {
        updateConfig({
            position: [0, 0, 0] as typeof config.position,
        });
    };

    const resetRotation = () => {
        updateConfig({
            rotation: [0, 0, 0] as typeof config.rotation,
        });
    };

    const resetScale = () => {
        updateConfig({
            scale: [0.01, 0.01, 0.01] as typeof config.scale,
        });
    };

    // Determine if any sections are expanded
    const anySectionExpanded =
        expandedSections.position ||
        expandedSections.rotation ||
        expandedSections.scale;

    return (
        <div className="w-full flex justify-start">
            <div
                className={`bg-white/50 p-4 rounded-lg shadow-lg space-y-4 mx-4 mt-4 transition-all duration-300 ${
                    anySectionExpanded ? "max-w-xl w-full" : "w-auto"
                }`}
            >
                <div className="flex flex-col space-y-4">
                    {/* Position Controls */}
                    <div className="space-y-2 pointer-events-auto">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => toggleSection("position")}
                                className="flex items-center text-left font-medium text-sm text-gray-800 hover:text-gray-950 transition-colors whitespace-nowrap"
                            >
                                <span>Position</span>
                                {expandedSections.position ? (
                                    <FiChevronDown className="h-4 w-4 ml-2" />
                                ) : (
                                    <FiChevronRight className="h-4 w-4 ml-2" />
                                )}
                            </button>

                            {expandedSections.position && (
                                <button
                                    onClick={resetPosition}
                                    className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
                                    title="Reset position to initial values"
                                >
                                    Reset Position
                                </button>
                            )}
                        </div>

                        {expandedSections.position && (
                            <div className="pt-2 space-y-3">
                                {["X", "Y", "Z"].map((axis, index) => (
                                    <div
                                        key={`pos-${axis}`}
                                        className="space-y-1"
                                    >
                                        <div className="flex justify-between text-xs text-gray-600">
                                            <span>{`${axis}: `}</span>
                                            <EditableValue
                                                value={config.position[index]}
                                                onValueChange={(newValue) => {
                                                    const newPosition = [
                                                        ...config.position,
                                                    ] as typeof config.position;
                                                    newPosition[index] =
                                                        newValue;
                                                    updateConfig({
                                                        position: newPosition,
                                                    });
                                                }}
                                                fieldId={`position-${axis}`}
                                                min={-3}
                                                max={3}
                                                step={0.1}
                                                toFixed={2}
                                            />
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
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => toggleSection("rotation")}
                                className="flex items-center text-left font-medium text-sm text-gray-800 hover:text-gray-950 transition-colors whitespace-nowrap"
                            >
                                <span>Rotation</span>
                                {expandedSections.rotation ? (
                                    <FiChevronDown className="h-4 w-4 ml-2" />
                                ) : (
                                    <FiChevronRight className="h-4 w-4 ml-2" />
                                )}
                            </button>

                            {expandedSections.rotation && (
                                <button
                                    onClick={resetRotation}
                                    className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
                                    title="Reset rotation to initial values"
                                >
                                    Reset Rotation
                                </button>
                            )}
                        </div>

                        {expandedSections.rotation && (
                            <div className="pt-2 space-y-3">
                                <div className="flex items-center justify-start mb-2">
                                    <span className="text-xs font-medium text-gray-800">
                                        Use radians:
                                    </span>
                                    <button
                                        onClick={toggleRadiansMode}
                                        className={`mx-2 px-2 py-1 rounded text-xs font-medium transition-colors ${
                                            useRadians
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                        }`}
                                    >
                                        {useRadians ? "On" : "Off"}
                                    </button>
                                </div>

                                {["X", "Y", "Z"].map((axis, index) => (
                                    <div
                                        key={`rot-${axis}`}
                                        className="space-y-1 text-gray-500"
                                    >
                                        <div className="flex justify-between text-xs text-gray-600">
                                            <span>{`${axis}: `}</span>
                                            <EditableValue
                                                value={
                                                    useRadians
                                                        ? config.rotation[
                                                              index
                                                          ] / Math.PI
                                                        : config.rotation[
                                                              index
                                                          ] *
                                                          (180 / Math.PI)
                                                }
                                                onValueChange={(newValue) => {
                                                    const radValue = useRadians
                                                        ? newValue * Math.PI
                                                        : newValue *
                                                          (Math.PI / 180);
                                                    const newRotation = [
                                                        ...config.rotation,
                                                    ] as typeof config.rotation;
                                                    newRotation[index] =
                                                        radValue;
                                                    updateConfig({
                                                        rotation: newRotation,
                                                    });
                                                }}
                                                fieldId={`rotation-${axis}`}
                                                suffix={useRadians ? "π" : "°"}
                                                min={useRadians ? -1 : -180}
                                                max={useRadians ? 1 : 180}
                                                step={useRadians ? 0.05 : 1}
                                                toFixed={useRadians ? 2 : 1}
                                            />
                                        </div>
                                        <input
                                            type="range"
                                            min={useRadians ? -1 : -Math.PI}
                                            max={useRadians ? 1 : Math.PI}
                                            step={useRadians ? 0.01 : 0.01}
                                            value={
                                                useRadians
                                                    ? config.rotation[index] /
                                                      Math.PI
                                                    : config.rotation[index]
                                            }
                                            onChange={(e) => {
                                                const inputValue = parseFloat(
                                                    e.target.value
                                                );
                                                const newRotation = [
                                                    ...config.rotation,
                                                ] as typeof config.rotation;
                                                newRotation[index] = useRadians
                                                    ? inputValue * Math.PI
                                                    : inputValue;
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
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => toggleSection("scale")}
                                className="flex items-center text-left font-medium text-sm text-gray-800 hover:text-gray-950 transition-colors whitespace-nowrap"
                            >
                                <span>Scale</span>
                                {expandedSections.scale ? (
                                    <FiChevronDown className="h-4 w-4 ml-2" />
                                ) : (
                                    <FiChevronRight className="h-4 w-4 ml-2" />
                                )}
                            </button>

                            {expandedSections.scale && (
                                <button
                                    onClick={resetScale}
                                    className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
                                    title="Reset scale to initial values"
                                >
                                    Reset Scale
                                </button>
                            )}
                        </div>

                        {expandedSections.scale && (
                            <div className="pt-2 space-y-3">
                                {/* Asymmetric scale toggle */}
                                <div className="flex items-center justify-start mb-2">
                                    <span className="text-xs font-medium text-gray-800">
                                        Scale unlock:
                                    </span>
                                    <button
                                        onClick={toggleAsymmetricScale}
                                        className={`mx-2 px-2 py-1 rounded text-xs font-medium transition-colors ${
                                            asymmetricScale
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
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
                                        <div className="flex justify-between text-xs text-gray-600">
                                            <span>{`${axis}: `}</span>
                                            <EditableValue
                                                value={getDisplayScale(index)}
                                                onValueChange={(
                                                    displayValue
                                                ) => {
                                                    handleScaleChange(
                                                        index,
                                                        displayValue
                                                    );
                                                }}
                                                fieldId={`scale-${axis}`}
                                                suffix="×"
                                                min={0.1}
                                                max={3}
                                                step={0.05}
                                            />
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
