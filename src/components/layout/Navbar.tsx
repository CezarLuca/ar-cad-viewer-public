"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAR } from "@/context/ARContext";
import { useTranslations } from "@/hooks/useTranslations";
import LanguageToggle from "@/components/ui/LanguageToggle";
import NavbarButtons from "@/components/ui/NavbarButtons";

interface NavbarProps {
    rightContent?: React.ReactNode;
}

export default function Navbar({ rightContent }: NavbarProps) {
    const { t } = useTranslations("navbar");
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    const { isARPresenting, setIsARPresenting } = useAR();
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const toggleAR = () => {
        setIsARPresenting((prev) => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                buttonRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen]);

    const isDashboard = pathname === "/dashboard";
    const isARPage = pathname === "/ar";
    const isHomePage = pathname === "/";
    const isTrackerPage = pathname === "/tracker";

    return (
        <div className="relative">
            <header
                className={
                    isHomePage || isTrackerPage
                        ? `fixed top-0 left-0 right-0 h-14 bg-gray-100/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-1 sm:px-2 z-50`
                        : `fixed top-0 left-0 right-0 h-14 bg-gray-100/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-1 sm:px-2 z-50`
                }
            >
                <div className="flex items-center space-x-2 sm:space-x-6 pl-2">
                    <Link
                        href="/"
                        className="px-2 text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 text-shadow-xs dark:text-shadow-md text-shadow-gray-600"
                    >
                        {t("title")}
                    </Link>
                </div>

                <div className="flex items-center">
                    {session ? (
                        <div className="flex items-center space-x-1 px-1">
                            {isDashboard && (
                                <span className="text-xl text-gray-800 dark:text-gray-200 hidden lg:inline">
                                    {t("welcome", {
                                        name: session.user?.name || "",
                                    })}
                                </span>
                            )}

                            <button
                                ref={buttonRef}
                                onClick={toggleMenu}
                                className="p-2 focus:outline-none rounded text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                aria-label="Menu"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d={
                                            isMenuOpen
                                                ? "M6 18L18 6M6 6l12 12"
                                                : "M4 6h16M4 12h16M4 18h16"
                                        }
                                    ></path>
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-3 px-4">
                            <div className="hidden md:flex items-center space-x-3">
                                <LanguageToggle />
                                {isARPage ? (
                                    <button
                                        onClick={toggleAR}
                                        className="bg-blue-600 text-gray-200 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        {isARPresenting
                                            ? t("exitAR")
                                            : t("enterAR")}
                                    </button>
                                ) : (
                                    rightContent
                                )}
                            </div>

                            <button
                                ref={buttonRef}
                                onClick={toggleMenu}
                                className="md:hidden p-2 focus:outline-none rounded text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                aria-label="Menu"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d={
                                            isMenuOpen
                                                ? "M6 18L18 6M6 6l12 12"
                                                : "M4 6h16M4 12h16M4 18h16"
                                        }
                                    ></path>
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {(session || isMenuOpen) && (
                <div
                    ref={menuRef}
                    className={`fixed top-14 right-0 z-40 bg-gray-200 border-1 border-b border-gray-600 shadow-lg shadow-gray-700 rounded-bl-lg transition-all duration-200 ${
                        isMenuOpen ? "w-56 max-h-80" : "w-0 max-h-0"
                    }`}
                >
                    <div className="flex flex-col py-2">
                        <LanguageToggle isInMenu={true} />
                        <div className="border-t border-gray-300 my-1"></div>

                        {session ? (
                            <>
                                {isARPage && (
                                    <>
                                        <button
                                            onClick={() => {
                                                toggleAR();
                                                setIsMenuOpen(false);
                                            }}
                                            className="px-6 py-2 text-left hover:bg-blue-100 text-blue-700 font-semibold"
                                        >
                                            {isARPresenting
                                                ? t("exitAR")
                                                : t("enterAR")}
                                        </button>
                                        <div className="border-t border-gray-300 my-1"></div>
                                    </>
                                )}

                                <Link
                                    href="/dashboard"
                                    className="px-6 py-2 hover:bg-gray-300 text-gray-700"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {t("dashboard")}
                                </Link>
                                <Link
                                    href="/tracker"
                                    className="px-6 py-2 hover:bg-gray-300 text-gray-700"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {t("arTracker")}
                                </Link>
                                {session.user?.role === "admin" && (
                                    <Link
                                        href="/admin"
                                        className="px-6 py-2 hover:bg-blue-100 text-blue-700"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {t("adminPanel")}
                                    </Link>
                                )}

                                <div className="border-t border-gray-300 my-1"></div>
                                <button
                                    onClick={() =>
                                        signOut({ callbackUrl: "/" })
                                    }
                                    className="px-6 py-2 text-left hover:bg-red-100 text-red-600"
                                >
                                    {t("logout")}
                                </button>
                            </>
                        ) : (
                            <>
                                {isARPage && (
                                    <>
                                        <button
                                            onClick={() => {
                                                toggleAR();
                                                setIsMenuOpen(false);
                                            }}
                                            className="px-6 py-2 text-left hover:bg-blue-100 text-blue-700 font-semibold"
                                        >
                                            {isARPresenting
                                                ? t("exitAR")
                                                : t("enterAR")}
                                        </button>
                                        <div className="border-t border-gray-300 my-1"></div>
                                    </>
                                )}

                                <NavbarButtons
                                    variant="mobile"
                                    onMenuClose={() => setIsMenuOpen(false)}
                                />
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
