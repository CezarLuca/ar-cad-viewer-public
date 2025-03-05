// "use client";

// import { Canvas } from "@react-three/fiber";
// import { XR, createXRStore } from "@react-three/xr";
// import { Suspense, useEffect, useRef, useState } from "react";
// import ARScene from "./ARScene";
// import ModelControls from "./ui/ModelControls";
// import ARControls from "./ui/ARControls";
// import { ModelConfigProvider } from "@/context/ModelConfigContext";

// const store = createXRStore();

// export default function ARCanvas() {
//     const containerRef = useRef<HTMLDivElement>(null);

//     // States for model adjustments - shared between AR Scene and controls
//     const [modelScale, setModelScale] = useState(0.5);
//     const [modelRotation, setModelRotation] = useState(0);
//     const [modelPlaced, setModelPlaced] = useState(false);

//     // Handle canvas resize
//     useEffect(() => {
//         const handleResize = () => {
//             if (!containerRef.current) return;
//         };

//         window.addEventListener("resize", handleResize);
//         return () => window.removeEventListener("resize", handleResize);
//     }, []);

//     // AR session configuration
//     const enterAR = () => {
//         store.enterAR();
//     };

//     // Handlers for model adjustments
//     interface IncreaseScaleFunction {
//         (): void;
//     }

//     const increaseScale: IncreaseScaleFunction = (): void =>
//         setModelScale((prev: number): number => Math.min(prev + 0.1, 2.0));
//     interface DecreaseScaleFunction {
//         (): void;
//     }

//     const decreaseScale: DecreaseScaleFunction = () =>
//         setModelScale((prev: number): number => Math.max(prev - 0.1, 0.1));
//     interface RotateLeftFunction {
//         (): void;
//     }

//     const rotateLeft: RotateLeftFunction = (): void =>
//         setModelRotation((prev: number): number => prev - Math.PI / 12);
//     interface RotateRightFunction {
//         (): void;
//     }

//     const rotateRight: RotateRightFunction = (): void =>
//         setModelRotation((prev: number): number => prev + Math.PI / 12);

//     return (
//         <ModelConfigProvider>
//             {/* AR Button for entering AR mode */}
//             <div className="fixed top-4 right-4 z-10">
//                 <button
//                     onClick={enterAR}
//                     className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
//                 >
//                     Enter AR
//                 </button>
//             </div>

//             {/* Canvas Container */}
//             <div
//                 ref={containerRef}
//                 className="relative w-full max-w-6xl mx-auto"
//                 style={{
//                     aspectRatio: "2 / 1",
//                     height: "auto !important",
//                 }}
//             >
//                 <Canvas
//                     shadows
//                     camera={{ position: [0.5, 0.5, 0.5], fov: 50 }}
//                     className="relative top-1 left-1 right-1 w-full h-full"
//                     gl={{
//                         antialias: true,
//                         powerPreference: "high-performance",
//                         alpha: true, // Important for AR transparency
//                     }}
//                     onCreated={({ gl, camera }) => {
//                         // Force initial size calculation
//                         gl.setSize(
//                             containerRef.current?.clientWidth || 0,
//                             containerRef.current?.clientHeight || 0
//                         );

//                         // Optional: Add resize observer
//                         const observer = new ResizeObserver(() => {
//                             gl.setSize(
//                                 containerRef.current?.clientWidth || 0,
//                                 containerRef.current?.clientHeight || 0
//                             );
//                             camera.updateProjectionMatrix();
//                         });

//                         if (containerRef.current) {
//                             observer.observe(containerRef.current);
//                         }
//                     }}
//                 >
//                     <XR store={store}>
//                         <Suspense fallback={null}>
//                             <ARScene
//                                 modelScale={modelScale}
//                                 modelRotation={modelRotation}
//                                 setModelPlaced={setModelPlaced}
//                             />
//                         </Suspense>
//                         {/* AR Controls */}
//                         <ARControls
//                             onIncreaseScale={increaseScale}
//                             onDecreaseScale={decreaseScale}
//                             onRotateLeft={rotateLeft}
//                             onRotateRight={rotateRight}
//                             scale={modelScale}
//                             modelPlaced={modelPlaced}
//                         />
//                     </XR>
//                 </Canvas>
//             </div>
//             {/* Controls container - overlay on top */}
//             <div className="top-1 left-1 w-full h-full pointer-events-auto">
//                 <ModelControls />
//             </div>
//         </ModelConfigProvider>
//     );
// }
