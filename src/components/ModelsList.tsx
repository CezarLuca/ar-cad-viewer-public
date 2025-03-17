"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Model {
    id: number;
    name: string;
    filename: string;
    blob_url: string;
    created_at: string;
}

export default function ModelList() {
    const [models, setModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        async function fetchModels() {
            try {
                const response = await fetch("/api/models");
                const data = await response.json();

                if (!response.ok)
                    throw new Error(data.error || "Failed to fetch models");

                setModels(data.models);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setLoading(false);
            }
        }

        fetchModels();
    }, []);

    if (loading)
        return <div className="text-center py-4"> Loading models...</div>;
    if (error)
        return <div className="text-center text-red-500 py-4">{error}</div>;
    if (models.length === 0)
        return <div className="text-center py-4">No models uploaded yet</div>;

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Your 3D Models</h2>
            <ul className="divide-y divide-gray-200">
                {models.map((model) => (
                    <li key={model.id} className="py-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-medium">{model.name}</h3>
                                <p className="text-md text-gray-600">
                                    {model.filename}
                                </p>
                            </div>
                            <Link
                                href={`/ar?model=${encodeURIComponent(
                                    model.blob_url
                                )}`}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                View in AR
                            </Link>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
