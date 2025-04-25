import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendMagicLinkEmail } from "@/lib/email";

// Token expiry time (1 hour)
const TOKEN_EXPIRY = 60 * 60 * 1000;

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        // Check if the email is already registered
        const existingUsers = await sql`
            SELECT * FROM users WHERE email = ${email}
        `;

        if (existingUsers.length > 0) {
            return NextResponse.json(
                {
                    error: "Email already registered. Please log in instead.",
                },
                { status: 400 }
            );
        }

        // Check if registration token already exists for the email
        const existingTokens = await sql`
            SELECT * FROM registration_tokens WHERE email = ${email}
        `;

        // Check how old the existing token is
        if (existingTokens.length > 0) {
            const currentTime = new Date().getTime();
            const expiryTime = new Date(existingTokens[0].expires_at).getTime();

            // Check if token is still valid (not expired)
            if (currentTime < expiryTime) {
                return NextResponse.json(
                    {
                        error: "A verification email has already been sent. Please check your inbox.",
                    },
                    { status: 400 }
                );
            }
        }

        // Generate a secure token
        const token = crypto.randomBytes(32).toString("hex");
        const expiry = new Date(Date.now() + TOKEN_EXPIRY);

        // Store token in the registration_tokens table
        // Using UPSERT pattern for PostgreSQL
        await sql`
            INSERT INTO registration_tokens (email, token, expires_at)
            VALUES (${email}, ${token}, ${expiry})
            ON CONFLICT (email) DO UPDATE
            SET token = ${token}, expires_at = ${expiry}
        `;

        // Create the magic link URL
        const magicLink = `${
            process.env.NEXT_PUBLIC_APP_URL
        }/auth/complete-registration?token=${token}&email=${encodeURIComponent(
            email
        )}`;

        // Send the email
        await sendMagicLinkEmail(email, magicLink);

        return NextResponse.json(
            { message: "Verification email sent successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Magic link error:", error);
        return NextResponse.json(
            { error: "Failed to send verification email" },
            { status: 500 }
        );
    }
}
