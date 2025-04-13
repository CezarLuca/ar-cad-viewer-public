"use client";
import React, { useEffect, useRef, useState } from "react";
import {
    AmbientLight,
    DirectionalLight,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
    Group,
    LoadingManager,
    Mesh,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useAR } from "@/context/ARContext";
import { useModelUrl } from "@/context/ModelUrlContext";
import AROverlayContent from "./ui/AROverlayContent";
import { ModelConfigProvider } from "@/context/ModelConfigContext";

const ARScene: React.FC = () => {
    const { setIsARPresenting, containerRef: arContainerRef } = useAR();
    const { modelUrl } = useModelUrl();
    const buttonRef = useRef<HTMLButtonElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const rendererRef = useRef<WebGLRenderer | null>(null);
    const sceneRef = useRef<Scene | null>(null);
    const cameraRef = useRef<PerspectiveCamera | null>(null);
    const modelGroupRef = useRef<Group | null>(null);
    const arFuncRef = useRef<() => void>(() => {});
    const currentSessionRef = useRef<XRSession | null>(null);
    const [isModelPlaced, setIsModelPlaced] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined" || !arContainerRef?.current) return;

        const container = arContainerRef.current;
        let imgBitmap: ImageBitmap | null = null;
        let xrRefSpace: XRReferenceSpace | undefined;
        let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;

        // --- Scene, Model, Lighting, Camera, Renderer Setup ---
        const scene = new Scene();
        sceneRef.current = scene;
        const loadingManager = new LoadingManager();
        const loader = new GLTFLoader(loadingManager);
        loader.load(
            modelUrl,
            (gltf) => {
                console.log("Model loaded successfully:", modelUrl);
                modelGroupRef.current = gltf.scene;
                modelGroupRef.current.scale.set(0.1, 0.1, 0.1);
                modelGroupRef.current.visible = false;
                scene.add(modelGroupRef.current);
                render();
            },
            undefined,
            (error) => {
                console.error("Error loading GLTF model:", error);
            }
        );
        const ambient = new AmbientLight(0xdddddd);
        scene.add(ambient);
        const directionalLight = new DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(1, 1, 1).normalize();
        scene.add(directionalLight);
        const camera = new PerspectiveCamera(
            70,
            container.clientWidth / container.clientHeight,
            0.01,
            1000
        );
        cameraRef.current = camera;
        const renderer = new WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.xr.enabled = true;
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;
        gl = renderer.getContext();

        // --- Image Tracking Setup ---
        const currentImgRef = imgRef.current;
        const handleImageLoad = () => {
            if (currentImgRef) {
                createImageBitmap(currentImgRef)
                    .then((bitmap) => {
                        imgBitmap = bitmap; // Assign the created bitmap
                        console.log("ImageBitmap created successfully.");
                        // Optionally, trigger a re-render or update state if needed elsewhere
                    })
                    .catch((err) =>
                        // This is where the error occurs if the image isn't ready
                        console.error("Error creating ImageBitmap:", err)
                    );
            }
        };

        // Check if the image is already loaded (e.g., cached)
        if (currentImgRef?.complete && currentImgRef.naturalHeight !== 0) {
            handleImageLoad();
        } else if (currentImgRef) {
            // Add event listener if not loaded yet
            currentImgRef.addEventListener("load", handleImageLoad);
        } else {
            console.warn("imgRef not set initially.");
        }

        // --- Resize Handling ---
        function onWindowResize() {
            if (!cameraRef.current || !rendererRef.current || !container)
                return;
            cameraRef.current.aspect =
                container.clientWidth / container.clientHeight;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(
                container.clientWidth,
                container.clientHeight
            );
            render();
        }
        window.addEventListener("resize", onWindowResize, false);

        // --- Render Loop ---
        function render() {
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        }

        // --- WebXR Frame Loop ---
        function onXRFrame(time: number, frame: XRFrame) {
            const session = frame.session;
            if (!session) return;
            session.requestAnimationFrame(onXRFrame);

            const baseLayer = session.renderState.baseLayer;
            if (!baseLayer || !xrRefSpace || !gl || !modelGroupRef.current) {
                console.warn("Skipping frame: Missing essentials.");
                return;
            }

            const pose = frame.getViewerPose(xrRefSpace);
            if (pose) {
                const results = frame.getImageTrackingResults();
                let imageTracked = false;
                for (const result of results) {
                    if (result.trackingState === "tracked") {
                        imageTracked = true;
                        const imagePose = frame.getPose(
                            result.imageSpace,
                            xrRefSpace
                        );
                        if (
                            imagePose &&
                            modelGroupRef.current &&
                            isModelPlaced
                        ) {
                            modelGroupRef.current.visible = true;
                            modelGroupRef.current.matrix.fromArray(
                                imagePose.transform.matrix
                            );
                            modelGroupRef.current.matrixWorldNeedsUpdate = true;
                        }
                        break;
                    }
                }
                if (!imageTracked && isModelPlaced && modelGroupRef.current) {
                    modelGroupRef.current.visible = false;
                }
            } else {
                if (isModelPlaced && modelGroupRef.current) {
                    modelGroupRef.current.visible = false;
                }
            }
            render();
        }

        // --- Define Session Callbacks in useEffect Scope ---
        function onSessionStarted(session: XRSession) {
            const currentRenderer = rendererRef.current;
            if (!currentRenderer) return;

            session.addEventListener("end", onSessionEnded); // Use outer scope function
            currentRenderer.xr
                .setSession(session)
                .then(() => {
                    console.log("XR session set on renderer.");
                    session
                        .requestReferenceSpace("local-floor")
                        .then((refSpace) => {
                            xrRefSpace = refSpace; // Assign to outer scope variable
                            console.log(
                                "Reference space obtained:",
                                xrRefSpace
                            );
                            session.requestAnimationFrame(onXRFrame);
                        })
                        .catch((err) =>
                            console.error("Failed to get reference space:", err)
                        );
                })
                .catch((err) =>
                    console.error("Failed to set XR session:", err)
                );

            if (buttonRef.current) {
                buttonRef.current.textContent = "EXIT AR";
            }
            currentSessionRef.current = session;
            setIsARPresenting(true); // Set presenting state
            setIsModelPlaced(false);
            if (modelGroupRef.current) modelGroupRef.current.visible = false;
        }

        function onSessionEnded(/*event: XRSessionEvent*/) {
            const currentRenderer = rendererRef.current;
            // const session = currentSessionRef.current;
            // No need to remove listener here if done in cleanup

            if (currentRenderer) {
                currentRenderer.xr
                    .setSession(null)
                    .catch((err) =>
                        console.error("Error clearing XR session:", err)
                    );
            }

            if (buttonRef.current) {
                buttonRef.current.textContent = "ENTER AR";
            }
            currentSessionRef.current = null;
            xrRefSpace = undefined; // Clear outer scope variable
            setIsARPresenting(false);
            setIsModelPlaced(false);
            if (modelGroupRef.current) modelGroupRef.current.visible = false;
            console.log("AR session ended.");
        }

        // --- WebXR Session Management Function ---
        function AR() {
            if (!rendererRef.current) return;
            // onSessionStarted and onSessionEnded are now defined outside this function

            if (currentSessionRef.current === null) {
                if (!imgBitmap) {
                    console.error("Image Bitmap not ready for AR session.");
                    alert(
                        "Tracking image not loaded or processed yet. Please wait a moment."
                    );
                    return;
                }
                const sessionInit: XRSessionInit = {
                    requiredFeatures: [
                        "local-floor",
                        "image-tracking",
                        "dom-overlay",
                    ],
                    trackedImages: [
                        {
                            image: imgBitmap,
                            widthInMeters: 0.1,
                        },
                    ],
                    domOverlay: { root: container },
                };

                navigator.xr
                    ?.requestSession("immersive-ar", sessionInit)
                    .then(onSessionStarted) // Call the outer scope function
                    .catch((err) => {
                        console.error("Failed to request AR session:", err);
                        alert(`Failed to start AR session: ${err.message}`);
                    });
            } else {
                currentSessionRef.current.end(); // Triggers the 'end' event -> onSessionEnded
            }
        }

        arFuncRef.current = AR;

        // Initial render
        render();

        // --- Cleanup ---
        return () => {
            console.log("Cleaning up ARScene...");
            window.removeEventListener("resize", onWindowResize);
            if (currentSessionRef.current) {
                console.log("Ending active AR session on cleanup.");
                // Now correctly references the onSessionEnded in the useEffect scope
                currentSessionRef.current.removeEventListener(
                    "end",
                    onSessionEnded
                );
                currentSessionRef.current
                    .end()
                    .catch((err) =>
                        console.error("Error ending session on cleanup:", err)
                    );
                currentSessionRef.current = null;
            }
            if (rendererRef.current) {
                console.log("Disposing renderer.");
                rendererRef.current.setAnimationLoop(null);
                rendererRef.current.dispose();
                if (rendererRef.current.domElement.parentNode === container) {
                    console.log("Removing renderer DOM element.");
                    container.removeChild(rendererRef.current.domElement);
                }
                rendererRef.current = null;
            }
            if (sceneRef.current) {
                sceneRef.current.traverse((object) => {
                    if (object instanceof Mesh) {
                        object.geometry?.dispose();
                        if (Array.isArray(object.material)) {
                            object.material.forEach((material) =>
                                material.dispose()
                            );
                        } else if (object.material) {
                            object.material.dispose();
                        }
                    }
                });
                sceneRef.current = null;
            }
            if (currentImgRef) {
                currentImgRef.removeEventListener("load", handleImageLoad);
            }
            modelGroupRef.current = null;
            console.log("Cleanup complete.");
        };
    }, [modelUrl, setIsARPresenting, arContainerRef, isModelPlaced]);

    const handlePlaceModel = () => {
        if (!modelGroupRef.current) {
            console.error("Model not loaded, cannot place.");
            return;
        }
        setIsModelPlaced(true);
        console.log("Model placement requested.");
    };

    // --- JSX Return ---
    return (
        <div className="absolute inset-0 w-full h-full">
            <img
                ref={imgRef}
                src="/markers/qrTracker.png"
                alt="Tracking Marker"
                className="hidden"
                crossOrigin="anonymous"
            />
            {currentSessionRef.current && (
                <ModelConfigProvider>
                    <AROverlayContent
                        onPlaceModel={handlePlaceModel}
                        isModelPlaced={isModelPlaced}
                    />
                </ModelConfigProvider>
            )}
            {!currentSessionRef.current && (
                <button
                    ref={buttonRef}
                    onClick={() => arFuncRef.current()}
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-blue-600 text-white rounded z-30"
                >
                    ENTER AR
                </button>
            )}
        </div>
    );
};

export default ARScene;
