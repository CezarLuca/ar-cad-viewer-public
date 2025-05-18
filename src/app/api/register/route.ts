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
