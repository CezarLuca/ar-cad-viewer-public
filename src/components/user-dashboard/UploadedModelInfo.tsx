import React from "react";
import { ModelInfo } from "@/utils/fileValidation";

interface UploadedModelInfoProps {
    file: File;
    modelInfo: ModelInfo;
    t: (key: string, options?: { [key: string]: string | number }) => string;
}

export default function UploadedModelInfo({
    file,
    modelInfo,
    t,
}: UploadedModelInfoProps) {
    if (!modelInfo.dimensions) return null;

    return (
        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-1 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-1">
                {t("modelDetails.title", { default: "Model Details:" })}
            </h4>
            <div>
                {t("modelDetails.size", { default: "Size" })}:{" "}
                {(file.size / (1024 * 1024)).toFixed(2)} MB
            </div>
            {modelInfo.dimensions && (
                <div>
                    {t("modelDetails.dimensions", { default: "Dimensions" })}:
                    {` ${modelInfo.dimensions.x.toFixed(
                        2
                    )} × ${modelInfo.dimensions.y.toFixed(
                        2
                    )} × ${modelInfo.dimensions.z.toFixed(2)} ${t(
                        "modelDetails.units",
                        {
                            default: "units",
                        }
                    )}`}
                </div>
            )}
            {modelInfo.volume !== undefined && (
                <div>
                    {t("modelDetails.boundingBoxVolume", {
                        default: "Bounding Box Volume",
                    })}
                    : {modelInfo.volume.toFixed(2)}{" "}
                    {t("modelDetails.cubicUnits", { default: "cubic units" })}
                </div>
            )}
            {modelInfo.preciseVolume !== undefined && (
                <div>
                    {t("modelDetails.estimatedVolume", {
                        default: "Estimated True Volume",
                    })}
                    : {modelInfo.preciseVolume.toFixed(2)}{" "}
                    {t("modelDetails.cubicUnits", { default: "cubic units" })}
                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                        ({(modelInfo.accuracy! * 100).toFixed(1)}%{" "}
                        {t("modelDetails.confidence", {
                            default: "confidence",
                        })}
                        )
                    </span>
                </div>
            )}
        </div>
    );
}
