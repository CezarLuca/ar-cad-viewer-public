"use client";

import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";

export default function HomeContent() {
    const { t } = useTranslations("home");

    return (
        <>
            <div className="max-w-3xl text-center mb-12">
                <h3 className="text-xl dark:text-gray-100 text-gray-800 mb-4">
                    {t("tryVisualizer")}
                </h3>
                <Link
                    href="/ar"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gray-50/70 text-gray-800 hover:bg-gray-50 border border-gray-800 hover:border-gray-900 shadow-xl shadow-gray-500/50 transition-colors text-xl sm:text-2xl text-center whitespace-normal break-words max-w-[20rem]"
                >
                    {t("tryVisualizerButton")}
                </Link>
            </div>
            <div className="max-w-3xl text-center mb-12">
                <h3 className="text-xl dark:text-gray-100 text-gray-800 mb-4">
                    {t("getTracker")}
                </h3>
                <Link
                    href="/tracker"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gray-50/70 text-gray-800 hover:bg-gray-50 border border-gray-800 hover:border-gray-900 shadow-xl shadow-gray-500/50 transition-colors text-xl sm:text-2xl text-center whitespace-normal break-words max-w-[20rem]"
                >
                    {t("arTrackingSetup")}
                </Link>
            </div>
        </>
    );
}
