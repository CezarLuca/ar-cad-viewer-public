"use client";

import dynamic from "next/dynamic";
import Loading from "@/app/loading";

const ARCanvas = dynamic(() => import("@/components/scene/ARCanvas"), {
    ssr: false,
    loading: () => <Loading />,
});

export default function ARPage() {
    return (
        <main className="h-screen w-screen">
            <ARCanvas />
        </main>
    );
}
