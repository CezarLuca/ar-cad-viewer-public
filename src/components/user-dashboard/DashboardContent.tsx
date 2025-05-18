"use client";

import { useState } from "react";
import FileUpload from "./FileUpload";
import UserModelsList from "./UserModelsList";

export default function DashboardContent() {
    // Use a refresh key to trigger re-fetching of models list
    const [refreshKey, setRefreshKey] = useState(0);

    // Handler for when upload is successful
    const handleUploadSuccess = () => {
        // Increment the key to force UserModelsList to re-fetch
        setRefreshKey((prev) => prev + 1);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-300 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-700 mb-4">
                    Upload a New 3D Model
                </h2>
                <FileUpload onUploadSuccess={handleUploadSuccess} />
            </div>

            <div className="bg-gray-300 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-700 mb-4">
                    Your Models
                </h2>
                <UserModelsList key={refreshKey} />
            </div>
        </div>
    );
}
