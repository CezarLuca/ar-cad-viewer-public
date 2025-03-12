import { RefObject, useState } from "react";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";

interface OrbitControlsUIProps {
    orbitControlsRef: RefObject<OrbitControlsImpl | null>;
}

export default function OrbitControlsUI({
    orbitControlsRef,
}: OrbitControlsUIProps) {
    const [hoveredButton, setHoveredButton] = useState<string | null>(null);

    // View handlers (unchanged)
    const handleXView = () => {
        if (!orbitControlsRef.current) return;

        // Move to look along X-axis (view YZ plane)
        orbitControlsRef.current.reset();
        const target = orbitControlsRef.current.target;
        const camera = orbitControlsRef.current.object;

        camera.position.set(target.x + 1, target.y, target.z);
        camera.lookAt(target);
        orbitControlsRef.current.update();
    };

    const handleYView = () => {
        if (!orbitControlsRef.current) return;

        // Move to look along Y-axis (view XZ plane)
        orbitControlsRef.current.reset();
        const target = orbitControlsRef.current.target;
        const camera = orbitControlsRef.current.object;

        camera.position.set(target.x, target.y + 1, target.z);
        camera.lookAt(target);
        orbitControlsRef.current.update();
    };

    const handleZView = () => {
        if (!orbitControlsRef.current) return;

        // Move to look along Z-axis (view XY plane)
        orbitControlsRef.current.reset();
        const target = orbitControlsRef.current.target;
        const camera = orbitControlsRef.current.object;

        camera.position.set(target.x, target.y, target.z + 1);
        camera.lookAt(target);
        orbitControlsRef.current.update();
    };

    return (
        <div className="absolute bottom-6 left-6 w-32 h-32 pointer-events-auto">
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
                            points="18,0 36,32 24,32 24,64 12,64 12,32 0,32"
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
                    className={`absolute right-0 bottom-0 transform transition-all duration-200 rotate-60
                        ${hoveredButton === "x" ? "scale-110" : "scale-100"}`}
                    aria-label="View X Axis"
                >
                    <svg width="36" height="64" viewBox="0 0 36 64">
                        <polygon
                            points="18,0 36,32 24,32 24,64 12,64 12,32 0,32"
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
                    className={`absolute left-0 bottom-0 transform transition-all duration-200 -rotate-60
                        ${hoveredButton === "z" ? "scale-110" : "scale-100"}`}
                    aria-label="View Z Axis"
                >
                    <svg width="36" height="64" viewBox="0 0 36 64">
                        <polygon
                            points="18,0 36,32 24,32 24,64 12,64 12,32 0,32"
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
    );
}
