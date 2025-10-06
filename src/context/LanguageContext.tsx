"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";

interface LanguageContextType {
    locale: string;
    setLocale: (locale: string) => void;
    isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
    undefined
);

function getBrowserLanguage(): string {
    if (typeof window === "undefined") return "en";

    const browserLang = navigator.language.toLowerCase();

    // Check if browser language starts with 'de' (German)
    if (browserLang.startsWith("de")) {
        return "de";
    }

    // Default to English for all other languages
    return "en";
}

function getStoredLanguage(): string {
    if (typeof window === "undefined") return "en";

    try {
        const stored = localStorage.getItem("preferred-language");
        if (stored && (stored === "en" || stored === "de")) {
            return stored;
        }
    } catch (error) {
        console.warn("Could not access localStorage:", error);
    }

    return getBrowserLanguage();
}

function storeLanguage(locale: string): void {
    if (typeof window === "undefined") return;

    try {
        localStorage.setItem("preferred-language", locale);
    } catch (error) {
        console.warn("Could not store language preference:", error);
    }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState("en");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Initialize language from storage or browser preference
        const initialLocale = getStoredLanguage();
        setLocaleState(initialLocale);
        setIsLoading(false);
    }, []);

    const setLocale = (newLocale: string) => {
        if (newLocale === locale) return;

        setLocaleState(newLocale);
        storeLanguage(newLocale);
        // Force a re-render of translations by dispatching a custom event
        window.dispatchEvent(
            new CustomEvent("languageChanged", { detail: newLocale })
        );
    };

    return (
        <LanguageContext.Provider value={{ locale, setLocale, isLoading }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
