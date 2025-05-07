"use client";

// import React, { useState } from "react";
import React, { useEffect, useState } from "react";
import { NodeIO, Document } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
    getMeshVertexCount,
    getBounds,
    inspect,
    VertexCountMethod,
} from "@gltf-transform/functions";
import { Group, Raycaster, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default function FileUpload({
    onUploadSuccess,
}: {
    onUploadSuccess?: () => void;
}) {
    const [file, setFile] = useState<File | null>(null);
    const [name, setName] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [modelInfo, setModelInfo] = useState<{
        volume?: number;
        dimensions?: { x: number; y: number; z: number };
        preciseVolume?: number;
        accuracy?: number;
    }>({});

    useEffect(() => {
        async function validateGLTF() {
            if (!file) {
                return;
            }
            try {
                setLoading(true);

                // Convert File to ArrayBuffer
                const arrayBuffer = await file.arrayBuffer();

                // Create IO instance with all extensions
                const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);

                // Parse the GLB file
                let document: Document;
                try {
                    document = await io.readBinary(new Uint8Array(arrayBuffer));
                } catch (error) {
                    setError(
                        `Failed to parse GLB file: The file may be corrupt or invalid ${
                            error instanceof Error ? error.message : ""
                        }`
                    );
                    setLoading(false);
                    return;
                }

                // Perform basic validation
                try {
                    // Check if the model has any content
                    const summary = inspect(document);

                    // No meshes found
                    if (summary.meshes.properties.length === 0) {
                        setError(
                            "Invalid GLB file: No meshes found in the model"
                        );
                        setLoading(false);
                        return;
                    }

                    // Check if model has geometry - iterate through all meshes
                    let totalVertexCount = 0;
                    document
                        .getRoot()
                        .listMeshes()
                        .forEach((mesh) => {
                            // The second parameter is the counting method
                            totalVertexCount += getMeshVertexCount(
                                mesh,
                                VertexCountMethod.RENDER
                            );
                        });

                    if (totalVertexCount === 0) {
                        setError(
                            "Invalid GLB file: Model contains no geometry"
                        );
                        setLoading(false);
                        return;
                    }

                    // Check if model has reasonable bounds - get bounds from all meshes
                    const scenes = document.getRoot().listScenes();
                    if (scenes.length === 0) {
                        setError(
                            "Invalid GLB file: No scenes found in the model"
                        );
                        setLoading(false);
                        return;
                    }

                    // Get bounds from the first scene
                    const bounds = getBounds(scenes[0]);
                    const size = {
                        x: bounds.max[0] - bounds.min[0],
                        y: bounds.max[1] - bounds.min[1],
                        z: bounds.max[2] - bounds.min[2],
                    };

                    // Calculate approximate volume (bounding box volume)
                    const volume = size.x * size.y * size.z;

                    // Set initial model info
                    setModelInfo({ volume, dimensions: size });

                    // Check for empty bounds
                    if (
                        Object.values(size).some(
                            (val) => !isFinite(val) || isNaN(val)
                        ) ||
                        !isFinite(volume) ||
                        isNaN(volume) ||
                        volume <= 0
                    ) {
                        setError(
                            "Invalid GLB file: Model has invalid dimensions"
                        );
                        setLoading(false);
                        return;
                    }

                    // Check for invalid dimensions (NaN or infinite)
                    if (
                        Object.values(size).some(
                            (val) => !isFinite(val) || isNaN(val)
                        )
                    ) {
                        setError(
                            "Invalid GLB file: Model has invalid dimensions"
                        );
                        setLoading(false);
                        return;
                    }

                    // Check for extremely large models (arbitrary threshold - adjust as needed)
                    const maxDimension = Math.max(size.x, size.y, size.z);
                    if (maxDimension > 10000) {
                        setMessage(
                            "Warning: Model has very large dimensions. Consider scaling it down."
                        );
                    }

                    // If we get here, the file is valid
                    setError("");

                    // Now perform Monte Carlo volume calculation
                    try {
                        // Create blob URL for Three.js to load
                        const blob = new Blob([arrayBuffer], {
                            type: "model/gltf-binary",
                        });
                        const blobUrl = URL.createObjectURL(blob);

                        // Load model with Three.js (needed for raycasting)
                        const loader = new GLTFLoader();
                        const gltf = await new Promise<{ scene: Group }>(
                            (resolve, reject) => {
                                loader.load(
                                    blobUrl,
                                    resolve,
                                    undefined,
                                    reject
                                );
                            }
                        );

                        // Create a bounding box using Three.js
                        // const boundingBox = new Box3().setFromObject(
                        //     gltf.scene
                        // );

                        // Use the same dimensions from gltf-transform for consistency
                        const boundingBoxVolume = volume;

                        // Create raycaster for point-in-mesh testing
                        const raycaster = new Raycaster();

                        // Number of samples (adjust for performance vs. accuracy)
                        const samples = 100; // Lower for better performance, higher for better accuracy
                        let pointsInside = 0;

                        // Monte Carlo sampling
                        for (let i = 0; i < samples; i++) {
                            // Generate random point within bounding box
                            const point = new Vector3(
                                bounds.min[0] + Math.random() * size.x,
                                bounds.min[1] + Math.random() * size.y,
                                bounds.min[2] + Math.random() * size.z
                            );

                            // Check if point is inside mesh using raycasting
                            // We'll use the "ray casting from point in multiple directions" approach
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
                                // Count only intersections where we're exiting the model (odd count means inside)
                                if (intersections.length % 2 === 1) {
                                    intersectionCount++;
                                }
                            }

                            // If majority of rays indicate the point is inside, count it
                            if (intersectionCount > directions.length / 2) {
                                pointsInside++;
                            }
                        }

                        // Calculate Monte Carlo volume approximation
                        const preciseVolume =
                            boundingBoxVolume * (pointsInside / samples);

                        // Calculate margin of error (95% confidence interval)
                        const marginOfError =
                            1.96 *
                            Math.sqrt(
                                ((pointsInside / samples) *
                                    (1 - pointsInside / samples)) /
                                    samples
                            );
                        const accuracy = 1 - marginOfError;

                        // Update model info with precise volume
                        setModelInfo((prev) => ({
                            ...prev,
                            preciseVolume,
                            accuracy,
                        }));

                        // Clean up blob URL
                        URL.revokeObjectURL(blobUrl);
                    } catch (monteCarloError) {
                        console.error(
                            "Monte Carlo calculation error:",
                            monteCarloError
                        );
                        // Don't set error state - just continue without precise volume
                        // This ensures the upload can still proceed even if Monte Carlo fails
                    }
                } catch (validationErr) {
                    setError(
                        `Model validation failed: ${
                            validationErr instanceof Error
                                ? validationErr.message
                                : "Unknown error"
                        }`
                    );
                    setLoading(false);
                    return;
                }
            } catch (err) {
                setError(
                    `Validation error: ${
                        err instanceof Error ? err.message : "Unknown error"
                    }`
                );
                setModelInfo({});
                setLoading(false);
            } finally {
                setLoading(false);
            }
        }

        validateGLTF();
    }, [file]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            // More thorough client-side validation
            if (!selectedFile.name.endsWith(".glb")) {
                setError("Only .glb files are supported");
                return;
            }

            // Check MIME type if available
            if (
                selectedFile.type &&
                selectedFile.type !== "model/gltf-binary"
            ) {
                setError("The file doesn't appear to be a valid GLB file");
                return;
            }

            // Validate file size client-side
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError("File size exceeds the 10MB limit");
                return;
            }

            // Check if file has content
            if (selectedFile.size === 0) {
                setError("File is empty");
                return;
            }

            setError("");
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !name) return;

        setLoading(true);
        setMessage("");
        setError("");

        try {
            const formData = new FormData();
            formData.append("model", file);
            formData.append("name", name);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Upload failed");
            }

            setMessage("Model uploaded successfully");
            setFile(null);
            setName("");

            // Call the callback if provided
            if (onUploadSuccess) {
                onUploadSuccess();
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            setError(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-md font-medium dark:text-gray-100 text-gray-800">
                    Model Name
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border bg-gray-50 border-gray-400 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                />
            </div>

            <div>
                <label className="block text-md font-medium dark:text-gray-100 text-gray-800">
                    Upload .glb CAD file:
                </label>
                <div className="mt-1 flex items-center">
                    <label className="cursor-pointer w-full px-3 py-2 border border-gray-400 rounded-md shadow-sm bg-gray-100 text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                        <span className="block truncate justify-center text-center">
                            {file ? file.name : "Click here to add a file"}
                        </span>
                        <input
                            type="file"
                            accept=".glb"
                            onChange={handleFileChange}
                            className="sr-only"
                            required
                        />
                    </label>
                </div>
                {file && (
                    <div className="mt-1 text-xs text-gray-500">
                        <div>
                            Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </div>
                        {modelInfo.dimensions && (
                            <div>
                                Dimensions:
                                {` ${modelInfo.dimensions.x.toFixed(
                                    2
                                )} × ${modelInfo.dimensions.y.toFixed(
                                    2
                                )} × ${modelInfo.dimensions.z.toFixed(
                                    2
                                )} units`}
                            </div>
                        )}
                        {modelInfo.volume !== undefined && (
                            <div>
                                Bounding Box Volume:{" "}
                                {modelInfo.volume.toFixed(2)} cubic units
                            </div>
                        )}
                        {modelInfo.preciseVolume !== undefined && (
                            <div>
                                Estimated True Volume:{" "}
                                {modelInfo.preciseVolume.toFixed(2)} cubic units
                                <span className="text-gray-400 ml-1">
                                    ({(modelInfo.accuracy! * 100).toFixed(1)}%
                                    confidence)
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={loading || !file || !name}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
                {loading ? "Uploading..." : "Upload Model"}
            </button>

            {message && (
                <div className="mt-3 text-sm text-green-500">{message}</div>
            )}
        </form>
    );
}
