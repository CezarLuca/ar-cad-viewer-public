"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Model {
    id: number;
    name: string;
    filename: string;
    blob_url: string;
    user_id: number;
    created_at: string;
}

export default function UserModelsList() {
    const [models, setModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
    const [deleteError, setDeleteError] = useState<string>("");
    const { data: session } = useSession();

    useEffect(() => {
        async function fetchModels() {
            if (!session?.user) return;

            setLoading(true);
            try {
                const response = await fetch("/api/models/user", {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                });

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
    }, [session]);

    async function handleDeleteModel(id: number) {
        if (!confirm("Are you sure you want to delete this model?")) {
            return;
        }

        setDeleteLoading(id);
        setDeleteError("");

        try {
            const response = await fetch(`/api/models/user?id=${id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to delete model");
            }

            // Remove the deleted model from the state
            setModels(models.filter((model) => model.id !== id));
        } catch (err) {
            setDeleteError(
                err instanceof Error ? err.message : "Failed to delete model"
            );
            console.error("Delete error:", err);
        } finally {
            setDeleteLoading(null);
        }
    }

    if (loading)
        return <div className="text-gray-500">Loading your models...</div>;
    if (error) return <div className="text-red-500">{error}</div>;
    if (models.length === 0)
        return (
            <div className="text-gray-500">
                You haven&apos;t uploaded any models yet.
            </div>
        );

    return (
        <div>
            {deleteError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {deleteError}
                </div>
            )}

            <ul className="space-y-4">
                {models.map((model) => (
                    <li
                        key={model.id}
                        className="border p-4 rounded bg-gray-100 shadow-sm"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-gray-500">
                                    {model.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {new Date(
                                        model.created_at
                                    ).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex space-x-2">
                                <Link
                                    href={`/ar?model=${encodeURIComponent(
                                        model.blob_url
                                    )}`}
                                    className="bg-blue-600 hover:bg-blue-700 text-gray-200 px-3 py-1 rounded"
                                >
                                    View in 3D
                                </Link>
                                <button
                                    onClick={() => handleDeleteModel(model.id)}
                                    disabled={deleteLoading === model.id}
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded disabled:bg-gray-400"
                                >
                                    {deleteLoading === model.id
                                        ? "Deleting..."
                                        : "Delete"}
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
