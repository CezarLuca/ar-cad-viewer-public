import { RefObject, useState } from "react";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";

interface OrbitControlsUIProps {
    orbitControlsRef: RefObject<OrbitControlsImpl | null>;
}

export default function OrbitControlsUI({
    orbitControlsRef,
}: OrbitControlsUIProps) {
    const [hoveredButton, setHoveredButton] = useState<string | null>(null);
    const [inverted, setInverted] = useState<boolean>(false);

    // View handlers with consistent positioning
    const handleXView = () => {
        if (!orbitControlsRef.current) return;

        // Move to look along X-axis (view YZ plane)
        orbitControlsRef.current.reset();
        const target = orbitControlsRef.current.target;
        const camera = orbitControlsRef.current.object;

        // Always position at +1 or -1 based on current invert state
        const offset = inverted ? -1 : 1;
        camera.position.set(target.x + offset, target.y, target.z);
        camera.lookAt(target);
        orbitControlsRef.current.update();
    };

    const handleYView = () => {
        if (!orbitControlsRef.current) return;

        // Move to look along Y-axis (view XZ plane)
        orbitControlsRef.current.reset();
        const target = orbitControlsRef.current.target;
        const camera = orbitControlsRef.current.object;

        // Always position at +1 or -1 based on current invert state
        const offset = inverted ? -1 : 1;
        camera.position.set(target.x, target.y + offset, target.z);
        camera.lookAt(target);
        orbitControlsRef.current.update();
    };

    const handleZView = () => {
        if (!orbitControlsRef.current) return;

        // Move to look along Z-axis (view XY plane)
        orbitControlsRef.current.reset();
        const target = orbitControlsRef.current.target;
        const camera = orbitControlsRef.current.object;

        // Always position at +1 or -1 based on current invert state
        const offset = inverted ? -1 : 1;
        camera.position.set(target.x, target.y, target.z + offset);
        camera.lookAt(target);
        orbitControlsRef.current.update();
    };

    // Handler for inverting the current view
    const handleInvertView = () => {
        // Toggle the inversion state
        setInverted((prev) => !prev);
    };

    // New handler for home/default view
    const handleHomeView = () => {
        if (!orbitControlsRef.current) return;

        // Reset to default isometric-like view
        orbitControlsRef.current.reset();
        const target = orbitControlsRef.current.target;
        const camera = orbitControlsRef.current.object;

        // Set to default position (isometric-like view)
        camera.position.set(target.x + 1, target.y + 1, target.z + 1);
        camera.lookAt(target);
        orbitControlsRef.current.update();

        // Reset inverted state
        setInverted(false);
    };

    // Choose polygon points based on inverted state
    const normalPoints = "18,0 36,32 24,32 24,64 12,64 12,32 0,32";
    const invertedPoints = "18,64 36,32 24,32 24,0 12,0 12,32 0,32";

    // Used for regular axes - now correctly based on inverted state
    const activePoints = inverted ? invertedPoints : normalPoints;
    // Used for invert button - opposite of main controls
    const oppositePoints = inverted ? normalPoints : invertedPoints;

    return (
        <div className="absolute bottom-6 left-6 w-50 h-50 pointer-events-auto">
            <div className="absolute bottom-6 left-6 w-30 h-30 pointer-events-auto">
                {/* Isometric layout container */}
                <div className="relative w-full h-full">
                    {/* Y Axis - Top */}
                    <button
                        onClick={handleYView}
                        onMouseEnter={() => setHoveredButton("y")}
                        onMouseLeave={() => setHoveredButton(null)}
                        className={`absolute left-1/2 top-0 -translate-x-1/2 transform transition-all duration-200
                        ${hoveredButton === "y" ? "scale-110" : "scale-100"}`}
                        aria-label="View Y Axis"
                    >
                        <svg width="36" height="64" viewBox="0 0 36 64">
                            <polygon
                                points={activePoints}
                                fill="#22c55e" /* green-600 */
                                stroke="#16a34a" /* green-700 */
                                strokeWidth="1"
                            />
                            <text
                                x="18"
                                y="48"
                                textAnchor="middle"
                                fill="white"
                                fontSize="16"
                                fontWeight="bold"
                            >
                                Y
                            </text>
                        </svg>
                    </button>

                    {/* X Axis - Bottom Right */}
                    <button
                        onClick={handleXView}
                        onMouseEnter={() => setHoveredButton("x")}
                        onMouseLeave={() => setHoveredButton(null)}
                        className={`absolute bottom-0 transform transition-all duration-200 ${
                            inverted ? "-rotate-60 left-2" : "rotate-60 right-2"
                        }
                        ${hoveredButton === "x" ? "scale-110" : "scale-100"}`}
                        aria-label="View X Axis"
                    >
                        <svg width="36" height="64" viewBox="0 0 36 64">
                            <polygon
                                points={activePoints}
                                fill="#dc2626" /* red-600 */
                                stroke="#b91c1c" /* red-700 */
                                strokeWidth="1"
                            />
                            <text
                                x="18"
                                y="48"
                                textAnchor="middle"
                                fill="white"
                                fontSize="16"
                                fontWeight="bold"
                            >
                                X
                            </text>
                        </svg>
                    </button>

                    {/* Z Axis - Bottom Left */}
                    <button
                        onClick={handleZView}
                        onMouseEnter={() => setHoveredButton("z")}
                        onMouseLeave={() => setHoveredButton(null)}
                        className={`absolute bottom-0 transform transition-all duration-200 ${
                            inverted
                                ? "rotate-60 right-2"
                                : "-rotate-60  left-2"
                        }
                        ${hoveredButton === "z" ? "scale-110" : "scale-100"}`}
                        aria-label="View Z Axis"
                    >
                        <svg width="36" height="64" viewBox="0 0 36 64">
                            <polygon
                                points={activePoints}
                                fill="#2563eb" /* blue-600 */
                                stroke="#1d4ed8" /* blue-700 */
                                strokeWidth="1"
                            />
                            <text
                                x="18"
                                y="48"
                                textAnchor="middle"
                                fill="white"
                                fontSize="16"
                                fontWeight="bold"
                            >
                                Z
                            </text>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Invert View Button */}
            <button
                onClick={handleInvertView}
                onMouseEnter={() => setHoveredButton("invert")}
                onMouseLeave={() => setHoveredButton(null)}
                className={`absolute right-[-5px] bottom-1 transition-all duration-200 group
        ${hoveredButton === "invert" ? "scale-105" : "scale-100"}`}
                aria-label="Invert View"
            >
                <div className="relative w-14 h-14">
                    {/* Background circle - changes opacity based on inverted state */}
                    <div
                        className={`absolute inset-0 rounded-full border-2 border-gray-400 border-dashed 
            ${inverted ? "opacity-100" : "opacity-0 group-hover:opacity-100"} 
            transition-opacity`}
                    ></div>

                    {/* Inverted Y Axis */}
                    <div
                        className={`absolute left-1/2 top-0 -translate-x-1/2 transform transition-all duration-200
                ${hoveredButton === "invert" ? "scale-110" : "scale-100"}`}
                    >
                        <svg width="18" height="30" viewBox="0 0 36 64">
                            <polygon
                                points={oppositePoints}
                                fill="#22c55e" /* green-600 */
                                stroke="#16a34a" /* green-700 */
                                strokeWidth="1"
                            />
                        </svg>
                    </div>

                    {/* Inverted X Axis */}
                    <div
                        className={`absolute bottom-0 transform transition-all duration-200
                            ${
                                inverted
                                    ? "rotate-60 right-1"
                                    : "-rotate-60 left-1"
                            }
                ${hoveredButton === "invert" ? "scale-110" : "scale-100"}`}
                    >
                        <svg width="18" height="30" viewBox="0 0 36 64">
                            <polygon
                                points={oppositePoints}
                                fill="#dc2626" /* red-600 */
                                stroke="#b91c1c" /* red-700 */
                                strokeWidth="1"
                            />
                        </svg>
                    </div>

                    {/* Inverted Z Axis */}
                    <div
                        className={`absolute bottom-0 transform transition-all duration-200
                            ${
                                inverted
                                    ? "-rotate-60 left-1"
                                    : "rotate-60 right-1"
                            }
                ${hoveredButton === "invert" ? "scale-110" : "scale-100"}`}
                    >
                        <svg width="18" height="30" viewBox="0 0 36 64">
                            <polygon
                                points={oppositePoints}
                                fill="#2563eb" /* blue-600 */
                                stroke="#1d4ed8" /* blue-700 */
                                strokeWidth="1"
                            />
                        </svg>
                    </div>
                </div>
            </button>

            {/* Reset View Button */}
            <button
                onClick={handleHomeView}
                onMouseEnter={() => setHoveredButton("home")}
                onMouseLeave={() => setHoveredButton(null)}
                className={`absolute top-18 left-2 transition-all duration-300 
                        ${
                            hoveredButton === "home"
                                ? "scale-110 rotate-180"
                                : "scale-100 rotate-0"
                        }`}
                aria-label="Reset to default view"
            >
                <svg
                    width="42"
                    height="42"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="#526d9c"
                        fillOpacity="0.2"
                        stroke="#3b82f6"
                        strokeWidth="1"
                    />
                    <path
                        d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z"
                        fill="#cfdeff"
                        stroke="#1d4ed8"
                        strokeWidth="0.5"
                    />
                </svg>
            </button>
        </div>
    );
}
