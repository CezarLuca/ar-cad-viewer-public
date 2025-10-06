"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";

interface LanguageToggleProps {
    isInMenu?: boolean;
}

export default function LanguageToggle({
    isInMenu = false,
}: LanguageToggleProps) {
    const { t } = useTranslations("ui");
    const { locale, setLocale, isLoading } = useLanguage();

    const toggleLanguage = () => {
        setLocale(locale === "en" ? "de" : "en");
    };

    if (isLoading) {
        if (isInMenu) {
            return (
                <div className="px-6 py-2 flex items-center space-x-2">
                    <span className="text-gray-700">{t("language")}:</span>
                    <span className="w-8 h-4 bg-gray-300 rounded animate-pulse"></span>
                </div>
            );
        }

        return (
            <div className="flex items-center space-x-1 px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700">
                <span className="text-lg">🌐</span>
                <span className="w-8 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></span>
            </div>
        );
    }

    if (isInMenu) {
        return (
            <button
                onClick={toggleLanguage}
                className="px-6 py-2 text-left hover:bg-gray-300 text-gray-700 flex items-center space-x-2 w-full"
                aria-label="Toggle language"
                title={`Switch to ${locale === "en" ? "German" : "English"}`}
            >
                <span>
                    {t("language")}: {locale.toUpperCase()}
                </span>
            </button>
        );
    }

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center space-x-1 px-3 mx-8 py-1 pl-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
            aria-label="Toggle language"
            title={`Switch to ${locale === "en" ? "German" : "English"}`}
        >
            <span className="text-lg">🌐</span>
            <span className="font-medium text-gray-700 dark:text-gray-200">
                {locale.toUpperCase()}
            </span>
        </button>
    );
}
