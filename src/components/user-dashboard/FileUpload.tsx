"use client";

import { upload } from "@vercel/blob/client";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
    const [isDraggingOverDropZone, setIsDraggingOverDropZone] =
        useState<boolean>(false);
    const [isDraggingOverWindow, setIsDraggingOverWindow] =
        useState<boolean>(false);
    const dragCounter = useRef(0);

    useEffect(() => {
        async function validateGLTF() {
            if (!file) {
                setModelInfo({});
                setError("");
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

                    // Monte Carlo volume calculation
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
            processFile(selectedFile);
        } else {
            setError("No file selected");
            setFile(null);
            setModelInfo({});
        }
    };

    const processFile = useCallback((selectedFile: File) => {
        // More thorough client-side validation
        if (!selectedFile.name.endsWith(".glb")) {
            setError("Only .glb files are supported");
            setFile(null);
            return;
        }

        // Check MIME type if available
        if (selectedFile.type && selectedFile.type !== "model/gltf-binary") {
            setError("The file doesn't appear to be a valid GLB file");
            setFile(null);
            return;
        }

        // Validate file size client-side
        if (selectedFile.size > 10 * 1024 * 1024) {
            setError("File size exceeds the 10MB limit");
            setFile(null);
            return;
        }

        // Check if file has content
        if (selectedFile.size === 0) {
            setError("File is empty");
            setFile(null); // Clear the file if it's empty
            return;
        }

        setError("");
        setFile(selectedFile);
        // The validateGLTF useEffect will trigger due to 'file' state change
    }, []);

    useEffect(() => {
        const handleDragEnterWindow = (e: DragEvent) => {
            if (
                e.dataTransfer &&
                Array.from(e.dataTransfer.types).includes("Files")
            ) {
                e.preventDefault();
                e.stopPropagation();
                dragCounter.current++;
                if (dragCounter.current === 1) {
                    setIsDraggingOverWindow(true);
                }
            }
        };

        const handleDragLeaveWindow = (e: DragEvent) => {
            if (
                e.target === document.documentElement ||
                !document.documentElement.contains(e.relatedTarget as Node)
            ) {
                dragCounter.current--;
                if (dragCounter.current === 0) {
                    setIsDraggingOverWindow(false);
                }
            } else if (dragCounter.current > 0 && !e.relatedTarget) {
                dragCounter.current = 0;
                setIsDraggingOverWindow(false);
            }
        };

        const handleDragOverWindow = (e: DragEvent) => {
            if (
                e.dataTransfer &&
                Array.from(e.dataTransfer.types).includes("Files")
            ) {
                e.preventDefault(); // Necessary to allow drop
                e.stopPropagation();

                if (!isDraggingOverWindow && dragCounter.current > 0) {
                    setIsDraggingOverWindow(true);
                }
            }
        };

        const handleDropWindow = (e: DragEvent) => {
            if (dragCounter.current > 0 || isDraggingOverWindow) {
                if (
                    e.dataTransfer &&
                    Array.from(e.dataTransfer.types).includes("Files")
                ) {
                    e.preventDefault();
                    e.stopPropagation();

                    const droppedFiles = e.dataTransfer.files;
                    if (droppedFiles && droppedFiles.length > 0) {
                        processFile(droppedFiles[0]);
                    } else {
                        setError("No file dropped or file could not be read.");
                        setFile(null);
                        setModelInfo({});
                    }
                }
            }
            dragCounter.current = 0;
            setIsDraggingOverWindow(false);
            setIsDraggingOverDropZone(false);
        };

        document.addEventListener("dragenter", handleDragEnterWindow);
        document.addEventListener("dragleave", handleDragLeaveWindow);
        document.addEventListener("dragover", handleDragOverWindow);
        document.addEventListener("drop", handleDropWindow);

        return () => {
            document.removeEventListener("dragenter", handleDragEnterWindow);
            document.removeEventListener("dragleave", handleDragLeaveWindow);
            document.removeEventListener("dragover", handleDragOverWindow);
            document.removeEventListener("drop", handleDropWindow);
        };
    }, [processFile, isDraggingOverWindow]);

    const handleDragOverSpecificDropZone = (
        e: React.DragEvent<HTMLLabelElement>
    ) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOverDropZone(true);
    };

    const handleDragEnterSpecificDropZone = (
        e: React.DragEvent<HTMLLabelElement>
    ) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOverDropZone(true);
    };

    const handleDragLeaveSpecificDropZone = (
        e: React.DragEvent<HTMLLabelElement>
    ) => {
        e.preventDefault();
        e.stopPropagation();
        // Check if leaving to an element outside the dropzone
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDraggingOverDropZone(false);
        }
    };

    const handleClearFile = () => {
        setFile(null);
        setModelInfo({});
        setError("");
        // setMessage(""); // Keep success messages if needed, or clear
        const fileInput = document.getElementById(
            "file-upload"
        ) as HTMLInputElement;
        if (fileInput) {
            fileInput.value = ""; // Reset the actual input element
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !name) return;

        setLoading(true);
        setMessage("");
        setError("");

        try {
            // Step 1: Upload the file directly to Vercel Blob storage
            const newBlob = await upload(
                file.name, // Original filename, used by onBeforeGenerateToken
                file,
                {
                    access: "public",
                    handleUploadUrl: "/api/blob-upload", // Endpoint for blob upload handling
                }
            );

            // Step 2: Send the blob metadata (URL, pathname) and model name to your API
            const response = await fetch("/api/upload", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    modelName: name,
                    blobUrl: newBlob.url,
                    filename: newBlob.pathname, // This is the unique filename from the server
                    fileSize: file.size,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Saving model metadata failed");
            }

            setMessage("Model uploaded and registered successfully");
            setFile(null);
            setName("");
            setModelInfo({});

            if (onUploadSuccess) {
                onUploadSuccess();
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Unknown error during upload process";
            setError(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {isDraggingOverWindow && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex flex-col items-center justify-center z-[9999] text-white p-4 transition-opacity duration-150">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-20 w-20 mb-4 text-blue-400 animate-bounce"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                        />
                    </svg>
                    <h2 className="text-2xl font-semibold mb-2">
                        Drop your .glb file
                    </h2>
                    <p className="text-md">
                        Drag the file over the upload area.
                    </p>
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}
                <div>
                    <label
                        htmlFor="modelNameInput"
                        className="block text-md font-medium dark:text-gray-100 text-gray-800"
                    >
                        Model Name
                    </label>
                    <input
                        id="modelNameInput"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border bg-gray-50 border-gray-400 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        required
                        placeholder="Enter a name for your model"
                    />
                </div>

                <div>
                    <span className="block text-md font-medium dark:text-gray-100 text-gray-800 mb-1">
                        Upload .glb CAD file
                    </span>
                    <label
                        htmlFor="file-upload"
                        onDragOver={handleDragOverSpecificDropZone}
                        onDragEnter={handleDragEnterSpecificDropZone}
                        onDragLeave={handleDragLeaveSpecificDropZone}
                        className={`mt-1 flex flex-col items-center justify-center w-full h-48 px-6 py-10 border-2
                                    ${
                                        isDraggingOverDropZone
                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400"
                                            : "border-gray-300 border-dashed hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 dark:bg-gray-700/30"
                                    }
                                    rounded-lg cursor-pointer transition-all duration-200 ease-in-out group`}
                    >
                        <div className="flex flex-col items-center justify-center text-center">
                            <svg
                                className={`w-10 h-10 mb-3 transition-colors ${
                                    isDraggingOverDropZone
                                        ? "text-blue-500 dark:text-blue-400"
                                        : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400"
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                ></path>
                            </svg>
                            {file ? (
                                <>
                                    <p className="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-200 truncate max-w-full px-2">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {(file.size / (1024 * 1024)).toFixed(2)}{" "}
                                        MB
                                    </p>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleClearFile();
                                        }}
                                        className="mt-2 text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                                    >
                                        Clear file
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p
                                        className={`mb-2 text-sm transition-colors ${
                                            isDraggingOverDropZone
                                                ? "text-blue-600 dark:text-blue-300"
                                                : "text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                                        }`}
                                    >
                                        <span className="font-semibold">
                                            {isDraggingOverDropZone
                                                ? "Release to drop file"
                                                : "Click to upload"}
                                        </span>{" "}
                                        or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        GLB files only (MAX. 10MB)
                                    </p>
                                </>
                            )}
                        </div>
                        <input
                            id="file-upload"
                            type="file"
                            className="sr-only"
                            accept=".glb"
                            onChange={handleFileChange}
                            required={!file}
                        />
                    </label>
                </div>

                {file && modelInfo.dimensions && (
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-1 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                        <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-1">
                            Model Details:
                        </h4>
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
                                <span className="text-gray-500 dark:text-gray-400 ml-1">
                                    ({(modelInfo.accuracy! * 100).toFixed(1)}%
                                    confidence)
                                </span>
                            </div>
                        )}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || !file || !name}
                    className="w-full bg-blue-500 text-white px-4 py-2.5 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:text-gray-500 disabled:cursor-not-allowed dark:disabled:bg-gray-600 dark:disabled:text-gray-400 transition-colors"
                >
                    {loading ? "Uploading..." : "Upload Model"}
                </button>

                {message && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-300 text-sm text-green-600 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300 rounded">
                        {message}
                    </div>
                )}
            </form>
        </>
    );
}
