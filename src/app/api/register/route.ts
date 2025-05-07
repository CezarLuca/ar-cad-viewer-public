import { sql } from "@/lib/db";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return new NextResponse(
                JSON.stringify({ error: "Please fill in all fields." }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // Validate password length
        if (password.length < 8 || password.length > 20) {
            return new NextResponse(
                JSON.stringify({
                    error: "Password must be between 8 and 20 characters long.",
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }
        // Validate password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        if (!passwordRegex.test(password)) {
            return new NextResponse(
                JSON.stringify({
                    error: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.",
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }
        // Validate name length
        if (name.length < 2 || name.length > 50) {
            return new NextResponse(
                JSON.stringify({
                    error: "Name must be between 2 and 50 characters long.",
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // Validate name format
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!nameRegex.test(name)) {
            return new NextResponse(
                JSON.stringify({
                    error: "Name can only contain letters and spaces.",
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }
        // Validate email length
        if (email.length < 5 || email.length > 100) {
            return new NextResponse(
                JSON.stringify({
                    error: "Email must be between 5 and 100 characters long.",
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return new NextResponse(
                JSON.stringify({ error: "Invalid email format." }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // Check if the email is already registered
        const existingUsers = await sql`
            SELECT * FROM users WHERE email = ${email}
        `;

        if (existingUsers.length > 0) {
            return new NextResponse(
                JSON.stringify({ error: "Email already registered." }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Store the user in the database
        await sql`
            INSERT INTO users (name, email, password)
            VALUES (${name}, ${email}, ${hashedPassword})
        `;

        return new NextResponse(
            JSON.stringify({ message: "User registered successfully." }),
            {
                status: 201,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return new NextResponse(
            JSON.stringify({
                error: "An error occurred during registration.",
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
