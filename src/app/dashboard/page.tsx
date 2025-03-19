import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import FileUpload from "@/components/FileUpload";
import UserModelsList from "@/components/UserModelsList";
import DashboardLayout from "@/components/layout/DashboardLayout";

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-300 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">
                            Upload a New 3D Model
                        </h2>
                        <FileUpload />
                    </div>

                    <div className="bg-gray-300 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">
                            Your Models
                        </h2>
                        <UserModelsList />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
