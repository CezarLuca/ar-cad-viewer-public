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
            <DashboardLayout>
                <div className="p-6">
                    <h1 className="text-2xl dark:text-gray-300 text-gray-700 font-bold mb-6">
                        Personal Dashboard
                    </h1>
                    <ThreeJsBackground />
                    <DashboardContent />
                </div>
            </DashboardLayout>
            <Footer />
        </>
    );
}
