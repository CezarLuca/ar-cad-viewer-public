"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "./Navbar";
import { useTranslations } from "@/hooks/useTranslations";

export default function DashboardLayout({
    children,
    titleKey = "title",
}: {
    children: React.ReactNode;
    titleKey?: string;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { t, loading } = useTranslations("dashboard");

    if (status === "loading" || loading) {
        return <div>Loading...</div>;
    }

    if (!session) {
        router.push("/auth/login");
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 mt-10 pt-4">
                <div className="p-6">
                    <h1 className="text-2xl dark:text-gray-300 text-gray-700 font-bold mb-6">
                        {t(titleKey)}
                    </h1>
                    {children}
                </div>
            </main>
        </div>
    );
}
