"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ExpandableRow from "./ExpandableRow";
import { useTranslations } from "@/hooks/useTranslations";

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
    const { t } = useTranslations("admin");

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

    const handleSort = (field: keyof User) => {
        if (field === sortField) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const toggleRowExpansion = (userId: number) => {
        setExpandedRow(expandedRow === userId ? null : userId);
    };

    const getSortedUsers = () => {
        return [...users].sort((a, b) => {
            if (sortField === "created_at") {
                const dateA = new Date(a.created_at).getTime();
                const dateB = new Date(b.created_at).getTime();
                return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
            }

            if (sortField === "id") {
                return sortDirection === "asc" ? a.id - b.id : b.id - a.id;
            }

            const strA = String(a[sortField]).toLowerCase();
            const strB = String(b[sortField]).toLowerCase();
            return sortDirection === "asc"
                ? strA.localeCompare(strB)
                : strB.localeCompare(strA);
        });
    };

    const deleteUser = async (userId: number, e?: React.MouseEvent) => {
        e?.stopPropagation();

        if (!confirm(t("deleteUserConfirmation"))) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/users?id=${userId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || t("errors.deleteFailed"));
            }

            setUsers(users.filter((user) => user.id !== userId));
        } catch (err) {
            alert(
                err instanceof Error ? err.message : t("errors.deleteFailed")
            );
        }
    };

    const renderSortIndicator = (field: keyof User) => {
        if (sortField !== field) return null;
        return sortDirection === "asc" ? " ↑" : " ↓";
    };

    if (loading)
        return (
            <div className="text-gray-700 dark:text-gray-300">
                {t("loading")}
            </div>
        );
    if (error)
        return <div className="text-red-500 dark:text-red-400">{error}</div>;

    const sortedUsers = getSortedUsers();

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-500 dark:text-gray-400">
                {t("userManagement")}
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full table-fixed bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                    <thead className="bg-gray-800 dark:bg-gray-700 text-gray-100 dark:text-gray-200">
                        <tr>
                            <th className="py-2 sm:py-3 px-2 sm:px-4 text-left w-[10%]">
                                <button
                                    onClick={() => handleSort("id")}
                                    className="font-bold hover:text-blue-300 dark:hover:text-blue-400 transition-colors"
                                >
                                    {t("table.id")}
                                    {renderSortIndicator("id")}
                                </button>
                            </th>
                            <th className="py-2 sm:py-3 px-2 sm:px-4 text-left w-[20%]">
                                <button
                                    onClick={() => handleSort("name")}
                                    className="font-bold hover:text-blue-300 dark:hover:text-blue-400 transition-colors"
                                >
                                    {t("table.name")}
                                    {renderSortIndicator("name")}
                                </button>
                            </th>
                            <th className="py-2 sm:py-3 px-2 sm:px-4 text-left sm:table-cell hidden w-[30%]">
                                <button
                                    onClick={() => handleSort("email")}
                                    className="font-bold hover:text-blue-300 dark:hover:text-blue-400 transition-colors"
                                >
                                    {t("table.email")}
                                    {renderSortIndicator("email")}
                                </button>
                            </th>
                            <th className="py-2 sm:py-3 px-2 sm:px-4 text-left w-[10%]">
                                <button
                                    onClick={() => handleSort("role")}
                                    className="font-bold hover:text-blue-300 dark:hover:text-blue-400 transition-colors"
                                >
                                    {t("table.role")}
                                    {renderSortIndicator("role")}
                                </button>
                            </th>
                            <th className="py-2 sm:py-3 px-2 sm:px-4 text-left md:table-cell hidden w-[15%]">
                                <button
                                    onClick={() => handleSort("created_at")}
                                    className="font-bold hover:text-blue-300 dark:hover:text-blue-400 transition-colors"
                                >
                                    {t("table.createdAt")}
                                    {renderSortIndicator("created_at")}
                                </button>
                            </th>
                            <th className="py-2 sm:py-3 px-2 sm:px-4 text-center w-[15%]">
                                {t("table.actions")}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300 dark:divide-gray-600">
                        {sortedUsers.map((user) => (
                            <React.Fragment key={user.id}>
                                <tr
                                    className="hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-pointer"
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
                                                    ? "bg-purple-200 dark:bg-purple-700 text-purple-800 dark:text-purple-200"
                                                    : "bg-blue-200 dark:bg-blue-700 text-blue-800 dark:text-blue-200"
                                            }`}
                                        >
                                            {t(`roles.${user.role}`)}
                                        </span>
                                    </td>
                                    <td className="py-2 sm:py-3 px-2 sm:px-4 md:table-cell hidden">
                                        {new Date(
                                            user.created_at
                                        ).toLocaleString()}
                                    </td>
                                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-center whitespace-nowrap">
                                        {user.id.toString() !==
                                            session?.user?.id &&
                                            user.role !== "admin" && (
                                                <button
                                                    onClick={(e) =>
                                                        deleteUser(user.id, e)
                                                    }
                                                    className="bg-red-500 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-800 text-gray-100 dark:text-gray-200 font-bold py-1 px-4 sm:px-3 rounded text-xs"
                                                >
                                                    {t("actions.delete")}
                                                </button>
                                            )}
                                    </td>
                                </tr>
                                <ExpandableRow
                                    isOpen={expandedRow === user.id}
                                    tableType="users"
                                    hiddenFields={{
                                        sm: [
                                            {
                                                label: t("table.email"),
                                                value: user.email,
                                            },
                                        ],
                                        md: [
                                            {
                                                label: t("table.createdAt"),
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
                    <div className="text-center py-4 text-gray-700 dark:text-gray-300">
                        {t("noUsersFound")}
                    </div>
                )}
            </div>
        </div>
    );
}
