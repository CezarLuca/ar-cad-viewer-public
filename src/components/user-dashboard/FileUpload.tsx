"use client";

import { upload } from "@vercel/blob/client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { useFileValidation } from "@/hooks/useFileValidation";
import UploadedModelInfo from "./UploadedModelInfo";

export default function FileUpload({
    onUploadSuccess,
}: {
    onUploadSuccess?: () => void;
}) {
    const { t, loading: translationsLoading } = useTranslations("fileUpload");

    const [file, setFile] = useState<File | null>(null);
    const [name, setName] = useState<string>("");
    const [uploading, setUploading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [uploadError, setUploadError] = useState<string>("");
    const [isDraggingOverDropZone, setIsDraggingOverDropZone] =
        useState<boolean>(false);
    const [isDraggingOverWindow, setIsDraggingOverWindow] =
        useState<boolean>(false);
    const dragCounter = useRef(0);

    // validation hook
    const {
        loading: validating,
        error: validationError,
        warning,
        modelInfo,
    } = useFileValidation(file);

    const processFile = useCallback((selectedFile: File) => {
        setFile(selectedFile);
        setUploadError("");
        setMessage("");
    }, []);

    useEffect(() => {
        const handleDragEnterWindow = (e: DragEvent) => {
            if (
                e.dataTransfer &&
                Array.from(e.dataTransfer.types).includes("Files")
            ) {
                e.preventDefault();
                e.stopPropagation();
                dragCounter.current++;
                if (dragCounter.current === 1) {
                    setIsDraggingOverWindow(true);
                }
            }
        };

        const handleDragLeaveWindow = (e: DragEvent) => {
            if (
                e.target === document.documentElement ||
                !document.documentElement.contains(e.relatedTarget as Node)
            ) {
                dragCounter.current--;
                if (dragCounter.current === 0) {
                    setIsDraggingOverWindow(false);
                }
            } else if (dragCounter.current > 0 && !e.relatedTarget) {
                dragCounter.current = 0;
                setIsDraggingOverWindow(false);
            }
        };

        const handleDragOverWindow = (e: DragEvent) => {
            if (
                e.dataTransfer &&
                Array.from(e.dataTransfer.types).includes("Files")
            ) {
                e.preventDefault();
                e.stopPropagation();
                if (!isDraggingOverWindow && dragCounter.current > 0) {
                    setIsDraggingOverWindow(true);
                }
            }
        };

        const handleDropWindow = (e: DragEvent) => {
            if (dragCounter.current > 0 || isDraggingOverWindow) {
                if (
                    e.dataTransfer &&
                    Array.from(e.dataTransfer.types).includes("Files")
                ) {
                    e.preventDefault();
                    e.stopPropagation();

                    const droppedFiles = e.dataTransfer.files;
                    if (droppedFiles && droppedFiles.length > 0) {
                        processFile(droppedFiles[0]);
                    }
                }
            }
            dragCounter.current = 0;
            setIsDraggingOverWindow(false);
            setIsDraggingOverDropZone(false);
        };

        document.addEventListener("dragenter", handleDragEnterWindow);
        document.addEventListener("dragleave", handleDragLeaveWindow);
        document.addEventListener("dragover", handleDragOverWindow);
        document.addEventListener("drop", handleDropWindow);

        return () => {
            document.removeEventListener("dragenter", handleDragEnterWindow);
            document.removeEventListener("dragleave", handleDragLeaveWindow);
            document.removeEventListener("dragover", handleDragOverWindow);
            document.removeEventListener("drop", handleDropWindow);
        };
    }, [processFile, isDraggingOverWindow]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const handleDragOverSpecificDropZone = (
        e: React.DragEvent<HTMLLabelElement>
    ) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOverDropZone(true);
    };

    const handleDragEnterSpecificDropZone = (
        e: React.DragEvent<HTMLLabelElement>
    ) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOverDropZone(true);
    };

    const handleDragLeaveSpecificDropZone = (
        e: React.DragEvent<HTMLLabelElement>
    ) => {
        e.preventDefault();
        e.stopPropagation();
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDraggingOverDropZone(false);
        }
    };

    const handleClearFile = () => {
        setFile(null);
        setUploadError("");
        setMessage("");
        const fileInput = document.getElementById(
            "file-upload"
        ) as HTMLInputElement;
        if (fileInput) {
            fileInput.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !name || validationError) return;

        setUploading(true);
        setMessage("");
        setUploadError("");

        try {
            const newBlob = await upload(file.name, file, {
                access: "public",
                handleUploadUrl: "/api/blob-upload",
            });

            const response = await fetch("/api/upload", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    modelName: name,
                    blobUrl: newBlob.url,
                    filename: newBlob.pathname,
                    fileSize: file.size,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                        t("errors.saveFailed", {
                            default: "Saving model metadata failed",
                        })
                );
            }

            setMessage(
                t("success.uploaded", {
                    default: "Model uploaded and registered successfully",
                })
            );
            setFile(null);
            setName("");

            if (onUploadSuccess) {
                onUploadSuccess();
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : t("errors.unknownUpload", {
                          default: "Unknown error during upload process",
                      });
            setUploadError(
                `${t("errors.prefix", { default: "Error" })}: ${errorMessage}`
            );
        } finally {
            setUploading(false);
        }
    };

    if (translationsLoading)
        return <div>{t("loading", { default: "Loading..." })}</div>;

    const isLoading = validating || uploading;
    const displayError = validationError || uploadError;

    return (
        <>
            {isDraggingOverWindow && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex flex-col items-center justify-center z-[9999] text-white p-4 transition-opacity duration-150">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-20 w-20 mb-4 text-blue-400 animate-bounce"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                        />
                    </svg>
                    <h2 className="text-2xl font-semibold mb-2">
                        {t("dragDrop.title", {
                            default: "Drop your .glb file",
                        })}
                    </h2>
                    <p className="text-md">
                        {t("dragDrop.subtitle", {
                            default: "Drag the file over the upload area.",
                        })}
                    </p>
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                {displayError && (
                    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {displayError}
                    </div>
                )}
                {warning && (
                    <div className="p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                        {warning}
                    </div>
                )}
                <div>
                    <label
                        htmlFor="modelNameInput"
                        className="block text-md font-medium dark:text-gray-100 text-gray-800"
                    >
                        {t("modelName", { default: "Model Name" })}
                    </label>
                    <input
                        id="modelNameInput"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border bg-gray-50 border-gray-400 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        required
                        placeholder={t("modelNamePlaceholder", {
                            default: "Enter a name for your model",
                        })}
                    />
                </div>

                <div>
                    <span className="block text-md font-medium dark:text-gray-100 text-gray-800 mb-1">
                        {t("uploadLabel", { default: "Upload .glb CAD file" })}
                    </span>
                    <label
                        htmlFor="file-upload"
                        onDragOver={handleDragOverSpecificDropZone}
                        onDragEnter={handleDragEnterSpecificDropZone}
                        onDragLeave={handleDragLeaveSpecificDropZone}
                        className={`mt-1 flex flex-col items-center justify-center w-full h-48 px-6 py-10 border-2
                                    ${
                                        isDraggingOverDropZone
                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400"
                                            : "border-gray-300 border-dashed hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 dark:bg-gray-700/30"
                                    }
                                    rounded-lg cursor-pointer transition-all duration-200 ease-in-out group`}
                    >
                        <div className="flex flex-col items-center justify-center text-center">
                            <svg
                                className={`w-10 h-10 mb-3 transition-colors ${
                                    isDraggingOverDropZone
                                        ? "text-blue-500 dark:text-blue-400"
                                        : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400"
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                ></path>
                            </svg>
                            {file ? (
                                <>
                                    <p className="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-200 truncate max-w-full px-2">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {(file.size / (1024 * 1024)).toFixed(2)}{" "}
                                        MB
                                    </p>
                                    {validating && (
                                        <p className="text-xs text-blue-500 mt-2">
                                            {t("validating", {
                                                default: "Validating...",
                                            })}
                                        </p>
                                    )}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleClearFile();
                                        }}
                                        className="mt-2 text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                                    >
                                        {t("clearFile", {
                                            default: "Clear file",
                                        })}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p
                                        className={`mb-2 text-sm transition-colors ${
                                            isDraggingOverDropZone
                                                ? "text-blue-600 dark:text-blue-300"
                                                : "text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                                        }`}
                                    >
                                        <span className="font-semibold">
                                            {isDraggingOverDropZone
                                                ? t("dropZone.releaseText", {
                                                      default:
                                                          "Release to drop file",
                                                  })
                                                : t("dropZone.clickText", {
                                                      default:
                                                          "Click to upload",
                                                  })}
                                        </span>{" "}
                                        {t("dropZone.dragText", {
                                            default: "or drag and drop",
                                        })}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {t("dropZone.fileInfo", {
                                            default:
                                                "GLB files only (MAX. 10MB)",
                                        })}
                                    </p>
                                </>
                            )}
                        </div>
                        <input
                            id="file-upload"
                            type="file"
                            className="sr-only"
                            accept=".glb"
                            onChange={handleFileChange}
                            required={!file}
                        />
                    </label>
                </div>

                {file && (
                    <UploadedModelInfo
                        file={file}
                        modelInfo={modelInfo}
                        t={t}
                    />
                )}

                <button
                    type="submit"
                    disabled={isLoading || !file || !name || !!validationError}
                    className="w-full bg-blue-500 text-white px-4 py-2.5 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:text-gray-500 disabled:cursor-not-allowed dark:disabled:bg-gray-600 dark:disabled:text-gray-400 transition-colors"
                >
                    {uploading
                        ? t("uploading", { default: "Uploading..." })
                        : t("uploadButton", { default: "Upload Model" })}
                </button>

                {message && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-300 text-sm text-green-600 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300 rounded">
                        {message}
                    </div>
                )}
            </form>
        </>
    );
}
