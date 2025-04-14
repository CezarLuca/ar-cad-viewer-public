"use client";
import { useEffect, useRef } from "react";
import {
    AmbientLight,
    BoxGeometry,
    DirectionalLight,
    Mesh,
    MeshStandardMaterial,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
} from "three";

const ARComponent: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    // Store the AR function so it can be invoked from the button
    const arFuncRef = useRef<() => void>(() => {});

    useEffect(() => {
        // Ensure code only runs in the browser (Next.js SSR safeguard)
        if (typeof window === "undefined") return;

        // Prepare an image bitmap that will be used for image-tracking.
        let imgBitmap: ImageBitmap | null = null;
        if (imgRef.current) {
            createImageBitmap(imgRef.current).then((bitmap) => {
                imgBitmap = bitmap;
            });
        }

        let xrRefSpace: XRReferenceSpace;
        let gl: WebGLRenderingContext | null = null;

        // Create the scene and add objects/lights.
        const scene = new Scene();

        // Earth cube
        const geometry1 = new BoxGeometry(0.1, 0.1, 0.1);
        const material1 = new MeshStandardMaterial({ color: 0xcc6600 });
        const earthCube = new Mesh(geometry1, material1);
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
        const renderer = new WebGLRenderer({
            antialias: true,
            alpha: true,
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        camera.aspect = window.innerWidth / window.innerHeight;
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.updateProjectionMatrix();

        // Append renderer to the container div.
        if (containerRef.current) {
            containerRef.current.appendChild(renderer.domElement);
        }
        renderer.xr.enabled = true;

        // Adjust the canvas on window resize.
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        window.addEventListener("resize", onWindowResize, false);

        // Render the scene.
        function render() {
            renderer.render(scene, camera);
        }

        // Compute appropriate session initialization options.
        function getXRSessionInit(
            mode: string,
            options: {
                referenceSpaceType?: XRReferenceSpaceType;
                sessionInit?: XRSessionInit;
            }
        ): XRSessionInit {
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
        }

        // AR functionality.
        let currentSession: XRSession | null = null;

        function onXRFrame(t: number, frame: XRFrame) {
            const session = frame.session;
            session.requestAnimationFrame(onXRFrame);
            const baseLayer = session.renderState.baseLayer;
            const pose = frame.getViewerPose(xrRefSpace);
            render();
            if (pose) {
                for (const view of pose.views) {
                    const viewport = baseLayer?.getViewport(view);
                    if (viewport) {
                        gl?.viewport(
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
                            xrRefSpace
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
                            // Here you can also handle result.trackingState ("tracked" or "emulated")
                        }
                    }
                }
            }
        }

        function AR() {
            // Called when the AR session starts.
            function onSessionStarted(session: XRSession) {
                session.addEventListener("end", onSessionEnded);
                renderer.xr.setSession(session);
                gl = renderer.getContext();
                if (buttonRef.current) {
                    buttonRef.current.style.display = "none";
                    buttonRef.current.textContent = "EXIT AR";
                }
                currentSession = session;
                session.requestReferenceSpace("local").then((refSpace) => {
                    xrRefSpace = refSpace;
                    session.requestAnimationFrame(onXRFrame);
                });
            }
            // Called when the AR session ends.
            function onSessionEnded() {
                if (currentSession) {
                    currentSession.removeEventListener("end", onSessionEnded);
                }
                renderer.xr.setSession(null);
                if (buttonRef.current) {
                    buttonRef.current.textContent = "ENTER AR";
                    buttonRef.current.style.display = "";
                }
                currentSession = null;
            }
            if (currentSession === null) {
                // Build session options – here we add the dom-overlay and image-tracking features.
                const options = {
                    requiredFeatures: ["dom-overlay", "image-tracking"],
                    trackedImages: [
                        {
                            image: imgBitmap!,
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
                        .catch((err) => console.error(err));
                } else {
                    console.error("WebXR not supported by your browser.");
                }
            } else {
                currentSession.end();
            }
            // Optional: add additional listeners to manage the UI when sessions start/end.
            renderer.xr.addEventListener("sessionstart", (ev) => {
                console.log("sessionstart", ev);
                document.body.style.backgroundColor = "rgba(0, 0, 0, 0)";
                renderer.domElement.style.display = "none";
            });
            renderer.xr.addEventListener("sessionend", (ev) => {
                console.log("sessionend", ev);
                document.body.style.backgroundColor = "";
                renderer.domElement.style.display = "";
            });
        }

        // Save the AR function to our ref so it can be invoked from the button.
        arFuncRef.current = AR;

        // Kick off the initial render.
        render();

        // Cleanup on component unmount.
        const localContainer = containerRef.current;
        return () => {
            window.removeEventListener("resize", onWindowResize);
            if (localContainer && renderer) {
                localContainer.removeChild(renderer.domElement);
            }
            if (currentSession) {
                currentSession.end();
            }
        };
    }, []);

    return (
        <div className="relative h-screen w-screen bg-black">
            {/* Hidden image element required for createImageBitmap */}
            <img
                id="bitmap"
                ref={imgRef}
                src="/markers/Lego-Part.png"
                alt="tracking"
                className="hidden"
            />
            {/* Container in which the Three.js renderer will be attached */}
            <div ref={containerRef} className="absolute inset-0" />
            {/* AR control button styled with Tailwind CSS */}
            <button
                ref={buttonRef}
                onClick={() => arFuncRef.current()}
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-blue-600 text-white rounded"
            >
                ENTER AR
            </button>
        </div>
    );
};

export default ARComponent;
