"use client";

import React, { useEffect, useRef, useState } from "react";
import {
    AmbientLight,
    BoxGeometry,
    DirectionalLight,
    Mesh,
    MeshStandardMaterial,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
    Group,
} from "three";
import { useAR } from "@/context/ARContext";
import AROverlayContent from "./ui/AROverlayContent";
import { ModelConfigProvider } from "@/context/ModelConfigContext";

const ARScene: React.FC = () => {
    const { setIsARPresenting, containerRef: arContainerRef } = useAR();
    const buttonRef = useRef<HTMLButtonElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const rendererRef = useRef<WebGLRenderer | null>(null);
    const sceneRef = useRef<Scene | null>(null);
    const cameraRef = useRef<PerspectiveCamera | null>(null);
    // Ref for the simple test box
    const testBoxRef = useRef<Mesh | null>(null);
    // Ref for a potential future complex model group
    const modelGroupRef = useRef<Group | null>(null);
    const arFuncRef = useRef<() => void>(() => {});
    const currentSessionRef = useRef<XRSession | null>(null);
    const isModelPlacedRef = useRef(false);
    const [uiIsModelPlaced, setUiIsModelPlaced] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined" || !arContainerRef?.current) return;

        const container = arContainerRef.current;
        let imgBitmap: ImageBitmap | null = null;
        let xrRefSpace: XRReferenceSpace | undefined;
        let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;

        // --- Scene Setup ---
        const scene = new Scene();
        sceneRef.current = scene;

        // --- Create Test Box ---
        const geometry = new BoxGeometry(0.05, 0.05, 0.05);
        const material = new MeshStandardMaterial({ color: 0xff0000 });
        const cube = new Mesh(geometry, material);
        cube.visible = false; // Initially hidden
        scene.add(cube);
        testBoxRef.current = cube;

        // --- Placeholder for future complex model ---
        // modelGroupRef.current = new Group();
        // modelGroupRef.current.visible = false;
        // scene.add(modelGroupRef.current);
        // // If you were loading a model:
        // const loader = new GLTFLoader();
        // loader.load(modelUrl, (gltf) => {
        //     // Add gltf.scene children to modelGroupRef.current
        //     // modelGroupRef.current.add(gltf.scene);
        //     // Apply necessary scaling/positioning to the group
        //     render();
        // }, undefined, (error) => console.error("Error loading model:", error));

        // --- Lighting ---
        const ambient = new AmbientLight(0xdddddd);
        scene.add(ambient);
        const directionalLight = new DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(1, 1, 1).normalize();
        scene.add(directionalLight);

        // --- Camera ---
        const camera = new PerspectiveCamera(
            70,
            container.clientWidth / container.clientHeight,
            0.01,
            1000
        );
        cameraRef.current = camera;

        // --- Renderer ---
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
                        imgBitmap = bitmap;
                        console.log("ImageBitmap created.");
                    })
                    .catch((err) =>
                        console.error("Error creating ImageBitmap:", err)
                    );
            }
        };
        if (currentImgRef?.complete && currentImgRef.naturalHeight !== 0) {
            handleImageLoad();
        } else if (currentImgRef) {
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
            // Check if testBoxRef.current exists along with other essentials
            if (
                !baseLayer ||
                !xrRefSpace ||
                !gl ||
                !testBoxRef.current /*|| !modelGroupRef.current*/
            ) {
                // console.warn("Skipping frame: Missing essentials."); // Less verbose logging
                return;
            }

            const pose = frame.getViewerPose(xrRefSpace);
            if (pose) {
                const results = frame.getImageTrackingResults();
                let imageTracked = false;
                for (const result of results) {
                    // Check tracking state
                    if (result.trackingState === "tracked") {
                        imageTracked = true;
                        const imagePose = frame.getPose(
                            result.imageSpace,
                            xrRefSpace
                        );

                        // Position the test box if the image is tracked AND the model is placed
                        if (
                            imagePose &&
                            testBoxRef.current &&
                            isModelPlacedRef.current
                        ) {
                            testBoxRef.current.visible = true;
                            testBoxRef.current.matrix.fromArray(
                                imagePose.transform.matrix
                            );
                            testBoxRef.current.matrixWorldNeedsUpdate = true;

                            // --- Position CAD Model (if loaded) ---
                            // if (modelGroupRef.current) {
                            //     modelGroupRef.current.visible = true;
                            //     modelGroupRef.current.matrix.fromArray(imagePose.transform.matrix);
                            //     // Apply any necessary offsets relative to the marker here
                            //     // e.g., modelGroupRef.current.position.y = 0.05;
                            //     modelGroupRef.current.matrixWorldNeedsUpdate = true;
                            // }
                        }
                        break; // Only use the first tracked image
                    }
                }

                // Hide objects if the image is lost (and it was placed)
                if (!imageTracked && isModelPlacedRef.current) {
                    if (testBoxRef.current) testBoxRef.current.visible = false;
                    // if (modelGroupRef.current) modelGroupRef.current.visible = false;
                }
            } else {
                // Hide objects if the viewer pose is lost (and it was placed)
                if (isModelPlacedRef.current) {
                    if (testBoxRef.current) testBoxRef.current.visible = false;
                    // if (modelGroupRef.current) modelGroupRef.current.visible = false;
                }
            }
            render(); // Render the scene
        }

        // --- Session Callbacks (onSessionStarted, onSessionEnded) ---
        function onSessionStarted(session: XRSession) {
            const currentRenderer = rendererRef.current;
            if (!currentRenderer) return;

            session.addEventListener("end", onSessionEnded);
            currentRenderer.xr
                .setSession(session)
                .then(() => {
                    console.log("XR session set.");
                    session
                        .requestReferenceSpace("local-floor")
                        .then((refSpace) => {
                            xrRefSpace = refSpace;
                            console.log("Ref space obtained:", xrRefSpace);
                            // --- Update the ref and Auto place model ---
                            isModelPlacedRef.current = true;
                            // --- Update state for UI ---
                            setUiIsModelPlaced(true);
                            console.log(
                                "Model placement initiated automatically."
                            );
                            // --- Start render loop ---
                            session.requestAnimationFrame(onXRFrame);
                        })
                        .catch((err) => console.error("Ref space error:", err));
                })
                .catch((err) => console.error("Set session error:", err));

            if (buttonRef.current) buttonRef.current.textContent = "EXIT AR";
            currentSessionRef.current = session;
            setIsARPresenting(true);
            if (testBoxRef.current) testBoxRef.current.visible = false; // Ensure box is hidden
            // if (modelGroupRef.current) modelGroupRef.current.visible = false; // Ensure model is hidden
        }

        function onSessionEnded() {
            const currentRenderer = rendererRef.current;
            if (currentRenderer) {
                currentRenderer.xr
                    .setSession(null)
                    .catch((err) => console.error("Clear session error:", err));
            }
            if (buttonRef.current) buttonRef.current.textContent = "ENTER AR";
            currentSessionRef.current = null;
            xrRefSpace = undefined;
            setIsARPresenting(false);
            // --- Update the ref ---
            isModelPlacedRef.current = false;
            // --- Update state for UI ---
            setUiIsModelPlaced(false);
            if (testBoxRef.current) testBoxRef.current.visible = false; // Ensure box is hidden
            // if (modelGroupRef.current) modelGroupRef.current.visible = false; // Ensure model is hidden
            console.log("AR session ended.");
        }

        // --- WebXR Session Management Function (AR) ---
        function AR() {
            if (!rendererRef.current) return;

            if (currentSessionRef.current === null) {
                if (!imgBitmap) {
                    console.error("Image Bitmap not ready.");
                    alert("Tracking image not loaded yet. Please wait.");
                    return;
                }
                const sessionInit: XRSessionInit = {
                    requiredFeatures: [
                        "local-floor",
                        "image-tracking",
                        "dom-overlay",
                    ],
                    trackedImages: [{ image: imgBitmap, widthInMeters: 0.1 }],
                    domOverlay: { root: container },
                };
                navigator.xr
                    ?.requestSession("immersive-ar", sessionInit)
                    .then(onSessionStarted)
                    .catch((err) => {
                        console.error("Request session error:", err);
                        alert(`Failed to start AR: ${err.message}`);
                    });
            } else {
                currentSessionRef.current.end();
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
                currentSessionRef.current.removeEventListener(
                    "end",
                    onSessionEnded
                );
                currentSessionRef.current
                    .end()
                    .catch((err) =>
                        console.error("End session cleanup error:", err)
                    );
                currentSessionRef.current = null;
            }
            if (rendererRef.current) {
                rendererRef.current.setAnimationLoop(null); // Important to stop the XR loop if set
                rendererRef.current.dispose();
                if (rendererRef.current.domElement.parentNode === container) {
                    container.removeChild(rendererRef.current.domElement);
                }
                rendererRef.current = null;
            }
            if (sceneRef.current) {
                // Dispose geometry and material of the test box
                testBoxRef.current?.geometry.dispose();
                if (
                    testBoxRef.current?.material instanceof MeshStandardMaterial
                ) {
                    testBoxRef.current.material.dispose();
                }
                // Dispose any other scene objects if necessary
                sceneRef.current = null;
            }
            if (currentImgRef) {
                currentImgRef.removeEventListener("load", handleImageLoad);
            }
            testBoxRef.current = null; // Clear the ref
            modelGroupRef.current = null; // Clear the ref
            console.log("Cleanup complete.");
        };
    }, [setIsARPresenting, arContainerRef]); // Removed modelUrl if not directly used for setup

    // --- JSX Return ---
    // Keep the JSX the same, it provides the container, image, and UI
    return (
        <div className="absolute inset-0 w-full h-full">
            <img
                ref={imgRef}
                src="/markers/Lego-Part.png"
                alt="Tracking Marker"
                className="hidden"
                crossOrigin="anonymous"
            />
            {/* Overlay content is shown when session is active */}
            {currentSessionRef.current && (
                <ModelConfigProvider>
                    <AROverlayContent isModelPlaced={uiIsModelPlaced} />
                </ModelConfigProvider>
            )}
            {/* Enter AR button shown when session is not active */}
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
