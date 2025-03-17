import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import FileUpload from "@/components/FileUpload";
import ModelsList from "@/components/ModelsList";

export default function Home() {
    const navbarButton = (
        <Link
            href="/ar"
            className="bg-blue-500 text-white px-2 py-1 rounded-lg hover:bg-blue-600 transition-colors"
        >
            Start 3D Model Visualizer
        </Link>
    );

    return (
        <>
            <Navbar rightContent={navbarButton} />
            <main className="flex flex-col min-h-screen items-center p-12 pt-22">
                {/* <h1 className="text-4xl mb-8 text-center">AR CAD Viewer</h1> */}

                <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-300 p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-gray-700 mb-4">
                            Upload Your 3D Model
                        </h2>
                        <FileUpload />
                    </div>

                    <div className="bg-gray-300 text-gray-700 p-6 rounded-lg shadow-md">
                        <ModelsList />
                    </div>
                </div>
            </main>
        </>
    );
}
