"use client";

// import * as THREE from "three";
import { Mesh, Vector3, MathUtils, Material } from "three";
import { useGLTF, useTexture } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useModelConfig } from "@/context/ModelConfigContext";
import { useModelUrl } from "@/context/ModelUrlContext";

// More flexible type definition that doesn't assume a specific mesh name
type GLTFResult = GLTF & {
    nodes: Record<string, Mesh>;
    materials: Record<string, Material>;
};

export default function CADModel() {
    const { modelUrl } = useModelUrl();
    const meshRef = useRef<Mesh>(null!);
    const { config } = useModelConfig();
    // const { nodes, materials } = useGLTF(url) as GLTFResult;
    const { nodes } = useGLTF(modelUrl) as unknown as GLTFResult;
    const [mainMesh, setMainMesh] = useState<Mesh | null>(null);

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
                // console.log("Found mesh:", firstMeshKey);
            } else {
                console.error("No mesh found in the loaded model");
                console.log("Available nodes:", Object.keys(nodes));
            }
        }
    }, [nodes]);

    // Use the position from context with smooth transitions
    useFrame(() => {
        if (meshRef.current) {
            // Smoothly interpolate to the target position
            meshRef.current.position.lerp(new Vector3(...config.position), 0.1);

            // Smoothly interpolate to the target rotation
            meshRef.current.rotation.set(
                MathUtils.lerp(
                    meshRef.current.rotation.x,
                    config.rotation[0],
                    0.1
                ),
                MathUtils.lerp(
                    meshRef.current.rotation.y,
                    config.rotation[1],
                    0.1
                ),
                MathUtils.lerp(
                    meshRef.current.rotation.z,
                    config.rotation[2],
                    0.1
                )
            );

            // Smoothly interpolate scale if needed (optional, based on your needs)
            // meshRef.current.scale.lerp(new Vector3(...config.scale), 0.5);
        }
    });

    if (!mainMesh) return null;

    return (
        <>
            <mesh
                ref={meshRef}
                geometry={mainMesh.geometry}
                scale={config.scale}
                // position={config.position}
                // rotation={config.rotation}
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
