// "use client";

// import { useCallback, useEffect, useRef, useState } from "react";
// import ReactDOM from "react-dom/client";
// import { Group, Matrix4, Vector3, Euler, Quaternion } from "three";
// import { useXR, XRHitTest, useXRAnchor, XRSpace } from "@react-three/xr";
// import { useThree, useFrame } from "@react-three/fiber";
// import { Environment, useGLTF } from "@react-three/drei";
// import CADModel from "./CADModel";
// import QRTracker from "./QRTracker";
// import ModelControls from "./ui/ModelControls";
// import { useModelUrl } from "@/context/ModelUrlContext";
// import { ModelConfigProvider } from "@/context/ModelConfigContext";

// interface ARSceneProps {
//     setIsARPresenting: (isPresenting: boolean) => void;
// }

// const engineModel = "/models/engine.glb";
// useGLTF.preload(engineModel);

// const AROverlayContent = ({
//     onPlaceModel,
//     isModelPlaced,
//     currentHitPosition,
//     qrDetected,
//     qrContent,
// }: {
//     onPlaceModel: () => void;
//     isModelPlaced: boolean;
//     currentHitPosition: Vector3 | null;
//     qrDetected: boolean;
//     qrContent: string;
// }) => {
//     return (
//         <div className="absolute top-12 left-0 right-0 bottom-0 z-20 pointer-events-none">
//             {!isModelPlaced && (
//                 <>
//                     <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
//                         <button
//                             onClick={onPlaceModel}
//                             className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg pointer-events-auto"
//                         >
//                             Place Model
//                         </button>
//                     </div>
//                     {/* Debug info */}
//                     <div className="absolute top-5 left-14 bg-black bg-opacity-50 text-white p-2 rounded pointer-events-none">
//                         {currentHitPosition
//                             ? `Hit: (${currentHitPosition.x.toFixed(
//                                   2
//                               )}, ${currentHitPosition.y.toFixed(
//                                   2
//                               )}, ${currentHitPosition.z.toFixed(2)})`
//                             : "No hit detected"}
//                         <br />
//                         Status:{" "}
//                         {isModelPlaced
//                             ? "Model Placed"
//                             : "Waiting for placement"}
//                         <br />
//                         QR:{" "}
//                         {qrDetected
//                             ? `Detected (${qrContent.substring(0, 15)}...)`
//                             : "None"}
//                     </div>
//                 </>
//             )}

//             <ModelControls />
//         </div>
//     );
// };
// export default function ARScene({ setIsARPresenting }: ARSceneProps) {
//     const { modelUrl } = useModelUrl();
//     const modelRef = useRef<Group>(null);
//     const { gl } = useThree();
//     const { session, domOverlayRoot } = useXR();
//     const matrixHelper = useRef(new Matrix4()); // Matrix helper for hit test position
//     const hitTestResultRef = useRef<XRHitTestResult | null>(null);
//     const [isModelPlaced, setIsModelPlaced] = useState(false);
//     const [currentHitPosition, setCurrentHitPosition] =
//         useState<Vector3 | null>(null);
//     // useXRAnchor hook gives us the current anchor and a function to request one
//     const [anchor, requestAnchor] = useXRAnchor();
//     const [qrDetected, setQrDetected] = useState(false);
//     const [qrPosition, setQrPosition] = useState<Vector3 | null>(null);
//     const [qrRotation, setQrRotation] = useState<Euler | null>(null);
//     const [qrContent, setQrContent] = useState<string>("");
//     const [placementError, setPlacementError] = useState<string | null>(null);
//     const [autoPlaceEnabled, setAutoPlaceEnabled] = useState(true);
//     const qrAnchorRef = useRef<XRAnchor | null>(null);

//     // Improved QR detection handler
//     const handleQRDetected = useCallback(
//         async (position: Vector3, rotation: Euler, content: string) => {
//             if (!session || isModelPlaced) return;

