"use client";
import { useEffect, useRef, useState } from "react";
import {
    AmbientLight,
    BoxGeometry,
    DirectionalLight,
    Mesh,
    MeshStandardMaterial,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
    Event,
} from "three";

const DemoScene: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const arFuncRef = useRef<() => void>(() => {});
    const [imgBitmap, setImgBitmap] = useState<ImageBitmap | null>(null);

    // Refs for Three.js objects to persist across renders
    const rendererRef = useRef<WebGLRenderer | null>(null);
    const sceneRef = useRef<Scene | null>(null);
    const cameraRef = useRef<PerspectiveCamera | null>(null);
    const earthCubeRef = useRef<Mesh | null>(null); // Ref for the cube
    const xrRefSpaceRef = useRef<XRReferenceSpace | null>(null);
    const currentSessionRef = useRef<XRSession | null>(null);

    // Effect for one-time setup of Three.js scene, camera, renderer
    useEffect(() => {
        if (typeof window === "undefined" || !containerRef.current) return;

        console.log("Setting up Three.js scene...");

        // Create the scene and add objects/lights.
        const scene = new Scene();
        sceneRef.current = scene;

        // Earth cube
        const geometry1 = new BoxGeometry(0.1, 0.1, 0.1);
        const material1 = new MeshStandardMaterial({ color: 0xcc6600 });
        const earthCube = new Mesh(geometry1, material1);
        earthCubeRef.current = earthCube; // Store cube in ref
        scene.add(earthCube);

        // Lighting
        const ambient = new AmbientLight(0x222222);
        scene.add(ambient);
        const directionalLight = new DirectionalLight(0xdddddd, 1.5);
        directionalLight.position.set(0.9, 1, 0.6).normalize();
        scene.add(directionalLight);
        const directionalLight2 = new DirectionalLight(0xdddddd, 1);
        directionalLight2.position.set(-0.9, -1, -0.4).normalize();
        scene.add(directionalLight2);

        // Set up camera and renderer.
        const camera = new PerspectiveCamera(
            80,
            window.innerWidth / window.innerHeight,
            0.1,
            20000
        );
        cameraRef.current = camera;

        const renderer = new WebGLRenderer({
            antialias: true,
            alpha: true,
        });
        rendererRef.current = renderer;

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.xr.enabled = true;

        // Append renderer to the container div.
        containerRef.current.appendChild(renderer.domElement);

        // Adjust the canvas on window resize.
        const onWindowResize = () => {
            if (cameraRef.current && rendererRef.current) {
                cameraRef.current.aspect =
                    window.innerWidth / window.innerHeight;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(
                    window.innerWidth,
                    window.innerHeight
                );
            }
        };
        window.addEventListener("resize", onWindowResize, false);

        // Initial render
        const render = () => {
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        };
        render(); // Perform an initial render

        // Cleanup function for this effect
        const localContainer = containerRef.current; // Capture containerRef.current
        return () => {
            console.log("Cleaning up Three.js scene...");
            window.removeEventListener("resize", onWindowResize);
            if (localContainer && rendererRef.current?.domElement) {
                try {
                    localContainer.removeChild(rendererRef.current.domElement);
                } catch (e) {
                    console.warn("Failed to remove renderer DOM element:", e);
                }
            }
            // Dispose of renderer and its context
            rendererRef.current?.dispose();
            rendererRef.current = null;
            sceneRef.current = null;
            cameraRef.current = null;
            earthCubeRef.current = null; // Clear cube ref
            // Ensure any active XR session is ended
            if (currentSessionRef.current) {
                console.log("Ending XR session from cleanup...");
                currentSessionRef.current
                    .end()
                    .catch((err) =>
                        console.warn("Error ending session on cleanup:", err)
                    );
                currentSessionRef.current = null;
            }
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    // Effect for handling image loading and AR logic
    useEffect(() => {
        if (
            typeof window === "undefined" ||
            !rendererRef.current ||
            !sceneRef.current ||
            !cameraRef.current ||
            !earthCubeRef.current
        )
            return;

        // --- Image Loading ---
        const currentImgRef = imgRef.current;
        const handleImageLoad = () => {
            if (currentImgRef) {
                createImageBitmap(currentImgRef)
                    .then((bitmap) => {
                        setImgBitmap(bitmap);
                        console.log("ImageBitmap created for DemoScene.");
                    })
                    .catch((err) =>
                        console.error(
                            "Error creating ImageBitmap in DemoScene:",
                            err
                        )
                    );
            }
        };

        if (currentImgRef?.complete && currentImgRef.naturalHeight !== 0) {
            handleImageLoad();
        } else if (currentImgRef) {
            currentImgRef.addEventListener("load", handleImageLoad);
        }

        // --- AR Logic ---
        const renderer = rendererRef.current; // Get objects from refs
        const scene = sceneRef.current;
        const camera = cameraRef.current;
        const earthCube = earthCubeRef.current;
        let gl = renderer.getContext(); // Get context here

        const render = () => {
            renderer.render(scene, camera);
        };

        const getXRSessionInit = (
            mode: string,
            options: {
                referenceSpaceType?: XRReferenceSpaceType;
                sessionInit?: XRSessionInit;
            }
        ): XRSessionInit => {
            // ... (getXRSessionInit function remains the same)
            if (options && options.referenceSpaceType) {
                renderer.xr.setReferenceSpaceType(options.referenceSpaceType);
            }
            const space = options.referenceSpaceType || "local-floor";
            const sessionInit = options.sessionInit || {};

            if (space === "viewer") return sessionInit;
            if (space === "local" && mode.startsWith("immersive"))
                return sessionInit;
            if (
                (sessionInit.optionalFeatures &&
                    sessionInit.optionalFeatures.includes(space)) ||
                (sessionInit.requiredFeatures &&
                    sessionInit.requiredFeatures.includes(space))
            ) {
                return sessionInit;
            }
            const newInit = { ...sessionInit, requiredFeatures: [space] };
            if (sessionInit.requiredFeatures) {
                newInit.requiredFeatures = newInit.requiredFeatures.concat(
                    sessionInit.requiredFeatures as (
                        | "local"
                        | "local-floor"
                        | "bounded-floor"
                        | "unbounded"
                    )[]
                );
            }
            return newInit;
        };

        const onXRFrame = (t: number, frame: XRFrame) => {
            const session = frame.session;
            session.requestAnimationFrame(onXRFrame); // Request next frame

            if (!xrRefSpaceRef.current) return; // Ensure ref space is available

            const baseLayer = session.renderState.baseLayer;
            const pose = frame.getViewerPose(xrRefSpaceRef.current);

            render(); // Render the scene first

            if (pose) {
                for (const view of pose.views) {
                    const viewport = baseLayer?.getViewport(view);
                    if (viewport && gl) {
                        // Check gl context
                        gl.viewport(
                            viewport.x,
                            viewport.y,
                            viewport.width,
                            viewport.height
                        );
                    }
                    // Process image-tracking results.
                    const results: Iterable<XRImageTrackingResult> =
                        frame.getImageTrackingResults();
                    for (const result of results) {
                        const pose1 = frame.getPose(
                            result.imageSpace,
                            xrRefSpaceRef.current // Use ref space from ref
                        );
                        if (pose1) {
                            const pos = pose1.transform.position;
                            const quat = pose1.transform.orientation;
                            earthCube.position.set(pos.x, pos.y, pos.z);
                            earthCube.quaternion.set(
                                quat.x,
                                quat.y,
                                quat.z,
                                quat.w
                            );
                        }
                    }
                }
            }
        };

        const AR = () => {
            const onSessionStarted = (session: XRSession) => {
                session.addEventListener("end", onSessionEnded);
                renderer.xr.setSession(session);
                gl = renderer.getContext(); // Re-get context in case it was lost
                if (buttonRef.current) {
                    buttonRef.current.style.display = "none";
                    buttonRef.current.textContent = "EXIT AR";
                }
                currentSessionRef.current = session; // Store session in ref
                session.requestReferenceSpace("local").then((refSpace) => {
                    xrRefSpaceRef.current = refSpace; // Store ref space in ref
                    session.requestAnimationFrame(onXRFrame);
                });
            };

            const onSessionEnded = () => {
                if (currentSessionRef.current) {
                    currentSessionRef.current.removeEventListener(
                        "end",
                        onSessionEnded
                    );
                }
                renderer.xr.setSession(null);
                if (buttonRef.current) {
                    buttonRef.current.textContent = "ENTER AR";
                    buttonRef.current.style.display = "";
                }
                currentSessionRef.current = null;
                xrRefSpaceRef.current = null; // Clear ref space
                // Stop requesting frames if session ends unexpectedly
                // (requestAnimationFrame is usually stopped automatically, but good practice)
            };

            if (currentSessionRef.current === null) {
                if (!imgBitmap) {
                    console.error("Image Bitmap not ready for AR session.");
                    alert("Tracking image not loaded yet. Please wait.");
                    return;
                }
                const options = {
                    requiredFeatures: ["dom-overlay", "image-tracking"],
                    trackedImages: [
                        {
                            image: imgBitmap,
                            widthInMeters: 0.2,
                        },
                    ],
                    domOverlay: { root: containerRef.current || document.body },
                };
                const sessionInit = getXRSessionInit("immersive-ar", {
                    referenceSpaceType: "local",
                    sessionInit: options,
                });
                if (navigator.xr) {
                    navigator.xr
                        .requestSession("immersive-ar", sessionInit)
                        .then(onSessionStarted)
                        .catch((err) => {
                            console.error("Failed to request AR session:", err);
                            onSessionEnded(); // Ensure UI resets if request fails
                        });
                } else {
                    console.error("WebXR not supported by your browser.");
                    alert("WebXR is not supported on this device/browser.");
                }
            } else {
                currentSessionRef.current.end();
            }
        };

        // Assign AR function to ref
        arFuncRef.current = AR;

        // Add session event listeners (consider moving to one-time setup if they don't depend on state/props)
        const handleSessionStart = (ev: Event) => {
            console.log("sessionstart", ev);
            document.body.style.backgroundColor = "rgba(0, 0, 0, 0)";
            renderer.domElement.style.display = "none";
        };
        const handleSessionEnd = (ev: Event) => {
            console.log("sessionend", ev);
            document.body.style.backgroundColor = "";
            renderer.domElement.style.display = "";
        };

        renderer.xr.addEventListener("sessionstart", handleSessionStart);
        renderer.xr.addEventListener("sessionend", handleSessionEnd);

        // Cleanup for this effect
        return () => {
            console.log("Cleaning up AR logic / image listener...");
            // Remove image load listener
            if (currentImgRef) {
                currentImgRef.removeEventListener("load", handleImageLoad);
            }
            // Remove XR session listeners
            renderer?.xr?.removeEventListener(
                "sessionstart",
                handleSessionStart
            );
            renderer?.xr?.removeEventListener("sessionend", handleSessionEnd);
            // Note: Session end is handled by the main cleanup, but removing listeners here is good practice.
        };
    }, [imgBitmap]); // Dependency array includes imgBitmap

    // --- JSX Return ---
    return (
        <div className="relative h-screen w-screen bg-black">
            {/* Hidden image element required for createImageBitmap */}
            <img
                id="bitmap"
                ref={imgRef}
                src="/markers/Lego-Part.png"
                alt="tracking"
                className="hidden"
                crossOrigin="anonymous"
            />
            {/* Container in which the Three.js renderer will be attached */}
            <div ref={containerRef} className="absolute inset-0" />
            {/* AR control button styled with Tailwind CSS */}
            <button
                ref={buttonRef}
                onClick={() => arFuncRef.current()}
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-blue-600 text-white rounded z-10" // Added z-index
            >
                ENTER AR
            </button>
        </div>
    );
};

export default DemoScene;
