import Navbar from "@/components/layout/Navbar";
import { getServerSession } from "next-auth";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

const ThreeJsBackground = dynamic(
    () => import("@/components/sfx/ThreeJsBackground")
    // { ssr: false }
);

export default async function TrackerPage() {
    const session = await getServerSession();

    const navbarButton = session ? undefined : (
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
            <ThreeJsBackground />
            <Navbar rightContent={navbarButton} />
            <main className="flex flex-col min-h-screen items-center p-12 pt-22">
                <div className="max-w-3xl text-center mb-6">
                    <h1 className="text-4xl dark:text-gray-100 text-gray-800 font-bold mb-8 text-center">
                        AR Tracker Image
                    </h1>
                    <h2 className="text-xt dark:text-gray-100 text-gray-800 mb-4">
                        This tracker image is used to place 3D models in
                        augmented reality. Print or display it at a size of
                        50x50 millimeters (2x2 inches) for best results.
                    </h2>
                </div>

                <div className="bg-gray-400 dark:bg-gray-800 p-1 rounded-lg shadow-lg mb-1">
                    <Image
                        src="/markers/tracker3.png"
                        alt="AR Tracking Marker"
                        width={300}
                        height={300}
                        className="mx-auto"
                    />
                </div>

                <div className="max-w-2xl space-y-12">
                    <div className="flex justify-center mt-1">
                        <a
                            href="/markers/tracker3.png"
                            download="ar_tracker.png"
                            className="bg-green-600 text-xl text-gray-200 px-8 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                            </svg>
                            Download Tracker
                        </a>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h3 className="text-xl dark:text-gray-100 text-gray-900 font-semibold mb-4">
                            Instructions:
                        </h3>
                        <ol className="dark:text-gray-200 text-gray-800 text-left list-decimal pl-6 space-y-3">
                            <li>Download the tracker image.</li>
                            <li>
                                Print the image at{" "}
                                <strong>50x50 millimeters</strong> (approx. 2x2
                                inches).
                            </li>
                            <li>
                                Place the printed tracker on a flat surface with
                                good lighting.
                            </li>
                            <li>
                                You must be using an{" "}
                                <strong>
                                    Android device with Chrome browser
                                </strong>
                                .
                            </li>
                            <li>
                                Go to the link <i>chrome://flags</i> and in the
                                Search flags field, search for{" "}
                                <strong>WebXR Incubations</strong> and enable
                                it. (You may need to restart the browser.)
                            </li>
                            <li>
                                In AR mode, point your device&apos;s camera at
                                the tracker to place your 3D model in augmented
                                reality.
                            </li>
                        </ol>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h3 className="text-xl dark:text-gray-100 text-gray-900 font-semibold mb-4">
                            Tips:
                        </h3>
                        <ul className="dark:text-gray-200 text-gray-800 text-left list-disc pl-6 space-y-3">
                            <li>
                                Ensure the entire tracker is visible in your
                                camera view.
                            </li>
                            <li>
                                Avoid shadows or glare on the printed tracker.
                            </li>
                            <li>
                                For best results, print on non-glossy paper.
                            </li>
                            <li>
                                If using on-screen, maintain the 50x50mm
                                dimensions.
                            </li>
                        </ul>
                    </div>
                </div>
            </main>
        </>
    );
}
