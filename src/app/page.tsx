import dynamic from "next/dynamic";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/hero/HeroSection";
import Footer from "@/components/layout/Footer";
import HomeContent from "@/components/hero/HomeContent";
import NavbarButtons from "@/components/ui/NavbarButtons";

const ThreeJsBackground = dynamic(
    () => import("@/components/sfx/ThreeJsBackground")
);

const ThreeJsLogo = dynamic(() => import("@/components/sfx/ThreeJsLogo"));

export default async function Home() {
    const session = await getServerSession();

    if (session) {
        redirect("/dashboard");
    }

    return (
        <>
            <ThreeJsBackground />
            <Navbar rightContent={<NavbarButtons />} />
            <main className="flex flex-col min-h-screen items-center p-12 pt-22">
                <HeroSection />

                <div className="mb-8">
                    <ThreeJsLogo
                        width={400}
                        height={300}
                        modelPath="/models/threejs_logo.glb"
                    />
                </div>

                <HomeContent />
            </main>
            <Footer />
        </>
    );
}
