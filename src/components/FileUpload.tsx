"use client";

import React, { useState } from "react";

export default function FileUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [name, setName] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !name) return;

        setLoading(true);
        setMessage("");

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

            setMessage("Model uploaded successful");
            setFile(null);
            setName("");
        } catch (error) {
            setMessage(
                `Error: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
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
                <div
                    className={`mt-3 text-sm ${
                        message.includes("Error")
                            ? "text-red-500"
                            : "text-green-500"
                    }`}
                >
                    {message}
                </div>
            )}
        </form>
    );
}
