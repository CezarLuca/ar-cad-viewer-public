import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

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
                className="bg-green-600 text-gray-200 px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
                Login
            </Link>
            <Link
                href="/auth/register"
                className="bg-blue-600 text-gray-200 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
                Register
            </Link>
        </div>
    );

    return (
        <>
            <Navbar rightContent={navbarButton} />
            <main className="flex flex-col min-h-screen items-center p-12 pt-22">
                <div className="max-w-3xl text-center mb-12">
                    <h1 className="text-4xl text-gray-200 font-bold mb-8 text-center">
                        Welcome to AR CAD Viewer, the platform for visualizing
                        3D models in augmented reality.
                    </h1>
                    <h2 className="text-xl text-gray-200 mb-4">
                        Sign up to upload your own 3D models and view them in 3D
                        and AR.
                    </h2>
                    <div className="flex justify-center space-x-4">
                        <Link
                            href="/auth/login"
                            className="bg-green-600 text-gray-200 px-6 py-3 rounded-lg hover:bg-green-700 transition-colors text-lg"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
                <div className="max-w-3xl text-center mb-12">
                    <h3 className="text-xl text-gray-200 mb-4">
                        Try out the 3D model visualizer. Adjust its properties
                        and then place the default 3D part in AR space using
                        your phone&apos;s camera passthrough.
                    </h3>
                    <Link
                        href="/ar"
                        className="bg-blue-600 text-xl text-gray-200 px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try the 3D Model Visualizer
                    </Link>
                </div>
            </main>
        </>
    );
}
