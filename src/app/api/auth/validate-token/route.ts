import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { token, email } = await request.json();

        if (!token || !email) {
            return NextResponse.json(
                { error: "Missing required parameters" },
                { status: 400 }
            );
        }

        // Check if the token is valid and not expired
        const results = await sql`
            SELECT * FROM registration_tokens
            WHERE email = ${email}
            AND token = ${token}
            AND expires_at > NOW()
        `;

        if (results.length === 0) {
            return NextResponse.json(
                { error: "Invalid or expired registration link" },
                { status: 400 }
            );
        }

        return NextResponse.json({ message: "Token valid" }, { status: 200 });
    } catch (error) {
        console.error("Token validation error:", error);
        return NextResponse.json(
            { error: "Failed to validate registration link" },
            { status: 500 }
        );
    }
}
