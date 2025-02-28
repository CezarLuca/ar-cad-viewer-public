import Link from "next/link";

export default function Home() {
    return (
        <main className="flex flex-col min-h-screen items-center justify-center p-24">
            <h1 className="text-4xl mb-8 text-center">AR CAD Viewer</h1>
            <Link
                href="/ar"
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
            >
                Start AR Experience
            </Link>
        </main>
    );
}
