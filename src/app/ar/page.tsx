"use client";

import dynamic from "next/dynamic";
import Loading from "@/app/loading";
import Navbar from "@/components/layout/Navbar";
import { useSearchParams } from "next/navigation";
import { ModelUrlProvider } from "@/context/ModelUrlContext";

// We'll pass an empty placeholder for rightContent as ARCanvas will handle the button
const ARCanvas = dynamic(() => import("@/components/scene/ARCanvas"), {
    ssr: false,
    loading: () => <Loading />,
});

export default function ARPage() {
    const searchParams = useSearchParams();
    const modelUrl = searchParams.get("model") || "/models/engine.glb";

    return (
        <ModelUrlProvider modelUrl={modelUrl}>
            <Navbar />
            <main className="h-screen w-screen">
                <ARCanvas />
            </main>
        </ModelUrlProvider>
    );
}
