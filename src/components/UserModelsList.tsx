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
    const { data: session } = useSession();

    useEffect(() => {
        async function fetchModels() {
            try {
                const response = await fetch("/api/models/user", {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include", // Important for sending cookies
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

        if (session?.user) {
            fetchModels();
        }
    }, [session]);

    if (loading) return <div>Loading your models...</div>;
    if (error) return <div className="text-red-500">{error}</div>;
    if (models.length === 0)
        return <div>You haven&apos;t uploaded any models yet.</div>;

    return (
        <div>
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
                            <div>
                                <Link
                                    href={`/ar?model=${encodeURIComponent(
                                        model.blob_url
                                    )}`}
                                    className="bg-blue-600 hover:bg-blue-700 text-gray-200 px-3 py-1 rounded mr-2"
                                >
                                    View in AR
                                </Link>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
