import { NodeIO, Document, Scene } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
    getMeshVertexCount,
    getBounds,
    inspect,
    VertexCountMethod,
} from "@gltf-transform/functions";
import { Group, Raycaster, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export interface ModelInfo {
    volume?: number;
    dimensions?: { x: number; y: number; z: number };
    preciseVolume?: number;
    accuracy?: number;
}

export interface ValidationResult {
    isValid: boolean;
    error?: string;
    modelInfo?: ModelInfo;
}

export interface FileValidationError {
    type:
        | "parse"
        | "noMeshes"
        | "noGeometry"
        | "noScenes"
        | "invalidDimensions"
        | "validation";
    message: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DIMENSION = 10000;

export function validateFileBasics(file: File): FileValidationError | null {
    if (!file.name.endsWith(".glb")) {
        return {
            type: "parse",
            message: "Only .glb files are supported",
        };
    }

    if (file.type && file.type !== "model/gltf-binary") {
        return {
            type: "parse",
            message: "The file doesn't appear to be a valid GLB file",
        };
    }

    if (file.size > MAX_FILE_SIZE) {
        return {
            type: "parse",
            message: "File size exceeds the 10MB limit",
        };
    }

    if (file.size === 0) {
        return {
            type: "parse",
            message: "File is empty",
        };
    }

    return null;
}

export async function validateGLTFStructure(arrayBuffer: ArrayBuffer): Promise<{
    document: Document | null;
    error?: FileValidationError;
}> {
    const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);

    try {
        const document = await io.readBinary(new Uint8Array(arrayBuffer));
        return { document };
    } catch (error) {
        return {
            document: null,
            error: {
                type: "parse",
                message: `Failed to parse GLB file: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            },
        };
    }
}

export function validateMeshes(document: Document): FileValidationError | null {
    const summary = inspect(document);

    if (summary.meshes.properties.length === 0) {
        return {
            type: "noMeshes",
            message: "Invalid GLB file: No meshes found in the model",
        };
    }

    let totalVertexCount = 0;
    document
        .getRoot()
        .listMeshes()
        .forEach((mesh) => {
            totalVertexCount += getMeshVertexCount(
                mesh,
                VertexCountMethod.RENDER
            );
        });

    if (totalVertexCount === 0) {
        return {
            type: "noGeometry",
            message: "Invalid GLB file: Model contains no geometry",
        };
    }

    return null;
}

export function validateScenes(document: Document): {
    error?: FileValidationError;
    bounds?: ReturnType<typeof getBounds>;
    scene?: Scene;
} {
    const scenes = document.getRoot().listScenes();

    if (scenes.length === 0) {
        return {
            error: {
                type: "noScenes",
                message: "Invalid GLB file: No scenes found in the model",
            },
        };
    }

    const bounds = getBounds(scenes[0]);
    return { bounds, scene: scenes[0] };
}

export function validateDimensions(bounds: ReturnType<typeof getBounds>): {
    error?: FileValidationError;
    warning?: string;
    dimensions?: { x: number; y: number; z: number };
    volume?: number;
} {
    const size = {
        x: bounds.max[0] - bounds.min[0],
        y: bounds.max[1] - bounds.min[1],
        z: bounds.max[2] - bounds.min[2],
    };

    const volume = size.x * size.y * size.z;

    if (
        Object.values(size).some((val) => !isFinite(val) || isNaN(val)) ||
        !isFinite(volume) ||
        isNaN(volume) ||
        volume <= 0
    ) {
        return {
            error: {
                type: "invalidDimensions",
                message: "Invalid GLB file: Model has invalid dimensions",
            },
        };
    }

    const maxDimension = Math.max(size.x, size.y, size.z);
    const warning =
        maxDimension > MAX_DIMENSION
            ? "Warning: Model has very large dimensions. Consider scaling it down."
            : undefined;

    return { dimensions: size, volume, warning };
}

export async function calculatePreciseVolume(
    arrayBuffer: ArrayBuffer,
    bounds: ReturnType<typeof getBounds>,
    volume: number
): Promise<{ preciseVolume: number; accuracy: number }> {
    try {
        const blob = new Blob([arrayBuffer], { type: "model/gltf-binary" });
        const blobUrl = URL.createObjectURL(blob);

        const loader = new GLTFLoader();
        const gltf = await new Promise<{ scene: Group }>((resolve, reject) => {
            loader.load(blobUrl, resolve, undefined, reject);
        });

        const size = {
            x: bounds.max[0] - bounds.min[0],
            y: bounds.max[1] - bounds.min[1],
            z: bounds.max[2] - bounds.min[2],
        };

        const raycaster = new Raycaster();
        const samples = 100;
        let pointsInside = 0;

        for (let i = 0; i < samples; i++) {
            const point = new Vector3(
                bounds.min[0] + Math.random() * size.x,
                bounds.min[1] + Math.random() * size.y,
                bounds.min[2] + Math.random() * size.z
            );

            let intersectionCount = 0;
            const directions = [
                new Vector3(1, 0, 0),
                new Vector3(0, 1, 0),
                new Vector3(0, 0, 1),
                new Vector3(-1, 0, 0),
                new Vector3(0, -1, 0),
                new Vector3(0, 0, -1),
            ];

            for (const dir of directions) {
                raycaster.set(point, dir);
                const intersections = raycaster.intersectObject(
                    gltf.scene,
                    true
                );
                if (intersections.length % 2 === 1) {
                    intersectionCount++;
                }
            }

            if (intersectionCount > directions.length / 2) {
                pointsInside++;
            }
        }

        const preciseVolume = volume * (pointsInside / samples);
        const marginOfError =
            1.96 *
            Math.sqrt(
                ((pointsInside / samples) * (1 - pointsInside / samples)) /
                    samples
            );
        const accuracy = 1 - marginOfError;

        URL.revokeObjectURL(blobUrl);

        return { preciseVolume, accuracy };
    } catch (error) {
        console.error("Monte Carlo calculation error:", error);
        throw error;
    }
}
