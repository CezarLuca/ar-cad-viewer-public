"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Model {
    id: number;
    name: string;
    filename: string;
    size: number;
    blob_url: string;
    user_id: number;
    created_at: string;
    user_name: string;
}

export default function AdminModelsTable() {
    const [models, setModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch models
    useEffect(() => {
        async function fetchModels() {
            try {
                const response = await fetch("/api/admin/models");
                if (!response.ok) {
                    throw new Error("Failed to fetch models");
                }
                const data = await response.json();
                setModels(data.models || []);
            } catch (err) {
                setError("Error loading models");
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchModels();
    }, []);

    // Delete model
    const deleteModel = async (modelId: number) => {
        if (
            !confirm(
                "Are you sure you want to delete this model? This action cannot be undone."
            )
        ) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/models?id=${modelId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to delete model");
            }

            // Remove model from state
            setModels(models.filter((model) => model.id !== modelId));
        } catch (err) {
            alert(
                err instanceof Error ? err.message : "Failed to delete model"
            );
        }
    };

    // Format file size
    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " bytes";
        else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
        else return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    };

    if (loading) return <div>Loading models...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-200 rounded-lg overflow-hidden shadow-lg">
                <thead className="bg-gray-800 text-gray-100">
                    <tr>
                        <th className="py-3 px-4 text-left">ID</th>
                        <th className="py-3 px-4 text-left">Name</th>
                        <th className="py-3 px-4 text-left">User</th>
                        <th className="py-3 px-4 text-left">Size</th>
                        <th className="py-3 px-4 text-left">Created At</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                    {models.map((model) => (
                        <tr
                            key={model.id}
                            className="hover:bg-gray-100 text-gray-600"
                        >
                            <td className="py-3 px-4">{model.id}</td>
                            <td className="py-3 px-4">
                                {model.name} ({model.filename})
                            </td>
                            <td className="py-3 px-4">{model.user_name}</td>
                            <td className="py-3 px-4">
                                {formatFileSize(model.size)}
                            </td>
                            <td className="py-3 px-4">
                                {new Date(model.created_at).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right">
                                <div className="flex justify-end space-x-2">
                                    <Link
                                        href={`/ar?model=${encodeURIComponent(
                                            model.blob_url
                                        )}`}
                                        className="bg-blue-500 hover:bg-blue-700 text-gray-100 font-bold py-1 px-3 rounded text-xs"
                                    >
                                        View
                                    </Link>
                                    <button
                                        onClick={() => deleteModel(model.id)}
                                        className="bg-red-500 hover:bg-red-700 text-gray-100 font-bold py-1 px-3 rounded text-xs"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {models.length === 0 && (
                <div className="text-center py-4">No models found</div>
            )}
        </div>
    );
}
