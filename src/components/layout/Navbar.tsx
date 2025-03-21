"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
    rightContent?: React.ReactNode;
    onEnterAR?: () => void;
}

export default function Navbar({ rightContent, onEnterAR }: NavbarProps) {
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Determine if we're on the dashboard page
    const isDashboard = pathname === "/dashboard";
    // Determine if we're on the AR page
    const isARPage = pathname === "/ar";

    return (
        <div className="relative">
            <header className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 z-50">
                <div className="flex items-center">
                    <Link href="/" className="text-xl font-bold">
                        AR CAD Viewer
                    </Link>
                </div>

                <div className="flex items-center">
                    {session ? (
                        <div className="flex items-center space-x-4">
                            {/* Only show welcome message on dashboard */}
                            {isDashboard && (
                                <span className="text-xl text-gray-200 hidden sm:inline">
                                    Welcome, {session.user?.name}
                                </span>
                            )}
                            <button
                                onClick={toggleMenu}
                                className="block p-2 focus:outline-none focus:bg-gray-700 rounded"
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
                    ) : // If on AR page and not logged in, show Enter AR button instead of login/register
                    isARPage && onEnterAR ? (
                        <button
                            onClick={onEnterAR}
                            className="bg-blue-600 text-gray-200 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Enter AR
                        </button>
                    ) : (
                        rightContent
                    )}
                </div>
            </header>

            {/* Vertical collapsible menu that appears below the navbar - only for authenticated users */}
            {session && (
                <div
                    className={`fixed top-14 right-0 z-40 bg-gray-200 border-l border-b border-gray-300 shadow-lg rounded-bl-lg transition-all duration-300 overflow-hidden ${
                        isMenuOpen ? "w-56 max-h-80" : "w-0 max-h-0"
                    }`}
                >
                    <div className="flex flex-col py-2">
                        {/* Show Enter AR button only on AR page */}
                        {isARPage && onEnterAR && (
                            <>
                                <button
                                    onClick={() => {
                                        onEnterAR();
                                        setIsMenuOpen(false);
                                    }}
                                    className="px-6 py-2 text-left hover:bg-blue-100 text-blue-700 font-semibold"
                                >
                                    Enter AR Mode
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
                        <Link
                            href="/ar"
                            className="px-6 py-2 hover:bg-gray-300 text-gray-700"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            View 3D Models
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
