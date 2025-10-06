import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "@/hooks/useTranslations";

interface Screenshot {
    id: number;
    model_id: number;
    filename: string;
    blob_url: string;
    created_at: string;
}

interface ModelScreenshotsProps {
    modelId: number;
}

export default function ModelScreenshots({ modelId }: ModelScreenshotsProps) {
    const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [invalidData, setInvalidData] = useState<boolean>(false);
    const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
    const autoRotateIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const { t } = useTranslations("modelScreenshots");

    const fetchScreenshots = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/screenshots?modelId=${modelId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch screenshots");
            }

            const data = await response.json();
            // Get up to 4 screenshots
            if (data.screenshots && Array.isArray(data.screenshots)) {
                setScreenshots(data.screenshots.slice(0, 4));
                setInvalidData(false);
            } else {
                setScreenshots([]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
            setScreenshots([]);
        } finally {
            setLoading(false);
        }
    }, [modelId]);

    // Detect touch device
    useEffect(() => {
        const detectTouch = () => {
            setIsTouchDevice(
                "ontouchstart" in window ||
                    navigator.maxTouchPoints > 0 ||
                    ("msMaxTouchPoints" in navigator &&
                        typeof (
                            navigator as Navigator & {
                                msMaxTouchPoints?: number;
                            }
                        ).msMaxTouchPoints === "number" &&
                        (navigator as Navigator & { msMaxTouchPoints?: number })
                            .msMaxTouchPoints! > 0)
            );
        };

        detectTouch();
        window.addEventListener("touchstart", () => setIsTouchDevice(true), {
            once: true,
        });

        return () => {
            window.removeEventListener("touchstart", () =>
                setIsTouchDevice(true)
            );
        };
    }, []);

    useEffect(() => {
        fetchScreenshots();
    }, [fetchScreenshots]);

    // Reset active index whenever screenshots change
    useEffect(() => {
        setActiveIndex(0);
    }, [screenshots]);

    // Auto-rotate images for touch devices
    useEffect(() => {
        if (isTouchDevice && screenshots.length > 1) {
            // Clear any existing interval
            if (autoRotateIntervalRef.current) {
                clearInterval(autoRotateIntervalRef.current);
            }

            // Set up auto-rotation every 3 seconds
            autoRotateIntervalRef.current = setInterval(() => {
                setActiveIndex((prevIndex) =>
                    prevIndex === screenshots.length - 1 ? 0 : prevIndex + 1
                );
            }, 3000);
        }

        return () => {
            if (autoRotateIntervalRef.current) {
                clearInterval(autoRotateIntervalRef.current);
                autoRotateIntervalRef.current = null;
            }
        };
    }, [isTouchDevice, screenshots.length]);

    const handleMouseLeave = () => {
        if (isTouchDevice || screenshots.length < 2) return; // Skip for touch devices or if only one screenshot
        setTimeout(() => {
            setActiveIndex(0); // Reset to the first screenshot when not hovering
        }, 200); // Delay before resetting
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isTouchDevice || screenshots.length < 2) return; // No hover effect if only one screenshot

        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const x = e.clientX - rect.left; // x position within the element

        // Calculate which section was hovered based on x coordinate
        const sectionWidth = width / screenshots.length;
        const newIndex = Math.min(
            screenshots.length - 1,
            Math.floor(x / sectionWidth)
        );
        setTimeout(() => {
            setActiveIndex(newIndex);
        }, 50);
    };

    // Manual navigation for touch devices
    const goToSlide = (index: number) => {
        if (autoRotateIntervalRef.current) {
            clearInterval(autoRotateIntervalRef.current);
        }

        setActiveIndex(index);

        if (isTouchDevice && screenshots.length > 1) {
            // Restart auto-rotation after manual navigation
            autoRotateIntervalRef.current = setInterval(() => {
                setActiveIndex((prevIndex) =>
                    prevIndex === screenshots.length - 1 ? 0 : prevIndex + 1
                );
            }, 3000);
        }
    };

    if (loading) {
        return (
            <div className="w-full h-full rounded bg-gray-200 animate-pulse flex items-center justify-center">
                <span className="sr-only">{t("loading")}</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full rounded bg-red-100 flex items-center justify-center">
                <span className="text-xs text-red-500">{t("error")}</span>
            </div>
        );
    }

    if (!screenshots || screenshots.length === 0) {
        return (
            <div className="w-full h-full rounded bg-gray-500 flex items-center justify-center">
                <span className="text-2xl text-gray-800 text-center">
                    {t("noScreenshots")}
                </span>
            </div>
        );
    }

    // Safety check to ensure activeIndex is valid
    const safeIndex = activeIndex < screenshots.length ? activeIndex : 0;
    const currentScreenshot = screenshots[safeIndex];

    // Safety check to ensure screenshot has blob_url
    if (!currentScreenshot || !currentScreenshot.blob_url) {
        // Set invalid data flag to trigger a retry
        if (!invalidData) {
            setInvalidData(true);
            setActiveIndex(0); // Reset to the first screenshot
            setTimeout(() => {
                setInvalidData(false); // Reset invalid data flag
            }, 2000);
        }

        return (
            <div className="w-full h-full rounded bg-gray-400 flex items-center justify-center">
                <span className="text-gray-800 text-lg">
                    {t("invalidData")}
                </span>
            </div>
        );
    }

    return (
        <div
            className="w-full h-full relative"
            onMouseMove={
                !isTouchDevice && screenshots.length >= 2
                    ? handleMouseMove
                    : undefined
            }
            onMouseLeave={
                !isTouchDevice && screenshots.length >= 2
                    ? handleMouseLeave
                    : undefined
            }
        >
            {/* Display the active screenshot */}
            <Image
                src={currentScreenshot.blob_url}
                alt={t("viewScreenshot", { number: safeIndex + 1 })}
                className="rounded object-cover"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
            />

            {/* Indicators (clickable for touch devices) */}
            {screenshots.length > 1 && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 z-10">
                    {screenshots.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => goToSlide(idx)}
                            className={`h-2 rounded-full transition-all ${
                                idx === safeIndex
                                    ? "bg-white w-6"
                                    : "bg-white/50 w-2 hover:bg-white/75"
                            }`}
                            aria-label={t("viewScreenshot", {
                                number: idx + 1,
                            })}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
