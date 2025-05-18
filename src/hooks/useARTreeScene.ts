import { useEffect, useRef, useState } from "react";
import {
    AmbientLight,
    Mesh,
    MeshStandardMaterial,
    DirectionalLight,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
    Group,
    TextureLoader,
    Color,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export const useARThreeScene = (
    containerRef: React.RefObject<HTMLDivElement | null>,
    modelUrl: string = "/models/engine.glb"
) => {
    const rendererRef = useRef<WebGLRenderer | null>(null);
    const sceneRef = useRef<Scene | null>(null);
    const cameraRef = useRef<PerspectiveCamera | null>(null);
    const cubeRef = useRef<Group | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window === "undefined" || !containerRef.current) return;

        console.log(`AR Scene: Attempting to load model from: ${modelUrl}`);
        setLoadError(null);

        // Setup scene
        const scene = new Scene();
        sceneRef.current = scene;

        // Create a group that will act as a parent for our model
        // This is what we'll use for positioning during AR tracking
        const modelGroup = new Group();
        cubeRef.current = modelGroup;
        scene.add(modelGroup);

        // Load the model specified in modelUrl
        const gltfLoader = new GLTFLoader();
        gltfLoader.load(
            modelUrl,
            (gltf) => {
                console.log(
                    `AR Scene: Successfully loaded model from ${modelUrl}`
                );

                // Clear any existing children from the model group
                while (modelGroup.children.length > 0) {
                    modelGroup.remove(modelGroup.children[0]);
                }

                // Find the first mesh in the model
                let mainMesh: Mesh | null = null;
                gltf.scene.traverse((child) => {
                    if (!mainMesh && child instanceof Mesh) {
                        mainMesh = child;
                    }
                });

                if (mainMesh) {
                    console.log(`AR Scene: Found valid mesh in the model`);
                    const textureLoader = new TextureLoader();
                    const metalness = textureLoader.load(
                        "/textures/metalness.jpg"
                    );
                    const roughness = textureLoader.load(
                        "/textures/roughness.jpg"
                    );

                    // Clone the mesh and apply materials
                    const modelMesh = (mainMesh as Mesh).clone();
                    modelMesh.material = new MeshStandardMaterial({
                        metalnessMap: metalness,
                        roughnessMap: roughness,
                        color: new Color(0xe0e0e0),
                        metalness: 0.9,
                        roughness: 0.1,
                        envMapIntensity: 1.5,
                    });
                    modelMesh.castShadow = true;
                    modelMesh.receiveShadow = true;

                    // Add the mesh to our tracking group
                    modelGroup.add(modelMesh);
                } else {
                    const errorMsg = `No mesh found in the loaded model from ${modelUrl}`;
                    console.error(`AR Scene: ${errorMsg}`);
                    setLoadError(errorMsg);
                }
            },
            (progress) => {
                const percentComplete =
                    (progress.loaded / progress.total) * 100;
                console.log(
                    `AR Scene: Loading model: ${Math.round(
                        percentComplete
                    )}% complete`
                );
            },
            (error) => {
                const errorMsg = `Failed to load model from ${modelUrl}: ${error}`;
                console.error(`AR Scene: ${errorMsg}`);
                setLoadError(errorMsg);

                // If we failed with a custom URL and it's not the default already,
                // we could try to load the default one here, but for now we just report the error
            }
        );

        // Enhance lighting for better visibility and highlights
        // Ambient light
        scene.add(new AmbientLight(0xffffff, 0.8));

        // Key light (main directional light)
        const keyLight = new DirectionalLight(0xffffff, 2.5);
        keyLight.position.set(1, 2, 1).normalize();
        keyLight.castShadow = true;
        scene.add(keyLight);

        // Fill light (softer, from opposite direction)
        const fillLight = new DirectionalLight(0xffffff, 1.8);
        fillLight.position.set(-1, 0.5, -0.5).normalize();
        scene.add(fillLight);

        // Rim light (for edge highlighting)
        const rimLight = new DirectionalLight(0xffffff, 1.5);
        rimLight.position.set(0, -1, -0.5).normalize();
        scene.add(rimLight);

        // Setup camera
        const camera = new PerspectiveCamera(
            80,
            window.innerWidth / window.innerHeight,
            0.1,
            20000
        );
        cameraRef.current = camera;

        // Setup renderer
        const renderer = new WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.xr.enabled = true;
        renderer.shadowMap.enabled = true;
        rendererRef.current = renderer;

        // Capture container ref value
        const localContainer = containerRef.current;
        localContainer.appendChild(renderer.domElement);

        // Resize handler
        const onWindowResize = () => {
            // don't resize while an XR session is presenting
            if (rendererRef.current?.xr.isPresenting) return;

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

        // Cleanup
        return () => {
            window.removeEventListener("resize", onWindowResize);
            if (localContainer && renderer.domElement) {
                localContainer.removeChild(renderer.domElement);
            }
            renderer.dispose();
            rendererRef.current = null;
            sceneRef.current = null;
            cameraRef.current = null;
        };
    }, [containerRef, modelUrl]);

    return { rendererRef, sceneRef, cameraRef, cubeRef, loadError };
};
