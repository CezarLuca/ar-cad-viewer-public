"use client";

import dynamic from "next/dynamic";
import Loading from "@/app/loading";
import Navbar from "@/components/layout/Navbar";

// We'll pass an empty placeholder for rightContent as ARCanvas will handle the button
const ARCanvas = dynamic(() => import("@/components/scene/ARCanvas"), {
    ssr: false,
    loading: () => <Loading />,
});

export default function ARPage() {
    return (
        <>
            <Navbar />
            <main className="h-screen w-screen">
                <ARCanvas />
            </main>
        </>
    );
}
