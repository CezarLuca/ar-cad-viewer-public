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
        cube.matrixAutoUpdate = false; // Disable auto-update for manual control
        cube.visible = false; // Initially hidden
        scene.add(cube);
        testBoxRef.current = cube;

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
            // --- Add check for XR presenting ---
            if (rendererRef.current?.xr.isPresenting) {
                console.log("Skipping resize during XR session.");
                return; // Don't resize canvas while XR is active
            }
            // --- End Add check ---

            if (!cameraRef.current || !rendererRef.current || !container)
                return;

            const width = container.clientWidth;
            const height = container.clientHeight;

            cameraRef.current.aspect = width / height;
            cameraRef.current.updateProjectionMatrix();

            // This call is now safe because we return early if XR is presenting
            rendererRef.current.setSize(width, height);

            render(); // Call fallback render only if not in XR
        }
        window.addEventListener("resize", onWindowResize, false);

        // --- Render Loop ---
        function render() {
            // Check if renderer is presenting XR session
            if (rendererRef.current?.xr.isPresenting) {
                // Let the XR session handle rendering via onXRFrame
                return;
            }
            // Fallback for non-XR rendering (if needed)
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        }

        // --- WebXR Frame Loop ---
        function onXRFrame(time: number, frame: XRFrame) {
            const session = frame.session;
            if (!session) return;
            session.requestAnimationFrame(onXRFrame); // Request next frame

            const baseLayer = session.renderState.baseLayer;
            const currentRenderer = rendererRef.current; // Get renderer reference
            if (
                !baseLayer ||
                !xrRefSpace ||
                !gl ||
                !testBoxRef.current ||
                !currentRenderer
            ) {
                // console.warn("Skipping frame: Missing essentials."); // Keep this less verbose if needed
                return;
            }

            // Bind GL context to the XR session's layer
            gl.bindFramebuffer(gl.FRAMEBUFFER, baseLayer.framebuffer);

            const pose = frame.getViewerPose(xrRefSpace);
            if (pose) {
                let imageTrackedThisFrame = false; // Use a frame-specific flag
                const results = frame.getImageTrackingResults();

                for (const result of results) {
                    if (result.trackingState === "tracked") {
                        imageTrackedThisFrame = true;
                        const imagePose = frame.getPose(
                            result.imageSpace,
                            xrRefSpace
                        );

                        if (
                            imagePose &&
                            testBoxRef.current &&
                            isModelPlacedRef.current
                        ) {
                            // --- Apply Pose Matrix ---
                            testBoxRef.current.matrix.fromArray(
                                imagePose.transform.matrix
                            );

                            // --- Ensure Visibility ---
                            if (!testBoxRef.current.visible) {
                                console.log("Setting testBox visible");
                                testBoxRef.current.visible = true;
                            }
                        }
                        break; // Use first tracked image
                    }
                }

                // Update visibility based on tracking status for this frame
                if (testBoxRef.current && isModelPlacedRef.current) {
                    if (!imageTrackedThisFrame && testBoxRef.current.visible) {
                        console.log(
                            "Setting testBox invisible (tracking lost)"
                        );
                        testBoxRef.current.visible = false;
                    }
                }

                // --- Render the Scene for the XR Frame ---
                // Update camera projection matrix for each view
                for (const view of pose.views) {
                    const viewport = baseLayer.getViewport(view);
                    if (!viewport) continue;

                    currentRenderer.setSize(
                        viewport.width,
                        viewport.height,
                        false
                    ); // Update size without style change
                    // Use the view's projection and view matrices
                    cameraRef.current?.projectionMatrix.fromArray(
                        view.projectionMatrix
                    );
                    cameraRef.current?.matrixWorldInverse.fromArray(
                        view.transform.inverse.matrix
                    );
                    cameraRef.current?.matrixWorld.fromArray(
                        view.transform.matrix
                    ); // Update camera world matrix too
                    cameraRef.current?.matrixWorld.decompose(
                        cameraRef.current.position,
                        cameraRef.current.quaternion,
                        cameraRef.current.scale
                    );

                    currentRenderer.setViewport(
                        viewport.x,
                        viewport.y,
                        viewport.width,
                        viewport.height
                    );
                    currentRenderer.render(
                        sceneRef.current!,
                        cameraRef.current!
                    );
                }
            } else {
                // Hide if viewer pose is lost
                if (
                    testBoxRef.current &&
                    isModelPlacedRef.current &&
                    testBoxRef.current.visible
                ) {
                    console.log("Setting testBox invisible (viewer pose lost)");
                    testBoxRef.current.visible = false;
                }
            }
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
                    // --- IMPORTANT: Set animation loop on the renderer ---
                    currentRenderer.setAnimationLoop(onXRFrame); // Use renderer's loop
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
                        })
                        .catch((err) => console.error("Ref space error:", err));
                })
                .catch((err) => console.error("Set session error:", err));

            if (buttonRef.current) buttonRef.current.textContent = "EXIT AR";
            currentSessionRef.current = session;
            setIsARPresenting(true);
            if (testBoxRef.current) testBoxRef.current.visible = false;
        }

        function onSessionEnded() {
            const currentRenderer = rendererRef.current;
            if (currentRenderer) {
                currentRenderer.setAnimationLoop(null);
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
                    trackedImages: [{ image: imgBitmap!, widthInMeters: 0.1 }],
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
