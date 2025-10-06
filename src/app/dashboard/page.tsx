import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardContent from "@/components/user-dashboard/DashboardContent";
import Footer from "@/components/layout/Footer";

const ThreeJsBackground = dynamic(
    () => import("@/components/sfx/ThreeJsBackground")
    // { ssr: false }
);

export default async function Dashboard() {
    const session = await getServerSession();

    if (!session) {
        redirect("/auth/login");
    }

    return (
        <>
            <DashboardLayout titleKey="title">
                <ThreeJsBackground />
                <DashboardContent />
            </DashboardLayout>
            <Footer />
        </>
    );
}
