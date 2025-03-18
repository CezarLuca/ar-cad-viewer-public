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
                    <Link href="/dashboard" className="text-xl font-bold">
                        AR CAD Viewer
                    </Link>
                    <div className="flex items-center space-x-4">
                        <span>Welcome, {session.user.name}</span>
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1">
                <aside className="w-64 bg-gray-100 p-4">
                    <nav className="space-y-2">
                        <Link
                            href="/dashboard"
                            className="block p-2 hover:bg-gray-200 rounded"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/ar"
                            className="block p-2 hover:bg-gray-200 rounded"
                        >
                            View 3D Models
                        </Link>
                        {session.user.role === "admin" && (
                            <Link
                                href="/admin"
                                className="block p-2 hover:bg-gray-200 rounded text-blue-600"
                            >
                                Admin Panel
                            </Link>
                        )}
                    </nav>
                </aside>

                <main className="flex-1 bg-gray-50">{children}</main>
            </div>
        </div>
    );
}
