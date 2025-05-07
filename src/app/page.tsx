import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";

const words = [
    { text: "Ideas", imgPath: "/images/ideas.svg" },
    { text: "Concepts", imgPath: "/images/concepts.svg" },
    { text: "Designs", imgPath: "/images/designs.svg" },
    { text: "Models", imgPath: "/images/code.svg" },
];

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
                <div className="max-w-3xl text-center mb-2">
                    <section className="relative overflow-hidden p-1 pb-11 rounded-lg mb-1">
                        <div className="relative z-10 xl:mt-20 mt-32 flex items-start justify-center">
                            {/* LEFT: HERO CONTENT */}
                            <header className="flex flex-col justify-center md:w-full w-screen md:px-20 px-5">
                                <div className="flex flex-col gap-7 dark:text-gray-50 text-gray-800 text-shadow-md text-shadow-gray-600">
                                    <div className="flex flex-col justify-center md:text-[60px] text-[30px] font-semibold relative z-10 pointer-events-none">
                                        <h1>AR Web Viewer</h1>
                                        <h1>Upload and Visualize</h1>
                                        <h1>
                                            Your 3D{" "}
                                            <span className="slide">
                                                <span className="wrapper">
                                                    {words.map((word) => (
                                                        <span
                                                            key={word.text}
                                                            className="flex items-center md:gap-3 gap-1 pb-2"
                                                        >
                                                            <Image
                                                                width={40}
                                                                height={40}
                                                                src={
                                                                    word.imgPath
                                                                }
                                                                alt={word.text}
                                                                className="xl:size-12 md:size-10 size-7 md:p-2 p-1 rounded-full bg-gray-100/40 object-contain"
                                                            />
                                                            <span>
                                                                {word.text}
                                                            </span>
                                                        </span>
                                                    ))}
                                                </span>
                                            </span>
                                        </h1>
                                    </div>
                                </div>
                            </header>
                        </div>
                        <div className="flex justify-center space-x-4 mt-8">
                            <Link
                                href="/auth/login"
                                className="bg-gray-600/70 text-gray-50 px-6 py-3 rounded-lg hover:bg-gray-800/50 border-2 border-gray-400 hover:border-gray-200 shadow-md shadow-gray-400/30 transition-colors text-2xl"
                            >
                                Get Started
                            </Link>
                        </div>
                    </section>
                </div>
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
        </>
    );
}
