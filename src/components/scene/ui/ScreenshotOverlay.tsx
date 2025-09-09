"use client";
import React, { useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import Image from "next/image";
import { useScreenshot } from "@/context/ScreenshotContext";
import { useModelUrl } from "@/context/ModelUrlContext";

interface ScreenshotOverlayProps {
    onCapture: () => void;
    onCancel: () => void;
}

interface Model {
    id: number;
    name: string;
    filename: string;
    blob_url: string;
    created_at: string;
}

interface Screenshot {
    id: number;
    model_id: number;
    filename: string;
    blob_url: string;
    created_at: string;
}

const ScreenshotOverlay: React.FC<ScreenshotOverlayProps> = ({
    onCapture,
    onCancel,
}) => {
    const { screenshot, setScreenshot, setIsFraming, frameSize, setFrameSize } =
        useScreenshot();
    const overlayRef = useRef<HTMLDivElement>(null);
    const { modelUrl } = useModelUrl();
    const [isUploading, setIsUploading] = useState(false);

    // Responsive frame size calculation
    useEffect(() => {
        function updateFrameSize() {
            const width = window.innerWidth;
            const height = window.innerHeight;

            if (width < 640) {
                // For small devices: account for border width (8px total)
                const availableWidth = width - 24;
                setFrameSize(availableWidth);
            } else {
                // For medium/large devices: use 5/9 of height, but maintain square aspect ratio
                const targetHeight = Math.floor((height * 5) / 9);
                // Ensure the frame doesn't exceed the available width
                const maxWidth = Math.floor((width * 5) / 9);
                // Take the smaller of the two to maintain square aspect ratio
                setFrameSize(Math.min(targetHeight, maxWidth));
            }
        }

        updateFrameSize();
        window.addEventListener("resize", updateFrameSize);
        return () => window.removeEventListener("resize", updateFrameSize);
    }, [setFrameSize]);

    function dataURLtoBlob(dataurl: string) {
        const arr = dataurl.split(",");
        const mime = arr[0].match(/:(.*?);/)?.[1] || "";
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    async function uploadToBlobStore(blob: Blob, filename: string) {
        try {
            const newBlob = await upload(filename, blob, {
                access: "public",
                handleUploadUrl: "/api/blob-upload",
            });

            return newBlob.url;
        } catch (error) {
            console.error("Error uploading to blob store:", error);
            throw new Error("Screenshot upload failed");
        }
    }

    async function fetchModelIdByUrl(url: string): Promise<number | null> {
        try {
            // Get all user models
            const response = await fetch("/api/models/user");
            if (!response.ok) {
                console.error("Failed to fetch user models");
                return null;
            }

            const data = await response.json();

            // Find the model with matching URL
            const matchingModel = data.models.find((model: Model) => {
                return model.blob_url === url;
            });

            return matchingModel ? matchingModel.id : null;
        } catch (error) {
            console.error("Error finding model by URL:", error);
            return null;
        }
    }

    async function fetchModelScreenshots(modelId: number) {
        try {
            const response = await fetch(`/api/screenshots?modelId=${modelId}`);
            if (!response.ok) {
                console.error("Failed to fetch model screenshots");
                return null;
            }
            const data = await response.json();
            return data.screenshots;
        } catch (error) {
            console.error("Error fetching model screenshots:", error);
            return null;
        }
    }

    async function deleteOldestScreenshot(screenshots: Screenshot[]) {
        if (!screenshots || screenshots.length === 0) return false;

        // Sort screenshots by creation date (oldest first)
        const sorted = [...screenshots].sort(
            (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
        );

        // Get the oldest screenshot
        const oldestScreenshot = sorted[0];

        try {
            const response = await fetch(
                `/api/screenshots?id=${oldestScreenshot.id}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                console.error("Failed to delete oldest screenshot");
                return false;
            }

            return true;
        } catch (error) {
            console.error("Error deleting oldest screenshot:", error);
            return false;
        }
    }

    async function saveScreenshotMetadata({
        modelId,
        filename,
        blobUrl,
    }: {
        modelId: number;
        filename: string;
        blobUrl: string;
    }) {
        const res = await fetch("/api/screenshots", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ modelId, filename, blobUrl }),
        });
        if (!res.ok) throw new Error("Failed to save screenshot metadata");
        return await res.json();
    }

    async function handleUpload() {
        if (!screenshot) return;
        setIsUploading(true);

        try {
            // Get the model ID using the full model URL
            const modelId = await fetchModelIdByUrl(modelUrl);

            if (!modelId) {
                alert(
                    "Could not find model ID. Make sure this is one of your uploaded models."
                );
                setIsUploading(false);
                return;
            }

            // Fetch all screenshots for this model
            const existingScreenshots = await fetchModelScreenshots(modelId);

            // Check if we need to delete an old screenshot (if we have 4 already)
            if (existingScreenshots && existingScreenshots.length >= 4) {
                const deleted = await deleteOldestScreenshot(
                    existingScreenshots
                );
                if (!deleted) {
                    console.warn(
                        "Failed to delete oldest screenshot, but will continue uploading"
                    );
                }
            }

            // Continue with the regular upload process
            const blob = dataURLtoBlob(screenshot);

            // Extract model name from URL for filename only
            const modelName =
                modelUrl.split("/").pop()?.replace(".glb", "") ?? "model";
            const timestamp = Date.now();
            const filename = `screenshot-${timestamp}-${modelName}.png`;

            // Upload the screenshot blob to Vercel Blob storage
            const blobUrl = await uploadToBlobStore(blob, filename);

            // Save the metadata to your database
            const result = await saveScreenshotMetadata({
                modelId,
                filename,
                blobUrl,
            });

            console.log("Screenshot uploaded successfully:", result);
            setScreenshot(null);
            setIsFraming(false);
        } catch (error) {
            console.error("Error uploading screenshot:", error);
            alert("Failed to upload screenshot. Please try again.");
        } finally {
            setIsUploading(false);
        }
    }

    // If screenshot exists, show the result overlay
    if (screenshot) {
        return (
            <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
                <div className="relative bg-gray-100/50 rounded-lg shadow-lg p-6">
                    <button
                        className="absolute top-0 right-1 text-gray-800 hover:text-gray-600 text-3xl"
                        onClick={() => {
                            setScreenshot(null);
                            setIsFraming(false);
                        }}
                        aria-label="Close screenshot"
                    >
                        ×
                    </button>
                    <Image
                        src={screenshot}
                        alt="Screenshot"
                        className="max-w-[90vw] max-h-[90vh] rounded"
                        width={frameSize}
                        height={frameSize}
                        style={{ objectFit: "contain" }}
                        unoptimized
                    />
                    <div className="flex justify-center mt-4 gap-4">
                        <button
                            className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
                            onClick={handleUpload}
                            disabled={isUploading}
                        >
                            {isUploading ? "Uploading..." : "Upload Screenshot"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Otherwise, show the framing overlay
    return (
        <div
            ref={overlayRef}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
            {/* SVG overlay with rectangular transparent hole */}
            <svg
                className="absolute inset-0 w-full h-full pointer-events-auto"
                style={{ display: "block", pointerEvents: "none" }}
            >
                <defs>
                    <mask id="rect-mask">
                        {/* Full white = visible, black = transparent */}
                        <rect width="100%" height="100%" fill="white" />
                        <rect
                            x={`calc(48.5% - ${frameSize / 2}px)`}
                            y={`calc(50% - ${frameSize / 2}px)`}
                            width={frameSize}
                            height={frameSize}
                            fill="black"
                            rx="16"
                        />
                    </mask>
                </defs>
                <rect
                    width="100%"
                    height="100%"
                    fill="rgba(0,0,0,0.5)"
                    mask="url(#rect-mask)"
                />
            </svg>
            {/* Framing rectangle border */}
            <div
                className="absolute flex items-center justify-center"
                style={{
                    width: frameSize,
                    height: frameSize,
                    left: "48.5%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "none",
                }}
            >
                <div className="border-4 border-blue-400 rounded-lg w-full h-full bg-transparent" />
            </div>
            {/* Buttons */}
            <div className="absolute bottom-10 left-1/2 pr-8 -translate-x-1/2 flex gap-4 pointer-events-auto">
                <button
                    onClick={onCapture}
                    className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"
                >
                    Capture
                </button>
                <button
                    onClick={onCancel}
                    className="bg-gray-300 text-gray-800 px-6 py-2 rounded shadow hover:bg-gray-400"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default ScreenshotOverlay;
