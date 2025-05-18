import Link from "next/link";
import dynamic from "next/dynamic";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/sfx/HeroSection";
import Footer from "@/components/layout/Footer";

const ThreeJsBackground = dynamic(
    () => import("@/components/sfx/ThreeJsBackground")
    // { ssr: false }
);

const ThreeJsLogo = dynamic(
    () => import("@/components/sfx/ThreeJsLogo")
    // { ssr: false }
);

export default async function Home() {
    // Get the user's session
    const session = await getServerSession();

    // If the user is logged in, redirect to dashboard
    if (session) {
        redirect("/dashboard");
    }

    const navbarButton = (
        <div className="flex space-x-2">
            <Link
                href="/auth/login"
                className="bg-gray-600 text-gray-50 px-4 py-1 rounded-lg hover:bg-gray-800 hover:border-gray-200 transition-colors text-xl"
            >
                Login
            </Link>
            <Link
                href="/auth/register"
                className="bg-gray-300 text-gray-800 px-4 py-1 rounded-lg hover:bg-gray-400 hover:border-gray-900 transition-colors text-xl"
            >
                Register
            </Link>
        </div>
    );

    return (
        <>
            <ThreeJsBackground />
            <Navbar rightContent={navbarButton} />
            <main className="flex flex-col min-h-screen items-center p-12 pt-22">
                {/* HERO CONTENT */}
                <HeroSection />

                <div className="mb-8">
                    <ThreeJsLogo
                        width={400}
                        height={300}
                        modelPath="/models/threejs_logo.glb"
                    />
                </div>
                <div className="max-w-3xl text-center mb-12">
                    <h3 className="text-xl dark:text-gray-100 text-gray-800 mb-4">
                        Try out the 3D model visualizer. Adjust its properties
                        and then place the default 3D part in AR space using
                        your phone&apos;s camera passthrough.
                    </h3>
                    <Link
                        href="/ar"
                        className="px-6 py-3 rounded-lg bg-gray-50/70 text-gray-800 hover:bg-gray-50 border-1 border-gray-800 hover:border-gray-900 shadow-xl shadow-gray-500/50 transition-colors text-xl sm:text-2xl"
                    >
                        Try the 3D Model Visualizer
                    </Link>
                </div>
                <div className="max-w-3xl text-center mb-12">
                    <h3 className="text-xl dark:text-gray-100 text-gray-800 mb-4">
                        Get the AR tracking marker image. Follow the
                        instructions in order to set up the visualization of 3D
                        models in AR.
                    </h3>
                    <Link
                        href="/tracker"
                        className="px-6 py-3 rounded-lg bg-gray-50/70 text-gray-800 hover:bg-gray-50 border-1 border-gray-800 hover:border-gray-900 shadow-xl shadow-gray-500/50 transition-colors text-xl sm:text-2xl"
                    >
                        AR Tracking Setup
                    </Link>
                </div>
            </main>
            <Footer />
        </>
    );
}
