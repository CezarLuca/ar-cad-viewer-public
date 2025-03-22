"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ExpandableRow from "./ExpandableRow";

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
    const [sortField, setSortField] = useState<keyof Model>("id");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

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

    // Toggle row expansion
    const toggleRowExpansion = (modelId: number) => {
        setExpandedRow(expandedRow === modelId ? null : modelId);
    };

    // Sorting function
    const handleSort = (field: keyof Model) => {
        if (field === sortField) {
            // Toggle direction if same field
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            // Set new field with default ascending direction
            setSortField(field);
            setSortDirection("asc");
        }
    };

    // Get sorted models
    const getSortedModels = () => {
        return [...models].sort((a, b) => {
            // Handle date sorting
            if (sortField === "created_at") {
                const dateA = new Date(a.created_at).getTime();
                const dateB = new Date(b.created_at).getTime();
                return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
            }

            // Handle number sorting
            if (
                typeof a[sortField] === "number" &&
                typeof b[sortField] === "number"
            ) {
                const numA = a[sortField] as number;
                const numB = b[sortField] as number;
                return sortDirection === "asc" ? numA - numB : numB - numA;
            }

            // Handle string sorting
            const strA = String(a[sortField]).toLowerCase();
            const strB = String(b[sortField]).toLowerCase();
            return sortDirection === "asc"
                ? strA.localeCompare(strB)
                : strB.localeCompare(strA);
        });
    };

    // Delete model
    const deleteModel = async (modelId: number, e?: React.MouseEvent) => {
        // Prevent row expansion when clicking delete button
        e?.stopPropagation();

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

    // Render sort indicator
    const renderSortIndicator = (field: keyof Model) => {
        if (sortField !== field) return null;
        return sortDirection === "asc" ? " ↑" : " ↓";
    };

    if (loading) return <div>Loading models...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    const sortedModels = getSortedModels();

    return (
        <div className="overflow-x-auto">
            <table className="w-full table-fixed bg-gray-200 rounded-lg overflow-hidden shadow-lg">
                <thead className="bg-gray-800 text-gray-100">
                    <tr>
                        <th className="py-2 sm:py-3 px-2 sm:px-4 text-left w-[10%]">
                            <button
                                onClick={() => handleSort("id")}
                                className="font-bold hover:text-blue-300 transition-colors"
                            >
                                ID{renderSortIndicator("id")}
                            </button>
                        </th>
                        <th className="py-2 sm:py-3 px-2 sm:px-4 text-left w-[30%]">
                            <button
                                onClick={() => handleSort("name")}
                                className="font-bold hover:text-blue-300 transition-colors"
                            >
                                Name{renderSortIndicator("name")}
                            </button>
                        </th>
                        <th className="py-2 sm:py-3 px-2 sm:px-4 text-left sm:table-cell hidden w-[15%]">
                            <button
                                onClick={() => handleSort("user_name")}
                                className="font-bold hover:text-blue-300 transition-colors"
                            >
                                User{renderSortIndicator("user_name")}
                            </button>
                        </th>
                        <th className="py-2 sm:py-3 px-2 sm:px-4 text-left sm:table-cell hidden w-[10%]">
                            <button
                                onClick={() => handleSort("size")}
                                className="font-bold hover:text-blue-300 transition-colors"
                            >
                                Size{renderSortIndicator("size")}
                            </button>
                        </th>
                        <th className="py-2 sm:py-3 px-2 sm:px-4 text-left md:table-cell hidden w-[15%]">
                            <button
                                onClick={() => handleSort("created_at")}
                                className="font-bold hover:text-blue-300 transition-colors"
                            >
                                Created At{renderSortIndicator("created_at")}
                            </button>
                        </th>
                        <th className="py-2 sm:py-3 px-2 sm:px-4 text-center sm:w-[15%] w-[12%]">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                    {sortedModels.map((model) => (
                        <React.Fragment key={model.id}>
                            <tr
                                className="hover:bg-gray-100 text-gray-600 cursor-pointer"
                                onClick={() => toggleRowExpansion(model.id)}
                            >
                                <td className="py-2 sm:py-3 px-2 sm:px-4">
                                    {model.id}
                                </td>
                                <td className="py-2 sm:py-3 px-2 sm:px-4">
                                    <div className="truncate hover:text-clip hover:overflow-visible">
                                        {model.name} ({model.filename})
                                    </div>
                                </td>
                                <td className="py-2 sm:py-3 px-2 sm:px-4 sm:table-cell hidden">
                                    {model.user_name}
                                </td>
                                <td className="py-2 sm:py-3 px-2 sm:px-4 sm:table-cell hidden">
                                    {formatFileSize(model.size)}
                                </td>
                                <td className="py-2 sm:py-3 px-2 sm:px-4 md:table-cell hidden">
                                    {new Date(
                                        model.created_at
                                    ).toLocaleString()}
                                </td>
                                <td className="py-2 sm:py-3 px-2 sm:px-4 text-center whitespace-nowrap">
                                    <div
                                        className="flex flex-col sm:flex-row sm:justify-end space-y-1 sm:space-y-0 sm:space-x-2"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Link
                                            href={`/ar?model=${encodeURIComponent(
                                                model.blob_url
                                            )}`}
                                            className="bg-blue-500 hover:bg-blue-700 text-gray-100 font-bold py-1 px-2 sm:px-3 rounded text-xs text-center"
                                        >
                                            View
                                        </Link>
                                        <button
                                            onClick={(e) =>
                                                deleteModel(model.id, e)
                                            }
                                            className="bg-red-500 hover:bg-red-700 text-gray-100 font-bold py-1 px-2 sm:px-3 rounded text-xs"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <ExpandableRow
                                isOpen={expandedRow === model.id}
                                tableType="models"
                                hiddenFields={{
                                    sm: [
                                        {
                                            label: "User",
                                            value: model.user_name,
                                        },
                                        {
                                            label: "Size",
                                            value: formatFileSize(model.size),
                                        },
                                    ],
                                    md: [
                                        {
                                            label: "Created At",
                                            value: new Date(
                                                model.created_at
                                            ).toLocaleString(),
                                        },
                                    ],
                                }}
                            />
                        </React.Fragment>
                    ))}
                </tbody>
            </table>

            {models.length === 0 && (
                <div className="text-center py-4">No models found</div>
            )}
        </div>
    );
}
