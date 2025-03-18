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
                href="/ar"
                className="bg-blue-500 text-white px-2 py-1 rounded-lg hover:bg-blue-600 transition-colors"
            >
                Start 3D Model Visualizer
            </Link>
            <Link
                href="/auth/login"
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
                Login
            </Link>
            <Link
                href="/auth/register"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
                Register
            </Link>
        </div>
    );

    return (
        <>
            <Navbar rightContent={navbarButton} />
            <main className="flex flex-col min-h-screen items-center p-12 pt-22">
                <h1 className="text-4xl font-bold mb-8 text-center">
                    AR CAD Viewer
                </h1>
                <div className="max-w-3xl text-center mb-12">
                    <p className="text-xl mb-4">
                        Welcome to AR CAD Viewer, the platform for visualizing
                        3D models in augmented reality.
                    </p>
                    <p className="mb-6">
                        Sign up to upload your own 3D models and view them in 3D
                        and AR.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Link
                            href="/auth/login"
                            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors text-lg"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
}
