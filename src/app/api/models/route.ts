import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
    try {
        const rows =
            await sql`SELECT id, filename, blob_url, size, created_at FROM models ORDER BY created_at DESC`;

        return NextResponse.json({ models: rows });
    } catch (err) {
        console.error("Error fetching models:", err);
        return NextResponse.json(
            { error: "Failed to fetch models" },
            { status: 500 }
        );
    }
}