//             // Validate QR content before processing
//             if (!content.match(/^(https?|modeldata):/)) {
//                 console.warn("Invalid QR content:", content);
//                 return;
//             }

//             try {
//                 // Create precise anchor using QR's calculated transform
//                 const referenceSpace = await session.requestReferenceSpace(
//                     "local"
//                 );
//                 const posInit = { x: position.x, y: position.y, z: position.z };
//                 const q = new Quaternion().setFromEuler(rotation);
//                 const quatInit = { x: q.x, y: q.y, z: q.z, w: q.w };
//                 const transform = new XRRigidTransform(posInit, quatInit);

//                 // Create a new reference space that has the transform applied
//                 const transformedRefSpace =
//                     referenceSpace.getOffsetReferenceSpace(transform);

//                 // Update model position if auto-place enabled
//                 if (autoPlaceEnabled) {
//                     requestAnchor({
//                         relativeTo: "space",
//                         space: transformedRefSpace,
//                     });
//                     qrAnchorRef.current = anchor!;
//                     setIsModelPlaced(true);
//                     console.log("Model automatically placed at QR position");
//                 }

//                 // Update context with QR-derived position
//                 setCurrentHitPosition(position);
//             } catch (error) {
//                 console.error("Failed to create QR anchor:", error);
//             }
//         },
//         [session, autoPlaceEnabled, isModelPlaced, requestAnchor, anchor]
//     );

//     // If it's not the default model, preload it once when the component mounts
//     useEffect(() => {
//         if (modelUrl !== engineModel) {
//             useGLTF.preload(modelUrl);
//         }
//     }, [modelUrl]);

//     // Update parent about AR session status
//     useEffect(() => {
//         if (session) {
//             const isVisible = session.visibilityState === "visible";
//             setIsARPresenting(isVisible);
//         } else {
//             setIsARPresenting(false);
//         }
//     }, [session, setIsARPresenting]);

//     // Set up AR session with camera passthrough
//     useEffect(() => {
//         if (session) {
//             (async () => {
//                 try {
//                     // Request local reference space for AR positioning
//                     await session.requestReferenceSpace("local-floor");

//                     // Enable alpha mode for transparent background (camera passthrough)
//                     gl.setClearAlpha(0);

//                     console.log(
//                         "AR session established with camera passthrough"
//                     );
//                 } catch (error) {
//                     console.error("Failed to initialize AR session:", error);
//                 }
//             })();
//         }
//     }, [session, gl]);

//     const handlePlaceModel = useCallback(async () => {
//         if (!session) return;

//         try {
//             if (qrDetected && qrPosition) {
//                 const referenceSpace = await session.requestReferenceSpace(
//                     "local"
//                 );
//                 const transform = new XRRigidTransform(
//                     qrPosition,
//                     new Quaternion().setFromEuler(qrRotation!)
//                 );
//                 // Create a new reference space that has the transform applied
//                 const transformedRefSpace =
//                     referenceSpace.getOffsetReferenceSpace(transform);

//                 // Request anchor using the transformed reference space
//                 requestAnchor({
//                     relativeTo: "space",
//                     space: transformedRefSpace,
//                 });
//             } else if (hitTestResultRef.current) {
//                 requestAnchor({
//                     relativeTo: "hit-test-result",
//                     hitTestResult: hitTestResultRef.current,
//                 });
//             }
//             setIsModelPlaced(true);
//         } catch (error) {
//             setPlacementError("Failed to place model. Try moving your device.");
//             console.error("Error placing model:", error);
//             setTimeout(() => setPlacementError(null), 3000);
//         }
//     }, [session, qrDetected, qrPosition, qrRotation, requestAnchor]);

//     // Render React components into the DOM overlay
//     useEffect(() => {
//         if (domOverlayRoot) {
//             console.log("domOverlayRoot is available:", domOverlayRoot);
//             const portalRoot = document.createElement("div");
//             domOverlayRoot.appendChild(portalRoot);
//             const root = ReactDOM.createRoot(portalRoot);

