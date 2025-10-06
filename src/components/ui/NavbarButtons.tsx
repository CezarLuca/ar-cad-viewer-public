"use client";

import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";

interface NavbarButtonsProps {
    variant?: "desktop" | "mobile";
    onMenuClose?: () => void;
}

export default function NavbarButtons({
    variant = "desktop",
    onMenuClose,
}: NavbarButtonsProps) {
    const { t } = useTranslations("navbar");

    if (variant === "mobile") {
        return (
            <>
                <Link
                    href="/auth/login"
                    className="px-6 py-2 hover:bg-gray-300 text-gray-700"
                    onClick={onMenuClose}
                >
                    {t("login")}
                </Link>
                <Link
                    href="/auth/register"
                    className="px-6 py-2 hover:bg-gray-300 text-gray-700"
                    onClick={onMenuClose}
                >
                    {t("register")}
                </Link>
            </>
        );
    }

    return (
        <div className="flex space-x-2">
            <Link
                href="/auth/login"
                className="bg-gray-600 text-gray-50 px-4 py-1 rounded-lg hover:bg-gray-800 hover:border-gray-200 transition-colors text-xl"
            >
                {t("login")}
            </Link>
            <Link
                href="/auth/register"
                className="bg-gray-300 text-gray-800 px-4 py-1 rounded-lg hover:bg-gray-400 hover:border-gray-900 transition-colors text-xl"
            >
                {t("register")}
            </Link>
        </div>
    );
}
