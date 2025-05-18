"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import QrCodeModal from "@/components/user-dashboard/QRCodeModal";

interface Model {
    id: number;
    name: string;
    filename: string;
    blob_url: string;
    user_id: number;
    created_at: string;
}
interface QrModalData {
    url: string;
    modelName: string;
    fileName: string;
}

const BurgerIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16m-7 6h7"
        />
    </svg>
);

export default function UserModelsList() {
    const [models, setModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
    const [deleteError, setDeleteError] = useState<string>("");
    const { data: session } = useSession();
    const [qrModalData, setQrModalData] = useState<QrModalData | null>(null);
    const [openActionMenuModelId, setOpenActionMenuModelId] = useState<
        number | null
    >(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

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

    useEffect(() => {
        // Close menu when clicking outside
        function handleClickOutside(event: MouseEvent) {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setOpenActionMenuModelId(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    async function handleDeleteModel(id: number) {
        if (!confirm("Are you sure you want to delete this model?")) {
            setOpenActionMenuModelId(null);
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
            setOpenActionMenuModelId(null);
        }
    }

    const handleShowQrCode = (model: Model) => {
        const origin =
            typeof window !== "undefined" ? window.location.origin : "";
        const modelViewUrl = `${origin}/ar?model=${encodeURIComponent(
            model.blob_url
        )}`;
        setQrModalData({
            url: modelViewUrl,
            modelName: model.name,
            fileName: `${model.name.replace(/\s+/g, "_")}_QR_Code.png`,
        });
        setOpenActionMenuModelId(null);
    };

    const handleCloseQrModal = () => {
        setQrModalData(null);
    };

    const toggleActionMenu = (modelId: number) => {
        setOpenActionMenuModelId(
            openActionMenuModelId === modelId ? null : modelId
        );
    };

    if (loading)
        return <div className="text-gray-800">Loading your models...</div>;
    if (error) return <div className="text-red-500">{error}</div>;
    if (models.length === 0)
        return (
            <div className="text-gray-800">
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
                        className="border p-4 rounded bg-gray-200 shadow-sm"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-gray-700">
                                    {model.name}
                                </h3>
                                <p className="text-sm text-gray-700">
                                    {new Date(
                                        model.created_at
                                    ).toLocaleString()}
                                </p>
                            </div>
                            <div
                                className="relative"
                                ref={
                                    openActionMenuModelId === model.id
                                        ? menuRef
                                        : null
                                }
                            >
                                <button
                                    onClick={() => toggleActionMenu(model.id)}
                                    className="p-2 rounded-md text-gray-900 bg-gray-300 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                    aria-label="Model actions"
                                >
                                    <BurgerIcon />
                                </button>
                                {openActionMenuModelId === model.id && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-300">
                                        <Link
                                            href={`/ar?model=${encodeURIComponent(
                                                model.blob_url
                                            )}`}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left border-b border-gray-300 hover:cursor-pointer"
                                            onClick={() =>
                                                setOpenActionMenuModelId(null)
                                            }
                                        >
                                            View in 3D
                                        </Link>
                                        <button
                                            onClick={() =>
                                                handleShowQrCode(model)
                                            }
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left border-b border-gray-300 hover:cursor-pointer"
                                        >
                                            Show QR Code
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDeleteModel(model.id)
                                            }
                                            disabled={
                                                deleteLoading === model.id
                                            }
                                            className="block px-4 py-2 text-sm text-red-600 hover:bg-red-200 w-full text-left disabled:text-gray-400 hover:cursor-pointer"
                                        >
                                            {deleteLoading === model.id
                                                ? "Deleting..."
                                                : "Delete"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            {qrModalData && (
                <QrCodeModal
                    url={qrModalData.url}
                    modelName={qrModalData.modelName}
                    fileName={qrModalData.fileName}
                    onClose={handleCloseQrModal}
                />
            )}
        </div>
    );
}
