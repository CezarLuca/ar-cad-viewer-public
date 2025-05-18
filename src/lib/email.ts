import nodemailer from "nodemailer";

// Create a reusable transporter object using the default Gmail SMTP credentials
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
});

export async function sendMagicLinkEmail(
    email: string,
    magicLink: string
): Promise<void> {
    // Log email configuration for debugging
    console.log("Email config:", {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        user: process.env.EMAIL_SERVER_USER ? "Set" : "Not set",
        pass: process.env.EMAIL_SERVER_PASSWORD ? "Set" : "Not set",
        from: process.env.EMAIL_FROM,
    });

    try {
        // Verify connection configuration first
        await transporter.verify();

        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: "Complete your registration - AR CAD Viewer",
            text: `Welcome to AR CAD Viewer! Click this link to complete your registration: ${magicLink}\n\nThis link will expire in 1 hour.`,
            html: `
<div style="margin: 0; padding: 0; width: 100%; background-color: #111827; font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #D1D5DB;">
    <div style="max-width: 580px; margin: 20px auto; background-color: #1F2937; border-radius: 8px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.5);">
        <!-- Header -->
        <div style="background-color: #374151; padding: 24px; text-align: center;">
            <h1 style="margin: 0; color: #F9FAFB; font-size: 28px; font-weight: bold;">AR CAD Viewer</h1>
        </div>
        <!-- Content Body -->
        <div style="padding: 30px;">
            <h2 style="margin: 0 0 20px 0; color: #E5E7EB; font-size: 22px; font-weight: bold;">Complete Your Registration</h2>
            <p style="margin: 0 0 16px 0; font-size: 16px; color: #D1D5DB;">
                Welcome! To finish setting up your AR CAD Viewer account, please verify your email address by clicking the button below.
            </p>
            <!-- Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="${magicLink}" target="_blank"
                   style="background-color: #4B5563; color: #F9FAFB; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 17px; font-weight: bold; border: 1px solid #6B7280;">
                    Verify Email &amp; Register
                </a>
            </div>
            <p style="margin: 0 0 16px 0; font-size: 16px; color: #D1D5DB;">
                If the button above doesn't work, you can copy and paste the following link into your browser's address bar:
            </p>
            <p style="margin: 0 0 24px 0; font-size: 14px; word-break: break-all; background-color: #374151; padding: 12px; border-radius: 4px; text-align: center;">
                <a href="${magicLink}" target="_blank" style="color: #60A5FA; text-decoration: underline;">${magicLink}</a>
            </p>
            <p style="margin: 0; font-size: 14px; color: #9CA3AF; text-align: center;">
                This link will expire in 1 hour. If you didn't request this email, please ignore it.
            </p>
        </div>
        <!-- Footer -->
        <div style="background-color: #374151; padding: 20px; text-align: center; font-size: 12px; color: #9CA3AF;">
            &copy; ${new Date().getFullYear()} AR CAD Viewer. All rights reserved.
        </div>
    </div>
    <div style="text-align: center; font-size: 12px; color: #6B7280; padding: 10px 0;">
        AR CAD Viewer Project
    </div>
</div>
        `,
        });

        console.log("Email sent successfully to:", email);
        console.log("Message ID:", info.messageId);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error(
            `Failed to send email: ${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
    }
}

// Utility function to verify the email configuration
export async function verifyEmailConfig(): Promise<boolean> {
    try {
        await transporter.verify();
        console.log("Email config is valid");
        return true;
    } catch (error) {
        console.error("Email configuration error:", error);
        return false;
    }
}
