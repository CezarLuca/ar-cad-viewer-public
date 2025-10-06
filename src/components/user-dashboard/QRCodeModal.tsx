"use client";

import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import dynamic from "next/dynamic";
import { useTranslations } from "@/hooks/useTranslations";

// Dynamically import ThreeJsBackground to avoid SSR issues
const ThreeJsBackground = dynamic(
    () => import("@/components/sfx/ThreeJsBackground"),
    { ssr: false }
);

interface QRCodeModalProps {
    url: string;
    modelName: string;
    fileName: string;
    onClose: () => void;
}

const getQrSize = () => {
    if (typeof window === "undefined") return 280;
    if (window.innerWidth >= 1024) return 440; // lg
    if (window.innerWidth >= 768) return 380; // md
    return 280; // sm
};

const QrCodeModal = ({
    url,
    modelName,
    fileName,
    onClose,
}: QRCodeModalProps) => {
    const [qrSize, setQrSize] = useState(getQrSize());
    const { t } = useTranslations("qrCodeModal");

    useEffect(() => {
        const handleResize = () => setQrSize(getQrSize());
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleDownloadQr = () => {
        const canvas = document.getElementById(
            "qr-code-canvas-modal"
        ) as HTMLCanvasElement;
        if (canvas) {
            const pngUrl = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = fileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <ThreeJsBackground />
            <div className="fixed inset-0 bg-gray-800/60 dark:bg-gray-900/70 transition-opacity duration-300" />
            <div className="relative p-6 border shadow-xl rounded-lg bg-white dark:bg-gray-900 dark:border-gray-700 max-w-md md:max-w-lg lg:max-w-xl w-full mx-4 md:mx-8">
                <div className="text-center">
                    <h3 className="text-xl md:text-2xl lg:text-3xl leading-6 font-bold text-gray-900 dark:text-gray-100 mb-3">
                        {modelName}
                    </h3>
                    <div className="my-4 inline-block p-2 md:p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                        <QRCodeCanvas
                            id="qr-code-canvas-modal"
                            value={url}
                            size={qrSize}
                            level={"H"}
                            marginSize={4}
                            bgColor={"#ffffff"}
                            fgColor={"#000000"}
                        />
                    </div>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-5">
                        {t("scanCode")}
                    </p>
                </div>
                <div className="flex flex-col space-y-3">
                    <button
                        onClick={handleDownloadQr}
                        className="px-4 py-2 bg-gray-100 text-gray-800 text-base font-medium rounded-md w-full shadow-md hover:bg-gray-300 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-150"
                    >
                        {t("downloadQRCode")}
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-base font-medium rounded-md w-full shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-gray-600 transition-colors duration-150"
                    >
                        {t("close")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QrCodeModal;
