import { NextResponse, NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { getToken } from "next-auth/jwt";

export async function GET(request: NextRequest) {
    try {
        // Get the user's session
        const session = await getToken({ req: request });

        if (!session || !session.id) {
            return NextResponse.json(
                { error: "You must be logged in to view your models." },
                { status: 401 }
            );
        }

        // Get only the models uploaded by this user
        const rows = await sql`
            SELECT id, name, filename, blob_url, size, user_id, created_at 
            FROM models 
            WHERE user_id = ${parseInt(session.id)} 
            ORDER BY created_at DESC
        `;

        return NextResponse.json({ models: rows });
    } catch (err) {
        console.error("Error fetching user models:", err);
        return NextResponse.json(
            { error: "Failed to fetch models" },
            { status: 500 }
        );
    }
}
