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

        // Validate email length
        if (email.length < 5 || email.length > 100) {
            return NextResponse.json(
                { error: "Email must be between 5 and 100 characters long" },
                { status: 400 }
            );
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        // Validate name length
        if (name.length < 2 || name.length > 50) {
            return NextResponse.json(
                { error: "Name must be between 2 and 50 characters long" },
                { status: 400 }
            );
        }
        // Validate name format
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!nameRegex.test(name)) {
            return NextResponse.json(
                { error: "Name can only contain letters and spaces" },
                { status: 400 }
            );
        }

        // Validate password length
        if (password.length < 8 || password.length > 100) {
            return NextResponse.json(
                { error: "Password must be between 8 and 100 characters long" },
                { status: 400 }
            );
        }
        // Validate password complexity (at least one lowercase letter, one number, a uppercase letter and a special character)
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return NextResponse.json(
                {
                    error: "Password must be at least 8 characters long and contain at least one letter and one number",
                },
                { status: 400 }
            );
        }
        // Validate password format (no spaces)
        const passwordFormatRegex = /^\S*$/;
        if (!passwordFormatRegex.test(password)) {
            return NextResponse.json(
                { error: "Password cannot contain spaces" },
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
