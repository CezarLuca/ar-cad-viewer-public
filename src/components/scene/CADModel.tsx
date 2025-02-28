"use client";

import * as THREE from "three";
import { useGLTF, useTexture } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useModelConfig } from "@/context/ModelConfigContext";

type GLTFResult = GLTF & {
    nodes: {
        Suzanne: THREE.Mesh;
    };
    materials: {
        Material: THREE.MeshStandardMaterial;
    };
};

export default function CADModel({ url }: { url: string }) {
    const meshRef = useRef<THREE.Mesh>(null!);
    const { config } = useModelConfig();
    // const { nodes, materials } = useGLTF(url) as GLTFResult;
    const { nodes } = useGLTF(url) as GLTFResult;

    const [metalness, roughness] = useTexture([
        "/textures/metalness.jpg",
        "/textures/roughness.jpg",
    ]);

    // State for manual controls
    // const [scale] = useState(1);

    // // Auto-rotation
    // useFrame((state, delta) => {
    //     meshRef.current.rotation.y += delta * 0.1;
    // });

    // Optional: Smooth transitions
    useFrame(() => {
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
    });

    return (
        <>
            <mesh
                ref={meshRef}
                geometry={nodes.Suzanne.geometry}
                scale={1}
                position={config.position}
                rotation={config.rotation}
                castShadow
                receiveShadow
            >
                <meshPhysicalMaterial
                    metalnessMap={metalness}
                    roughnessMap={roughness}
                    color="#ffffff"
                    metalness={0.8}
                    roughness={0.3}
                    envMapIntensity={2}
                />
            </mesh>
        </>
    );
}

// Preload model (important for Next.js)
useGLTF.preload("/models/engine.glb");
