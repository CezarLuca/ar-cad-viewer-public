"use client";

import React, { Suspense } from "react";
import Loading from "@/components/ui/Loading";
import Navbar from "@/components/layout/Navbar";
import { useSearchParams } from "next/navigation";
import { ModelUrlProvider } from "@/context/ModelUrlContext";
import ARCanvas from "@/components/scene/ARCanvas";
import { ARProvider } from "@/context/ARContext";
import Footer from "@/components/layout/Footer";
import { ScreenshotProvider } from "@/context/ScreenshotContext";

export default function ARPageClient() {
    const searchParams = useSearchParams();
    const modelUrl = searchParams?.get("model") || "/models/engine.glb";

    return (
        <>
            <ScreenshotProvider>
                <ARProvider>
                    <ModelUrlProvider modelUrl={modelUrl}>
                        <Navbar />
                        <main className="flex w-full h-[92vh] sm:h-[95vh]">
                            <Suspense fallback={<Loading fullScreen />}>
                                <ARCanvas />
                            </Suspense>
                        </main>
                    </ModelUrlProvider>
                </ARProvider>
            </ScreenshotProvider>
            <Footer />
        </>
    );
}
