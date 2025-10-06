"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

type Messages = { [key: string]: string | Messages };

function interpolate(
    template: string,
    values: Record<string, string | number>
): string {
    return template.replace(/\{([^}]+)\}/g, (match, key) => {
        return values[key]?.toString() || match;
    });
}

function getNestedValue(obj: Messages, path: string): string {
    const result = path
        .split(".")
        .reduce(
            (current: string | Messages | undefined, key: string) =>
                typeof current === "object" ? current[key] : undefined,
            obj
        );

    return typeof result === "string" ? result : path;
}

export function useTranslations(namespace?: string) {
    const { locale, isLoading } = useLanguage();
    const [messages, setMessages] = useState<Messages>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isLoading) return;

        const loadMessages = async () => {
            try {
                const messageModule = await import(
                    `../../messages/${locale}.json`
                );
                setMessages(messageModule.default);
                setLoading(false);
            } catch (error) {
                console.error(
                    `Failed to load messages for locale ${locale}:`,
                    error
                );
                // Fallback to English
                try {
                    const fallbackModule = await import(
                        `../../messages/en.json`
                    );
                    setMessages(fallbackModule.default);
                    setLoading(false);
                } catch (fallbackError) {
                    console.error(
                        "Failed to load fallback messages:",
                        fallbackError
                    );
                    setLoading(false);
                }
            }
        };

        loadMessages();

        // Listen for language changes
        const handleLanguageChange = () => {
            loadMessages();
        };

        window.addEventListener("languageChanged", handleLanguageChange);
        return () =>
            window.removeEventListener("languageChanged", handleLanguageChange);
    }, [locale, isLoading]);

    const t = (
        key: string,
        values?: Record<string, string | number>
    ): string => {
        if (loading) return key;

        const fullKey = namespace ? `${namespace}.${key}` : key;
        const template = getNestedValue(messages, fullKey);

        if (values) {
            return interpolate(template, values);
        }

        return template;
    };

    return { t, loading };
}
