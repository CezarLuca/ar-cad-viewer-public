"use client";

import { useState } from "react";
import FileUpload from "./FileUpload";
import UserModelsList from "./UserModelsList";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";

export default function DashboardContent() {
    const { t, loading } = useTranslations("dashboard");

    const [refreshKey, setRefreshKey] = useState(0);

    const handleUploadSuccess = () => {
        setRefreshKey((prev) => prev + 1);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="flex flex-wrap gap-6">
            {/* Left column containing Upload and AR Tracker */}
            <div className="flex flex-col gap-6 w-full lg:w-[calc(50%-12px)]">
                <div className="bg-gray-100/20 bg-opacity-40 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold dark:text-gray-100 text-gray-800 mb-4">
                        {t("uploadTitle", { default: "Upload a New 3D Model" })}
                    </h2>
                    <FileUpload onUploadSuccess={handleUploadSuccess} />
                </div>

                <div className="bg-gray-100/20 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold dark:text-gray-100 text-gray-800 mb-4">
                        {t("arTrackerTitle", { default: "AR Tracker" })}
                    </h2>
                    <div className="flex items-center space-x-4">
                        <div className="w-26 h-26 bg-gray-100 p-0 rounded flex-shrink-0">
                            <Image
                                src="/markers/tracker3.png"
                                alt="AR Tracking Marker"
                                width={80}
                                height={80}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="h-26 flex-grow flex">
                            <p className="dark:text-gray-100 text-gray-800 text-xl mb-3">
                                {t("arTrackerDescription", {
                                    default:
                                        "Print or display this tracker image to position your 3D models in AR.",
                                })}
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-left mt-4">
                        <Link
                            href="/tracker"
                            className="bg-gray-50/50 text-gray-800 dark:text-gray-100 dark:bg-gray-900/80 px-6 py-3 rounded-lg hover:bg-gray-200/80 dark:hover:bg-gray-900 border-1 border-gray-600 hover:border-gray-700 shadow-md shadow-gray-500/50 transition-colors text-lg sm:text-xl"
                        >
                            {t("viewTrackerDetails", {
                                default: "View Tracker Details",
                            })}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right column for Models */}
            <div className="bg-gray-100/20 p-6 rounded-lg shadow-md w-full lg:w-[calc(50%-12px)]">
                <h2 className="text-xl font-bold dark:text-gray-100 text-gray-800 mb-4">
                    {t("yourModelsTitle", { default: "Your Models" })}
                </h2>
                <UserModelsList key={refreshKey} />
            </div>
        </div>
    );
}
