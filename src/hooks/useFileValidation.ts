import { useState, useEffect } from "react";
import {
    ModelInfo,
    validateFileBasics,
    validateGLTFStructure,
    validateMeshes,
    validateScenes,
    validateDimensions,
    calculatePreciseVolume,
} from "@/utils/fileValidation";

export function useFileValidation(file: File | null) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [warning, setWarning] = useState<string>("");
    const [modelInfo, setModelInfo] = useState<ModelInfo>({});

    useEffect(() => {
        async function validate() {
            if (!file) {
                setModelInfo({});
                setError("");
                setWarning("");
                return;
            }

            setLoading(true);
            setError("");
            setWarning("");

            try {
                // Basic file validation
                const basicError = validateFileBasics(file);
                if (basicError) {
                    setError(basicError.message);
                    setLoading(false);
                    return;
                }

                // Read file
                const arrayBuffer = await file.arrayBuffer();

                // Validate GLTF structure
                const { document, error: structureError } =
                    await validateGLTFStructure(arrayBuffer);
                if (structureError || !document) {
                    setError(
                        structureError?.message ||
                            "Failed to parse GLTF document."
                    );
                    setLoading(false);
                    return;
                }

                // Validate meshes
                const meshError = validateMeshes(document);
                if (meshError) {
                    setError(meshError.message);
                    setLoading(false);
                    return;
                }

                // Validate scenes
                const { error: sceneError, bounds } = validateScenes(document);
                if (sceneError) {
                    setError(sceneError.message);
                    setLoading(false);
                    return;
                }

                // Validate dimensions
                const dimensionResult = validateDimensions(bounds!);
                if (dimensionResult.error) {
                    setError(dimensionResult.error.message);
                    setLoading(false);
                    return;
                }

                if (dimensionResult.warning) {
                    setWarning(dimensionResult.warning);
                }

                // Set initial model info
                setModelInfo({
                    volume: dimensionResult.volume,
                    dimensions: dimensionResult.dimensions,
                });

                // Calculate precise volume (async, non-blocking)
                try {
                    const { preciseVolume, accuracy } =
                        await calculatePreciseVolume(
                            arrayBuffer,
                            bounds!,
                            dimensionResult.volume!
                        );

                    setModelInfo((prev) => ({
                        ...prev,
                        preciseVolume,
                        accuracy,
                    }));
                } catch (monteCarloError) {
                    console.error(
                        "Monte Carlo calculation error:",
                        monteCarloError
                    );
                    // Don't fail the entire validation if Monte Carlo fails
                }
            } catch (err) {
                setError(
                    `Validation error: ${
                        err instanceof Error ? err.message : "Unknown error"
                    }`
                );
                setModelInfo({});
            } finally {
                setLoading(false);
            }
        }

        validate();
    }, [file]);

    return { loading, error, warning, modelInfo };
}
