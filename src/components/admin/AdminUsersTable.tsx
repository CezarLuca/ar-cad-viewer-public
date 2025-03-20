"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

export default function AdminUsersTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { data: session } = useSession();

    // Fetch users
    useEffect(() => {
        async function fetchUsers() {
            try {
                const response = await fetch("/api/admin/users");
                if (!response.ok) {
                    throw new Error("Failed to fetch users");
                }
                const data = await response.json();
                setUsers(data.users || []);
            } catch (err) {
                setError("Error loading users");
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchUsers();
    }, []);

    // Delete user
    const deleteUser = async (userId: number) => {
        if (
            !confirm(
                "Are you sure you want to delete this user? This action cannot be undone."
            )
        ) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/users?id=${userId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to delete user");
            }

            // Remove user from state
            setUsers(users.filter((user) => user.id !== userId));
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete user");
        }
    };

    if (loading) return <div>Loading users...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-200 rounded-lg overflow-hidden shadow-lg">
                <thead className="bg-gray-800 text-gray-100">
                    <tr>
                        <th className="py-3 px-4 text-left">ID</th>
                        <th className="py-3 px-4 text-left">Name</th>
                        <th className="py-3 px-4 text-left">Email</th>
                        <th className="py-3 px-4 text-left">Role</th>
                        <th className="py-3 px-4 text-left">Created At</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                    {users.map((user) => (
                        <tr
                            key={user.id}
                            className="hover:bg-gray-100 text-gray-600"
                        >
                            <td className="py-3 px-4">{user.id}</td>
                            <td className="py-3 px-4">{user.name}</td>
                            <td className="py-3 px-4">{user.email}</td>
                            <td className="py-3 px-4">
                                <span
                                    className={`px-2 py-1 rounded-full text-xs ${
                                        user.role === "admin"
                                            ? "bg-purple-200 text-purple-800"
                                            : "bg-blue-200 text-blue-800"
                                    }`}
                                >
                                    {user.role}
                                </span>
                            </td>
                            <td className="py-3 px-4">
                                {new Date(user.created_at).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right">
                                {/* Don't show delete button for current user or other admins */}
                                {user.id.toString() !== session?.user?.id &&
                                    user.role !== "admin" && (
                                        <button
                                            onClick={() => deleteUser(user.id)}
                                            className="bg-red-500 hover:bg-red-700 text-gray-100 font-bold py-1 px-3 rounded text-xs"
                                        >
                                            Delete
                                        </button>
                                    )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {users.length === 0 && (
                <div className="text-center py-4">No users found</div>
            )}
        </div>
    );
}
