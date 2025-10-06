import { Suspense } from "react";
import Loading from "@/components/ui/Loading";
import ARPageClient from "@/components/scene/ARPageClient";

export default function ARPage() {
    return (
        <Suspense fallback={<Loading fullScreen />}>
            <ARPageClient />
        </Suspense>
    );
}
