"use client";

import { useEffect, useRef } from "react";
import {
    AmbientLight,
    DirectionalLight,
    GridHelper,
    Group,
    Mesh,
    MeshStandardMaterial,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface ThreeJsLogoProps {
    width?: number;
    height?: number;
    modelPath?: string;
}

const DEFAULT_WIDTH = 300;
const DEFAULT_HEIGHT = 100;
const DEFAULT_MODEL_PATH = "/models/threejs_logo.glb";

const ThreeJsLogo = ({
    width = DEFAULT_WIDTH,
    height = DEFAULT_HEIGHT,
    modelPath = DEFAULT_MODEL_PATH,
}: ThreeJsLogoProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const currentContainer = containerRef.current;

        const scene = new Scene();
        const camera = new PerspectiveCamera(75, width / height, 0.1, 1000);
        const renderer = new WebGLRenderer({ antialias: true, alpha: true });

        renderer.setSize(width, height);
        containerRef.current.appendChild(renderer.domElement);

        const ambientLight = new AmbientLight(0xf3f3f3, 1.5);
        scene.add(ambientLight);
        const directionalLight = new DirectionalLight(0xffffff, 2);
        directionalLight.position.set(5, 5, 5).normalize();
        scene.add(directionalLight);

        const gridHelper = new GridHelper(10, 10, 0x0088ff, 0x004477);
        gridHelper.position.y = -2;
        scene.add(gridHelper);

        const group = new Group();
        scene.add(group);

        const loader = new GLTFLoader();
        loader.load(
            modelPath,
            (gltf) => {
                const model = gltf.scene;
                model.traverse((child) => {
                    if (child instanceof Mesh) {
                        child.material = new MeshStandardMaterial({
                            color: 0xffffff,
                            emissive: 0x000000,
                            emissiveIntensity: 0.2,
                            roughness: 0.1,
                            metalness: 0.9,
                        });
                    }
                });
                model.scale.set(1, 1, 1);
                model.rotateY(Math.PI / 2);
                group.add(model);
            },
            undefined,
            (error) => {
                console.error("Error loading model:", error);
            }
        );

        camera.position.z = 6;
        camera.position.y = 3;
        camera.lookAt(0, 0, 0);

        const animate = () => {
            requestAnimationFrame(animate);
            if (group) {
                group.rotation.y += 0.01;
            }
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            if (currentContainer) {
                currentContainer.removeChild(renderer.domElement);
            }
            renderer.dispose();
            scene.clear();
            group.clear();
            group.removeFromParent();
            ambientLight.dispose();
            directionalLight.dispose();
            renderer.dispose();
            camera.clear();
            camera.removeFromParent();
            scene.removeFromParent();
            renderer.forceContextLoss();
        };
    }, [width, height, modelPath]);

    return <div ref={containerRef} style={{ width: width, height: height }} />;
};

export default ThreeJsLogo;
