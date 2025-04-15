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

export const useARThreeScene = (
    containerRef: React.RefObject<HTMLDivElement | null>
) => {
    const rendererRef = useRef<WebGLRenderer | null>(null);
    const sceneRef = useRef<Scene | null>(null);
    const cameraRef = useRef<PerspectiveCamera | null>(null);
    const earthCubeRef = useRef<Mesh | null>(null);

    useEffect(() => {
        if (typeof window === "undefined" || !containerRef.current) return;

        // Setup scene
        const scene = new Scene();
        sceneRef.current = scene;

        // Create cube (Earth)
        const geometry = new BoxGeometry(0.1, 0.1, 0.1);
        const material = new MeshStandardMaterial({ color: 0xcc6600 });
        const cube = new Mesh(geometry, material);
        earthCubeRef.current = cube;
        scene.add(cube);

        // Add lighting
        scene.add(new AmbientLight(0x222222));
        const directionalLight = new DirectionalLight(0xdddddd, 1.5);
        directionalLight.position.set(0.9, 1, 0.6).normalize();
        scene.add(directionalLight);
        const directionalLight2 = new DirectionalLight(0xdddddd, 1);
        directionalLight2.position.set(-0.9, -1, -0.4).normalize();
        scene.add(directionalLight2);

        // Setup camera
        const camera = new PerspectiveCamera(
            80,
            window.innerWidth / window.innerHeight,
            0.1,
            20000
        );
        cameraRef.current = camera;

        // Setup renderer
        const renderer = new WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.xr.enabled = true;
        rendererRef.current = renderer;

        // Capture container ref value
        const localContainer = containerRef.current;
        localContainer.appendChild(renderer.domElement);

        // Resize handler
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

        // Initial render call
        renderer.render(scene, camera);

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
            earthCubeRef.current = null;
        };
    }, [containerRef]);

    return { rendererRef, sceneRef, cameraRef, earthCubeRef };
};
