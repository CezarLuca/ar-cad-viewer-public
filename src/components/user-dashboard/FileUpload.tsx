"use client";

import React, { useState } from "react";

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
                <label className="block text-sm font-medium text-gray-700">
                    Model Name
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border bg-gray-200 border-gray-400 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Upload .glb CAD file:
                </label>
                <div className="mt-1 flex items-center">
                    <label className="cursor-pointer w-full px-3 py-2 border border-gray-400 rounded-md shadow-sm bg-gray-200 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
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
                        Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
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
