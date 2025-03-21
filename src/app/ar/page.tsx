"use client";

import dynamic from "next/dynamic";
import Loading from "@/app/loading";
import Navbar from "@/components/layout/Navbar";
import { useSearchParams } from "next/navigation";
import { ModelUrlProvider } from "@/context/ModelUrlContext";
import { Suspense } from "react";

// Import without SSR
const DynamicARCanvas = dynamic(
    () =>
        import("@/components/scene/ARCanvas").then((mod) => {
            // Store the enterAR function for later use
            return { default: mod.default };
        }),
    {
        ssr: false,
        loading: () => <Loading />,
    }
);

// Also import the enterAR function
import { enterAR } from "@/components/scene/ARCanvas";

export default function ARPage() {
    const searchParams = useSearchParams();
    const modelUrl = searchParams.get("model") || "/models/engine.glb";

    return (
        <ModelUrlProvider modelUrl={modelUrl}>
            <Navbar onEnterAR={enterAR} />
            <main className="h-screen w-screen">
                <Suspense fallback={<Loading />}>
                    <DynamicARCanvas />
                </Suspense>
            </main>
        </ModelUrlProvider>
    );
}
