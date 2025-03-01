"use client";

import * as THREE from "three";
import { useGLTF, useTexture } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useModelConfig } from "@/context/ModelConfigContext";

// More flexible type definition that doesn't assume a specific mesh name
type GLTFResult = GLTF & {
    nodes: Record<string, THREE.Mesh>;
    materials: Record<string, THREE.Material>;
};

export default function CADModel({ url }: { url: string }) {
    const meshRef = useRef<THREE.Mesh>(null!);
    const { config } = useModelConfig();
    // const { nodes, materials } = useGLTF(url) as GLTFResult;
    const { nodes } = useGLTF(url) as GLTFResult;
    const [mainMesh, setMainMesh] = useState<THREE.Mesh | null>(null);

    const [metalness, roughness] = useTexture([
        "/textures/metalness.jpg",
        "/textures/roughness.jpg",
    ]);

    // Identify the first available mesh in the model
    useEffect(() => {
        if (nodes) {
            // Get the first mesh from the nodes object
            const firstMeshKey = Object.keys(nodes).find(
                (key) => nodes[key].isMesh
            );
            if (firstMeshKey) {
                setMainMesh(nodes[firstMeshKey]);
                console.log("Found mesh:", firstMeshKey);
            } else {
                console.error("No mesh found in the loaded model");
                console.log("Available nodes:", Object.keys(nodes));
            }
        }
    }, [nodes]);

    // Optional: Smooth transitions
    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.position.lerp(
                new THREE.Vector3(...config.position),
                0.1
            );
            meshRef.current.rotation.set(
                THREE.MathUtils.lerp(
                    meshRef.current.rotation.x,
                    config.rotation[0],
                    0.1
                ),
                THREE.MathUtils.lerp(
                    meshRef.current.rotation.y,
                    config.rotation[1],
                    0.1
                ),
                THREE.MathUtils.lerp(
                    meshRef.current.rotation.z,
                    config.rotation[2],
                    0.1
                )
            );
        }
    });

    if (!mainMesh) return null;

    return (
        <>
            <mesh
                ref={meshRef}
                geometry={mainMesh.geometry}
                scale={0.01}
                position={config.position}
                rotation={config.rotation}
                castShadow
                receiveShadow
            >
                <meshPhysicalMaterial
                    metalnessMap={metalness}
                    roughnessMap={roughness}
                    color="#a0a0a0"
                    metalness={0.8}
                    roughness={0.8}
                    envMapIntensity={2}
                />
            </mesh>
        </>
    );
}

// Preload model - use the same URL that will be passed to the component
useGLTF.preload("/models/engine.glb");
