"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ExpandableRow from "./ExpandableRow";

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
    const [sortField, setSortField] = useState<keyof User>("id");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
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

    // Sorting function
    const handleSort = (field: keyof User) => {
        if (field === sortField) {
            // Toggle direction if same field
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            // Set new field with default ascending direction
            setSortField(field);
            setSortDirection("asc");
        }
    };

    // Toggle row expansion
    const toggleRowExpansion = (userId: number) => {
        setExpandedRow(expandedRow === userId ? null : userId);
    };

    // Get sorted users
    const getSortedUsers = () => {
        return [...users].sort((a, b) => {
            // Handle date sorting
            if (sortField === "created_at") {
                const dateA = new Date(a.created_at).getTime();
                const dateB = new Date(b.created_at).getTime();
                return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
            }

            // Handle number sorting (ID)
            if (sortField === "id") {
                return sortDirection === "asc" ? a.id - b.id : b.id - a.id;
            }

            // Handle string sorting
            const strA = String(a[sortField]).toLowerCase();
            const strB = String(b[sortField]).toLowerCase();
            return sortDirection === "asc"
                ? strA.localeCompare(strB)
                : strB.localeCompare(strA);
        });
    };

    // Delete user
    const deleteUser = async (userId: number, e?: React.MouseEvent) => {
        // Prevent row expansion when clicking delete button
        e?.stopPropagation();

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

    // Render sort indicator
    const renderSortIndicator = (field: keyof User) => {
        if (sortField !== field) return null;
        return sortDirection === "asc" ? " ↑" : " ↓";
    };

    if (loading) return <div>Loading users...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    const sortedUsers = getSortedUsers();

    return (
        <div className="overflow-x-auto">
            <table className="w-full table-fixed bg-gray-200 rounded-lg overflow-hidden shadow-lg">
                <thead className="bg-gray-800 text-gray-100">
                    <tr>
                        <th className="py-2 sm:py-3 px-2 sm:px-4 text-left w-[10%]">
                            <button
                                onClick={() => handleSort("id")}
                                className="font-bold hover:text-blue-300 transition-colors"
                            >
                                ID{renderSortIndicator("id")}
                            </button>
                        </th>
                        <th className="py-2 sm:py-3 px-2 sm:px-4 text-left w-[20%]">
                            <button
                                onClick={() => handleSort("name")}
                                className="font-bold hover:text-blue-300 transition-colors"
                            >
                                Name{renderSortIndicator("name")}
                            </button>
                        </th>
                        <th className="py-2 sm:py-3 px-2 sm:px-4 text-left sm:table-cell hidden w-[30%]">
                            <button
                                onClick={() => handleSort("email")}
                                className="font-bold hover:text-blue-300 transition-colors"
                            >
                                Email{renderSortIndicator("email")}
                            </button>
                        </th>
                        <th className="py-2 sm:py-3 px-2 sm:px-4 text-left w-[10%]">
                            <button
                                onClick={() => handleSort("role")}
                                className="font-bold hover:text-blue-300 transition-colors"
                            >
                                Role{renderSortIndicator("role")}
                            </button>
                        </th>
                        <th className="py-2 sm:py-3 px-2 sm:px-4 text-left md:table-cell hidden w-[15%]">
                            <button
                                onClick={() => handleSort("created_at")}
                                className="font-bold hover:text-blue-300 transition-colors"
                            >
                                Created At{renderSortIndicator("created_at")}
                            </button>
                        </th>
                        <th className="py-2 sm:py-3 px-2 sm:px-4 text-center w-[15%]">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                    {sortedUsers.map((user) => (
                        <React.Fragment key={user.id}>
                            <tr
                                className="hover:bg-gray-100 text-gray-600 cursor-pointer"
                                onClick={() => toggleRowExpansion(user.id)}
                            >
                                <td className="py-2 sm:py-3 px-2 sm:px-4">
                                    {user.id}
                                </td>
                                <td className="py-2 sm:py-3 px-2 sm:px-4">
                                    <div className="truncate hover:text-clip hover:overflow-visible">
                                        {user.name}
                                    </div>
                                </td>
                                <td className="py-2 sm:py-3 px-2 sm:px-4 sm:table-cell hidden">
                                    <div className="truncate hover:text-clip hover:overflow-visible">
                                        {user.email}
                                    </div>
                                </td>
                                <td className="py-2 sm:py-3 px-2 sm:px-4 whitespace-nowrap">
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
                                <td className="py-2 sm:py-3 px-2 sm:px-4 md:table-cell hidden">
                                    {new Date(user.created_at).toLocaleString()}
                                </td>
                                <td className="py-2 sm:py-3 px-2 sm:px-4 text-center whitespace-nowrap">
                                    {/* Don't show delete button for current user or other admins */}
                                    {user.id.toString() !== session?.user?.id &&
                                        user.role !== "admin" && (
                                            <button
                                                onClick={(e) =>
                                                    deleteUser(user.id, e)
                                                }
                                                className="bg-red-500 hover:bg-red-700 text-gray-100 font-bold py-1 px-4 sm:px-3 rounded text-xs"
                                            >
                                                Delete
                                            </button>
                                        )}
                                </td>
                            </tr>
                            <ExpandableRow
                                isOpen={expandedRow === user.id}
                                tableType="users"
                                hiddenFields={{
                                    sm: [{ label: "Email", value: user.email }],
                                    md: [
                                        {
                                            label: "Created At",
                                            value: new Date(
                                                user.created_at
                                            ).toLocaleString(),
                                        },
                                    ],
                                }}
                            />
                        </React.Fragment>
                    ))}
                </tbody>
            </table>

            {users.length === 0 && (
                <div className="text-center py-4">No users found</div>
            )}
        </div>
    );
}
