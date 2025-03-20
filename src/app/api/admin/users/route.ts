import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getToken } from "next-auth/jwt";

// Get all users (except admins)
export async function GET(request: NextRequest) {
    try {
        // Verify the user is an admin
        const session = await getToken({ req: request });

        if (!session || session.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        // Fetch all users except admins
        const users = await sql`
            SELECT id, name, email, role, created_at
            FROM users 
            WHERE role != 'admin' OR id = ${session.id}
            ORDER BY created_at DESC
        `;

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}

// Delete a user
export async function DELETE(request: NextRequest) {
    try {
        // Verify the user is an admin
        const session = await getToken({ req: request });

        if (!session || session.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        // Get the user ID from the query params
        const url = new URL(request.url);
        const userId = url.searchParams.get("id");

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        // Don't allow admin to delete themselves or other admins
        const userToDelete = await sql`
            SELECT role FROM users WHERE id = ${userId}
        `;

        if (userToDelete.length === 0) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        if (userToDelete[0].role === "admin" && userId !== session.id) {
            return NextResponse.json(
                { error: "Cannot delete another admin user" },
                { status: 403 }
            );
        }

        // Delete the user
        await sql`DELETE FROM users WHERE id = ${userId}`;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
            { error: "Failed to delete user" },
            { status: 500 }
        );
    }
}
