"use client";

import { useTranslations } from "@/hooks/useTranslations";

export default function Footer() {
    const { t } = useTranslations("footer");
    const year = new Date().getFullYear();
    const githubUrl = "https://github.com/CezarLuca";

    return (
        <footer className="w-full bg-gray-100/80 dark:bg-gray-900/80 border-t border-gray-200 dark:border-gray-800 py-4 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                <p>{t("copyright", { year })}</p>

                <div className="flex items-center mt-2 sm:mt-0">
                    {/* left group: policies */}
                    <div className="flex space-x-4">
                        <a
                            href="/privacy-policy"
                            className="hover:text-gray-800 dark:hover:text-gray-200"
                        >
                            {t("privacyPolicy")}
                        </a>
                        <a
                            href="/terms-of-service"
                            className="hover:text-gray-800 dark:hover:text-gray-200"
                        >
                            {t("termsOfService")}
                        </a>
                    </div>

                    <div className="flex items-center ml-6 pl-4 border-l border-gray-200 dark:border-gray-800 space-x-3">
                        <a
                            href="mailto:cezar.luca96@gmail.com"
                            className="p-1 rounded hover:text-gray-800 dark:hover:text-gray-200"
                            aria-label={t("contactAria", {
                                email: "cezar.luca96@gmail.com",
                            })}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    d="M4 4h16v16H4z"
                                    stroke="none"
                                    opacity="0"
                                />
                                <rect
                                    x="3"
                                    y="5"
                                    width="18"
                                    height="14"
                                    rx="2"
                                />
                                <path d="M3 7l8.5 6L20 7" />
                            </svg>
                            <span className="sr-only">
                                {t("contactAria", {
                                    email: "cezar.luca96@gmail.com",
                                })}
                            </span>
                        </a>

                        <a
                            href={githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded hover:text-gray-800 dark:hover:text-gray-200"
                            aria-label={t("github")}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M12 .5C5.73.5.75 5.48.75 11.75c0 4.94 3.2 9.12 7.64 10.6.56.1.76-.24.76-.53 0-.26-.01-.96-.01-1.88-3.11.68-3.77-1.5-3.77-1.5-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1.01 1.73 2.66 1.23 3.31.94.1-.73.39-1.23.71-1.51-2.48-.28-5.09-1.24-5.09-5.51 0-1.22.44-2.21 1.15-2.99-.12-.28-.5-1.42.11-2.97 0 0 .95-.3 3.12 1.14a10.8 10.8 0 0 1 2.84-.38c.96.01 1.93.13 2.84.38 2.17-1.44 3.12-1.14 3.12-1.14.61 1.55.23 2.69.11 2.97.71.78 1.15 1.77 1.15 2.99 0 4.27-2.62 5.22-5.11 5.5.4.35.76 1.03.76 2.08 0 1.5-.01 2.71-.01 3.08 0 .29.2.64.77.53C20.05 20.87 23.25 16.69 23.25 11.75 23.25 5.48 18.27.5 12 .5z" />
                            </svg>
                            <span className="sr-only">{t("github")}</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
