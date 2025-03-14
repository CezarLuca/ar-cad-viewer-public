import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

export default function Home() {
    const navbarButton = (
        <Link
            href="/ar"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
            Start 3D Model Visualizer
        </Link>
    );

    return (
        <>
            <Navbar rightContent={navbarButton} />
            <main className="flex flex-col min-h-screen items-center justify-center p-24 pt-20">
                <h1 className="text-4xl mb-8 text-center">AR CAD Viewer</h1>
            </main>
        </>
    );
}
