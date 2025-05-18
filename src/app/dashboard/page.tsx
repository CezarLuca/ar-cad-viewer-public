import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardContent from "@/components/user-dashboard/DashboardContent";

export default async function Dashboard() {
    const session = await getServerSession();

    if (!session) {
        redirect("/auth/login");
    }

    return (
        <DashboardLayout>
            <div className="p-6">
                <h1 className="text-2xl text-gray-500 font-bold mb-6">
                    Personal Dashboard
                </h1>

                <DashboardContent />
            </div>
        </DashboardLayout>
    );
}
