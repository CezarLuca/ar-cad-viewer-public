"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAR } from "@/context/ARContext";

interface NavbarProps {
    rightContent?: React.ReactNode;
}

export default function Navbar({ rightContent }: NavbarProps) {
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    const { isARPresenting, setIsARPresenting } = useAR();
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    // This toggle simply mounts or dismounts the AR scene.
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

    return (
        <div className="relative">
            <header className="fixed top-0 left-0 right-0 h-18 sm:h-14 bg-gray-100/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 z-50">
                <div className="flex items-center space-x-2 sm:space-x-6">
                    <Link
                        href="/"
                        className="px-2 text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 text-shadow-xs dark:text-shadow-md text-shadow-gray-600"
                    >
                        AR CAD Viewer
                    </Link>
                </div>

                <div className="flex items-center px-4">
                    {session ? (
                        <div className="flex items-center space-x-4">
                            {isDashboard && (
                                <span className="text-xl text-gray-800 dark:text-gray-200 hidden sm:inline">
                                    Welcome, {session.user?.name}
                                </span>
                            )}
                            <button
                                ref={buttonRef}
                                onClick={toggleMenu}
                                className="block p-2 focus:outline-none rounded text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
                    ) : isARPage ? (
                        <button
                            onClick={toggleAR}
                            className="bg-blue-600 text-gray-200 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {isARPresenting ? "Exit AR" : "Enter AR"}
                        </button>
                    ) : (
                        rightContent
                    )}
                </div>
            </header>

            {session && (
                <div
                    ref={menuRef}
                    className={`fixed top-18 sm:top-14 right-0 z-40 bg-gray-200 border-1 border-b border-gray-600 shadow-lg shadow-gray-700 rounded-bl-lg transition-all duration-200 ${
                        isMenuOpen ? "w-56 max-h-80" : "w-0 max-h-0"
                    }`}
                >
                    <div className="flex flex-col py-2">
                        {isARPage && (
                            <>
                                <button
                                    onClick={() => {
                                        toggleAR();
                                        setIsMenuOpen(false);
                                    }}
                                    className="px-6 py-2 text-left hover:bg-blue-100 text-blue-700 font-semibold"
                                >
                                    {isARPresenting ? "Exit AR" : "Enter AR"}
                                </button>
                                <div className="border-t border-gray-300 my-1"></div>
                            </>
                        )}

                        <Link
                            href="/dashboard"
                            className="px-6 py-2 hover:bg-gray-300 text-gray-700"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Dashboard
                        </Link>
                        {/* <Link
                            href="/ar"
                            className="px-6 py-2 hover:bg-gray-300 text-gray-700"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            View 3D Models
                        </Link> */}
                        <Link
                            href="/tracker"
                            className="px-6 py-2 hover:bg-gray-300 text-gray-700"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            AR Tracker
                        </Link>
                        {session.user?.role === "admin" && (
                            <Link
                                href="/admin"
                                className="px-6 py-2 hover:bg-blue-100 text-blue-700"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Admin Panel
                            </Link>
                        )}
                        <div className="border-t border-gray-300 my-1"></div>
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="px-6 py-2 text-left hover:bg-red-100 text-red-600"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