//             // Wrap AROverlayContent with ModelConfigProvider to provide context
//             root.render(
//                 <ModelConfigProvider>
//                     <AROverlayContent
//                         onPlaceModel={handlePlaceModel}
//                         isModelPlaced={isModelPlaced}
//                         currentHitPosition={currentHitPosition}
//                         qrDetected={qrDetected}
//                         qrContent={qrContent}
//                     />
//                 </ModelConfigProvider>
//             );

//             // Cleanup on unmount
//             return () => {
//                 root.unmount();
//                 domOverlayRoot.removeChild(portalRoot);
//             };
//         }
//     }, [
//         domOverlayRoot,
//         isModelPlaced,
//         currentHitPosition,
//         session,
//         requestAnchor,
//         qrDetected,
//         qrPosition,
//         qrRotation,
//         qrContent,
//         handlePlaceModel,
//     ]);

//     // Removed redundant update loop relying on anchor.transform.matrix.
//     // The model position is now updated in the useFrame hook.

//     useFrame((state, _delta, frame) => {
//         if (anchor && frame && modelRef.current) {
//             const referenceSpace = state.gl.xr.getReferenceSpace();
//             const pose = frame.getPose(anchor.anchorSpace, referenceSpace!);
//             if (pose) {
//                 const anchorMatrix = new Matrix4().fromArray(
//                     pose.transform.matrix
//                 );
//                 modelRef.current.position.setFromMatrixPosition(anchorMatrix);
//             }
//         }
//     });

//     return (
//         <>
//             {/* Add QRTracker component */}
//             <QRTracker onQRDetected={handleQRDetected} />

//             <XRHitTest
//                 onResults={(results, getWorldMatrix) => {
//                     if (results.length > 0 && !isModelPlaced) {
//                         const result = results[0];
//                         hitTestResultRef.current = result;
//                         getWorldMatrix(matrixHelper.current, result);
//                         setCurrentHitPosition(
//                             new Vector3().setFromMatrixPosition(
//                                 matrixHelper.current
//                             )
//                         );
//                     }
//                 }}
//             />

//             {placementError && (
//                 <div className="error-banner">{placementError}</div>
//             )}
//             {qrDetected && !isModelPlaced && (
//                 <div className="qr-hint">QR Code detected - Tap to place</div>
//             )}

//             <ambientLight intensity={1.5} color="#ffffff" />
//             <directionalLight
//                 position={[5, 5, 5]}
//                 intensity={2}
//                 castShadow
//                 shadow-mapSize-width={2048}
//                 shadow-mapSize-height={2048}
//             />
//             <Environment preset="sunset" />

//             {/* If anchor exists, wrap the model group in XRSpace */}
//             {anchor ? (
//                 <XRSpace space={anchor.anchorSpace}>
//                     <group ref={modelRef}>
//                         {!isModelPlaced && currentHitPosition && (
//                             <mesh
//                                 position={[0, -0.01, 0]}
//                                 rotation={[-Math.PI / 2, 0, 0]}
//                             >
//                                 <circleGeometry args={[0.15, 32]} />
//                                 <meshBasicMaterial
//                                     color="#4285F4"
//                                     opacity={0.5}
//                                     transparent
//                                 />
//                             </mesh>
//                         )}
//                         <CADModel />
//                     </group>
//                 </XRSpace>
//             ) : (
//                 <group ref={modelRef}>
//                     {!isModelPlaced && currentHitPosition && (
//                         <mesh
//                             position={[0, -0.01, 0]}
//                             rotation={[-Math.PI / 2, 0, 0]}
//                         >
//                             <circleGeometry args={[0.15, 32]} />
//                             <meshBasicMaterial
//                                 color="#4285F4"
//                                 opacity={0.5}
//                                 transparent
//                             />
//                         </mesh>
//                     )}
//                     <CADModel />
//                 </group>
//             )}
//         </>
//     );
// }
