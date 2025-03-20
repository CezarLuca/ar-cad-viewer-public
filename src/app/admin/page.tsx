import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AdminUsersTable from "@/components/admin/AdminUsersTable";
import AdminModelsTable from "@/components/admin/AdminModelsTable";

export default async function AdminPage() {
    // Verify user is authenticated and an admin
    const session = await getServerSession();

    if (!session) {
        redirect("/auth/login");
    }

    // Look up the user's role directly from the database
    const users =
        await sql`SELECT role FROM users WHERE email = ${session.user.email}`;

    if (!users.length || users[0].role !== "admin") {
        console.log("User is not an admin");
        redirect("/dashboard");
    }

    return (
        <DashboardLayout>
            <div className="p-6 bg-gray-100">
                <h1 className="text-3xl font-bold mb-8 text-gray-500">
                    Admin Dashboard
                </h1>

                <div className="space-y-10">
                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-gray-500">
                            User Management
                        </h2>
                        <AdminUsersTable />
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-gray-500">
                            Model Management
                        </h2>
                        <AdminModelsTable />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
