"use client";

import Loading from "@/app/loading";
import Navbar from "@/components/layout/Navbar";
import { useSearchParams } from "next/navigation";
import { ModelUrlProvider } from "@/context/ModelUrlContext";
import { Suspense } from "react";
import ARCanvas from "@/components/scene/ARCanvas";
import { ARProvider } from "@/context/ARContext";
import "webxr-polyfill";

export default function ARPage() {
    const searchParams = useSearchParams();
    const modelUrl = searchParams.get("model") || "/models/engine.glb";

    return (
        <ARProvider>
            <ModelUrlProvider modelUrl={modelUrl}>
                {/* <Navbar onEnterAR={enterAR} /> */}
                <Navbar />
                <main className="h-screen w-screen">
                    <Suspense fallback={<Loading />}>
                        <ARCanvas />
                    </Suspense>
                </main>
            </ModelUrlProvider>
        </ARProvider>
    );
}
