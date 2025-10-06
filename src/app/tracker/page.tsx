import Navbar from "@/components/layout/Navbar";
import { getServerSession } from "next-auth";
import dynamic from "next/dynamic";
import Footer from "@/components/layout/Footer";
import TrackerInfo from "@/components/tracker/TrackerInfo";
import NavbarButtons from "@/components/ui/NavbarButtons";

const ThreeJsBackground = dynamic(
    () => import("@/components/sfx/ThreeJsBackground")
    // { ssr: false }
);

export default async function TrackerPage() {
    const session = await getServerSession();

    const navbarButton = session ? undefined : <NavbarButtons />;

    return (
        <>
            <ThreeJsBackground />
            <Navbar rightContent={navbarButton} />
            <main className="flex flex-col min-h-screen items-center p-12 pt-22">
                <TrackerInfo />
            </main>
            <Footer />
        </>
    );
}
