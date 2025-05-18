"use client";

import {
    Mesh,
    Vector3,
    MathUtils,
    Material,
    MeshStandardMaterial as ThreeMeshStandardMaterial,
    MeshBasicMaterial as ThreeMeshBasicMaterial,
} from "three";
import { useGLTF, useTexture } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useModelConfig } from "@/context/ModelConfigContext";
import { useModelUrl } from "@/context/ModelUrlContext";

type GLTFResult = GLTF & {
    nodes: Record<string, Mesh>;
    materials: Record<string, Material>;
};

function materialIsStandard(
    material: Material
): material is ThreeMeshStandardMaterial {
    return (
        (material as ThreeMeshStandardMaterial).isMeshStandardMaterial === true
    );
}

function materialIsBasic(
    material: Material
): material is ThreeMeshBasicMaterial {
    return (material as ThreeMeshBasicMaterial).isMeshBasicMaterial === true;
}

function isMaterialMonochrome(material: Material | null): boolean {
    if (!material) {
        return false;
    }

    if (materialIsStandard(material)) {
        // If there's a color texture, assume it's not monochrome for this purpose
        if (material.map) {
            return false;
        }
        // Check if the base color is grayscale
        const color = material.color;
        const tolerance = 0.01; // Tolerance for float comparison
        return (
            Math.abs(color.r - color.g) < tolerance &&
            Math.abs(color.g - color.b) < tolerance
        );
    }

    // Check for MeshBasicMaterial
    if (materialIsBasic(material)) {
        if (material.map) {
            return false;
        }
        const color = material.color;
        const tolerance = 0.01;
        return (
            Math.abs(color.r - color.g) < tolerance &&
            Math.abs(color.g - color.b) < tolerance
        );
    }
    return false;
}

export default function CADModel() {
    const { modelUrl } = useModelUrl();
    const meshRef = useRef<Mesh>(null!);
    const { config } = useModelConfig();
    const { nodes, materials } = useGLTF(modelUrl) as unknown as GLTFResult;
    const [mainMesh, setMainMesh] = useState<Mesh | null>(null);
    const [mainMaterial, setMainMaterial] = useState<Material | null>(null);

    const [metalnessMap, roughnessMap] = useTexture([
        "/textures/metalness.jpg",
        "/textures/roughness.jpg",
    ]);

    useEffect(() => {
        if (nodes) {
            const firstMeshKey = Object.keys(nodes).find(
                (key) => nodes[key].isMesh
            );
            if (firstMeshKey) {
                const mesh = nodes[firstMeshKey];
                setMainMesh(mesh);

                let potentialMaterial: Material | null = null;
                if (mesh.material) {
                    if (Array.isArray(mesh.material)) {
                        potentialMaterial =
                            mesh.material.length > 0 ? mesh.material[0] : null;
                    } else {
                        potentialMaterial = mesh.material;
                    }
                } else if (materials && materials[mesh.name]) {
                    potentialMaterial = materials[mesh.name];
                }

                if (isMaterialMonochrome(potentialMaterial)) {
                    // console.log("Monochrome material detected for mesh:", firstMeshKey, ". Using default material.");
                    setMainMaterial(null); // Fallback to default material
                } else {
                    setMainMaterial(potentialMaterial);
                }
            } else {
                console.error("No mesh found in the loaded model");
                console.log("Available nodes:", Object.keys(nodes));
                setMainMesh(null); // Ensure mainMesh is null if not found
                setMainMaterial(null); // Ensure mainMaterial is null if no mesh
            }
        } else {
            setMainMesh(null);
            setMainMaterial(null);
        }
    }, [nodes, materials]); // modelUrl is implicitly a dependency of useGLTF which provides nodes/materials

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
                material={mainMaterial || undefined} // Use existing material if available, or undefined to let child material take over
                scale={config.scale}
                castShadow
                receiveShadow
            >
                {/* Only apply this default material if no material was found OR if it was deemed monochrome */}
                {!mainMaterial && (
                    <meshPhysicalMaterial
                        metalnessMap={metalnessMap}
                        roughnessMap={roughnessMap}
                        color="#a0a0a0" // Default color
                        metalness={0.8}
                        roughness={0.8}
                        envMapIntensity={2}
                    />
                )}
            </mesh>
        </>
    );
}

// Preload model - use the same URL that will be passed to the component
// useGLTF.preload("/models/engine.glb");
