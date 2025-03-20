"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();

    console.log("Session", session);

    if (status === "loading") {
        return <div>Loading...</div>;
    }

    if (!session) {
        router.push("/auth/login");
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-gray-800 text-white p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href="/" className="text-xl font-bold">
                        AR CAD Viewer
                    </Link>
                    <div className="flex items-center space-x-4">
                        <span className="text-xl text-gray-200">
                            Welcome, {session.user.name}
                        </span>
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="bg-gray-500 hover:bg-gray-600 text-gray-200 px-3 py-0.5 rounded transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1">
                <aside className="w-64 bg-gray-200 p-4">
                    <nav className="space-y-2">
                        <Link
                            href="/dashboard"
                            className="block p-2 hover:bg-gray-300 text-gray-600 border-y-1 rounded"
                        >
                            - Dashboard
                        </Link>
                        <Link
                            href="/ar"
                            className="block p-2 hover:bg-gray-300 text-gray-600 border-y-1 rounded"
                        >
                            - View 3D Models
                        </Link>
                        {session.user.role === "admin" && (
                            <Link
                                href="/admin"
                                className="block p-2 hover:bg-blue-800 border-y-1 rounded text-blue-700"
                            >
                                Admin Panel
                            </Link>
                        )}
                    </nav>
                </aside>

                <main className="flex-1 bg-gray-100">{children}</main>
            </div>
        </div>
    );
}
