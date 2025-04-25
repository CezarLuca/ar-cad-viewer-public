import { NextResponse } from "next/server";
import { verifyEmailConfig, sendMagicLinkEmail } from "@/lib/email";

export async function GET(request: Request) {
    try {
        // First verify the email configuration
        const configValid = await verifyEmailConfig();

        if (!configValid) {
            return NextResponse.json(
                { error: "Email configuration is invalid" },
                { status: 500 }
            );
        }

        const url = new URL(request.url);
        const testEmail = url.searchParams.get("email");

        // Only send a test email if an email parameter is provided
        if (testEmail) {
            // Create a test magic link
            const testLink = `${process.env.NEXT_PUBLIC_APP_URL}/test-link`;

            // Send the test email
            await sendMagicLinkEmail(testEmail, testLink);

            return NextResponse.json(
                { message: `Test email sent to ${testEmail}` },
                { status: 200 }
            );
        }

        return NextResponse.json(
            { message: "Email configuration verified successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Test email error:", error);
        return NextResponse.json(
            {
                error: "Email test failed",
                details:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
