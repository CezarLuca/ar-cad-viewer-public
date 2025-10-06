"use client";

import { useTranslations } from "@/hooks/useTranslations";
import Image from "next/image";

export default function TrackerInfo() {
    const { t } = useTranslations("tracker");

    return (
        <>
            <div className="max-w-3xl text-center mb-6">
                <h1 className="text-4xl dark:text-gray-100 text-gray-800 font-bold mb-8 text-center">
                    {t("title")}
                </h1>
                <h2 className="text-xl dark:text-gray-100 text-gray-800 mb-4">
                    {t("description")}
                </h2>
            </div>

            <div className="bg-gray-400 dark:bg-gray-800 p-1 rounded-lg shadow-lg mb-1">
                <Image
                    src="/markers/tracker3.png"
                    alt="AR Tracking Marker"
                    width={300}
                    height={300}
                    className="mx-auto"
                />
            </div>

            <div className="max-w-2xl space-y-12">
                <div className="flex justify-center mt-1">
                    <a
                        href="/markers/tracker3.png"
                        download="ar_tracker.png"
                        className="bg-green-600 text-xl text-gray-200 px-8 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                        </svg>
                        {t("downloadTracker")}
                    </a>
                </div>

                <div className="dark:bg-gray-800 bg-gray-200 p-6 rounded-lg">
                    <h3 className="text-xl dark:text-gray-100 text-gray-900 font-semibold mb-4">
                        {t("instructionsTitle")}
                    </h3>
                    <ol className="dark:text-gray-200 text-gray-800 text-left list-decimal pl-6 space-y-3">
                        <li>{t("instructions.step1")}</li>
                        <li>{t("instructions.step2", { size: t("size") })}</li>
                        <li>{t("instructions.step3")}</li>
                        <li>
                            {t("instructions.step4", { device: t("device") })}
                        </li>
                        <li>
                            {t("instructions.step5", {
                                link: t("chromeFlags"),
                                flag: t("webxrFlag"),
                            })}
                        </li>
                        <li>{t("instructions.step6")}</li>
                    </ol>
                </div>

                <div className="dark:bg-gray-800 bg-gray-200 p-6 rounded-lg">
                    <h3 className="text-xl dark:text-gray-100 text-gray-900 font-semibold mb-4">
                        {t("tipsTitle")}
                    </h3>
                    <ul className="dark:text-gray-200 text-gray-800 text-left list-disc pl-6 space-y-3">
                        <li>{t("tips.tip1")}</li>
                        <li>{t("tips.tip2")}</li>
                        <li>{t("tips.tip3")}</li>
                        <li>{t("tips.tip4")}</li>
                    </ul>
                </div>
            </div>
        </>
    );
}
