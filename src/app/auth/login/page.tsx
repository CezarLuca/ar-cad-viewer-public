import LoginForm from "@/components/auth/LoginForm";
import Footer from "@/components/layout/Footer";
import dynamic from "next/dynamic";

const ThreeJsBackground = dynamic(
    () => import("@/components/sfx/ThreeJsBackground")
    // { ssr: false }
);

export default function LoginPage() {
    return (
        <>
            <div className="flex justify-center items-center h-screen bg-gray-100/20 dark:bg-gray-900/20">
                <ThreeJsBackground />
                <div className="bg-gray-50/70 shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-lg">
                    <h2 className="text-2xl text-gray-800 font-bold mb-4">
                        Login
                    </h2>
                    <LoginForm />
                </div>
            </div>
            <Footer />
        </>
    );
}
