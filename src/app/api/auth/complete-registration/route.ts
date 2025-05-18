import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
    try {
        const { token, email, name, password } = await request.json();

        if (!token || !email || !name || !password) {
            return NextResponse.json(
                { error: "Missing required parameters" },
                { status: 400 }
            );
        }

        // Validate token again
        const tokenResults = await sql`
            SELECT * FROM registration_tokens
            WHERE email = ${email}
            AND token = ${token}
            AND expires_at > NOW()
        `;

        if (tokenResults.length === 0) {
            return NextResponse.json(
                { error: "Invalid or expired registration link" },
                { status: 400 }
            );
        }

        // Check if email already exists in users table
        const existingUsers = await sql`
            SELECT * FROM users WHERE email = ${email}
        `;

        if (existingUsers.length > 0) {
            return NextResponse.json(
                { error: "Email already registered" },
                { status: 400 }
            );
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        await sql`
            INSERT INTO users (name, email, password, verified)
            VALUES (${name}, ${email}, ${hashedPassword}, true)
        `;

        // Delete the token
        await sql`
            DELETE FROM registration_tokens
            WHERE email = ${email}
        `;

        return NextResponse.json(
            { message: "Registration completed successfully" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Complete registration error:", error);
        return NextResponse.json(
            { error: "Failed to complete registration" },
            { status: 500 }
        );
    }
}
