import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AdminUsersTable from "@/components/admin/AdminUsersTable";
import AdminModelsTable from "@/components/admin/AdminModelsTable";
import Footer from "@/components/layout/Footer";

export default async function AdminPage() {
    const session = await getServerSession();

    if (!session) {
        redirect("/auth/login");
    }

    const users =
        await sql`SELECT role FROM users WHERE email = ${session.user.email}`;

    if (!users.length || users[0].role !== "admin") {
        console.log("User is not an admin");
        redirect("/dashboard");
    }

    return (
        <>
            <DashboardLayout titleKey="adminTitle">
                <div className="p-2 sm:p-6 bg-gray-50 dark:bg-gray-950">
                    <div className="space-y-10">
                        <AdminUsersTable />
                        <AdminModelsTable />
                    </div>
                </div>
            </DashboardLayout>
            <Footer />
        </>
    );
}
