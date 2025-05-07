"use client";

import { useRef, useEffect } from "react";
// import * as THREE from "three";
import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    Mesh,
    BoxGeometry,
    AmbientLight,
    DirectionalLight,
    SphereGeometry,
    ConeGeometry,
    TorusGeometry,
    CylinderGeometry,
    MeshStandardMaterial,
    PolyhedronGeometry,
} from "three";

const MODELED_ELEMENTS = 15;
const MIN_CANVAS_RADIUS = 8;

const ThreeJsBackground = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    //Setup
    useEffect(() => {
        if (!containerRef.current) return;
        const currentContainer = containerRef.current;
        const scene = new Scene();
        const camera = new PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        const renderer = new WebGLRenderer({
            antialias: true,
            alpha: true,
        });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        containerRef.current.appendChild(renderer.domElement);

        const ambientLight = new AmbientLight(0xf9ebea, 1.2);
        scene.add(ambientLight);
        const directionalLight = new DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        const objects: Mesh[] = [];
        const geometries = [
            new BoxGeometry(1, 1, 1),
            new SphereGeometry(0.5, 16, 16),
            new ConeGeometry(0.2, 1, 16),
            new BoxGeometry(0.5, 0.5, 0.5),
            new TorusGeometry(1.2, 0.4, 16, 100),
            new CylinderGeometry(0.5, 0.5, 1, 16),
            new PolyhedronGeometry(
                // Vertices - 4 points forming a tetrahedron
                [
                    1,
                    1,
                    1, // Vertex 0
                    -1,
                    -1,
                    1, // Vertex 1
                    -1,
                    1,
                    -1, // Vertex 2
                    1,
                    -1,
                    -1, // Vertex 3
                ],
                // Faces - each array of 3 numbers represents indices of vertices forming a triangular face
                [
                    0,
                    1,
                    2, // Face 0
                    0,
                    3,
                    1, // Face 1
                    0,
                    2,
                    3, // Face 2
                    1,
                    3,
                    2, // Face 3
                ],
                1, // Radius
                0 // Detail level (0 keeps it as a perfect tetrahedron)
            ),
            new PolyhedronGeometry(
                [
                    0.5, 1.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5,
                    -0.5,
                ],
                [0, 1, 2, 0, 3, 1, 0, 2, 3, 1, 3, 2],
                2,
                0
            ),
            new PolyhedronGeometry(
                [1, 1, 1, -1, -1, 1, -1, 1, -1, 1, -1, -1],
                [0, 1, 2, 0, 3, 1, 0, 2, 3, 1, 3, 2],
                1,
                1
            ),
        ];

        const materials = [
            new MeshStandardMaterial({ color: 0x2ecc71, roughness: 0.3 }),
            new MeshStandardMaterial({ color: 0x3498db, roughness: 0.3 }),
            new MeshStandardMaterial({ color: 0xe74c3c, roughness: 0.3 }),
            new MeshStandardMaterial({ color: 0x9b59b6, roughness: 0.3 }),
            new MeshStandardMaterial({
                color: 0xf1c40f,
                roughness: 0.1,
                metalness: 0.8,
            }),
            new MeshStandardMaterial({
                color: 0x34495e,
                roughness: 0.3,
                transparent: true,
                opacity: 0.7,
                wireframe: true,
            }),
            new MeshStandardMaterial({
                color: 0xe67e22,
                roughness: 0.3,
                transparent: true,
                opacity: 0.7,
                wireframe: true,
            }),
            new MeshStandardMaterial({
                color: 0x2ecc71,
                roughness: 0.3,
                transparent: true,
                opacity: 0.7,
                wireframe: true,
            }),
            new MeshStandardMaterial({
                color: 0x3498db,
                roughness: 0.3,
                transparent: true,
                opacity: 0.7,
                wireframe: true,
            }),
        ];

        // const positions = [
        //     [-2, 0, 0],
        //     [2, 0, 0],
        //     [0, 2, 0],
        //     [0, -2, 0],
        //     [1.5, 1.5, 0],
        //     [-1.5, -1.5, 0],
        // ];

        for (let i = 0; i < MODELED_ELEMENTS; i++) {
            const geometryIndex = Math.floor(Math.random() * geometries.length);
            const materialIndex = Math.floor(Math.random() * materials.length);
            const geometry = geometries[geometryIndex];
            const material = materials[materialIndex];

            const mesh = new Mesh(geometry, material);

            const canvasRadius = (Math.random() + 1) * MIN_CANVAS_RADIUS;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            mesh.position.x = canvasRadius * Math.sin(phi) * Math.cos(theta);
            mesh.position.y = canvasRadius * Math.sin(phi) * Math.sin(theta);
            mesh.position.z = canvasRadius * Math.cos(phi);

            scene.add(mesh);
            objects.push(mesh);
        }

        camera.position.z = 20;

        const animate = () => {
            requestAnimationFrame(animate);
            objects.forEach((object) => {
                object.rotation.x += 0.003;
                object.rotation.y += 0.005;
            });
            renderer.render(scene, camera);
        };

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener("resize", handleResize);
        animate();

        return () => {
            window.removeEventListener("resize", handleResize);
            if (currentContainer) {
                currentContainer.removeChild(renderer.domElement);
            }
            renderer.dispose();
            scene.clear();
            objects.forEach((object) => {
                object.geometry.dispose();
            });
            geometries.forEach((geometry) => {
                geometry.dispose();
            });
            materials.forEach((material) => {
                material.dispose();
            });
            ambientLight.dispose();
            directionalLight.dispose();
            renderer.dispose();
            camera.clear();
            camera.removeFromParent();
            scene.removeFromParent();
            renderer.forceContextLoss();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                zIndex: -1,
                opacity: 0.7,
            }}
            className="dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-700 bg-gradient-to-b from-gray-100 to-gray-400"
        ></div>
    );
};

export default ThreeJsBackground;
