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
            subject: "Complete your registration",
            text: `Click this link to complete your registration: ${magicLink}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Complete Your Registration</h2>
            <p>Click the button below to verify your email and complete your registration:</p>
            <p style="text-align: center; margin: 30px 0;">
            <a href="${magicLink}" 
                style="background-color: #3b82f6; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;">
                Complete Registration
            </a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${magicLink}</p>
            <p>This link will expire in 1 hour.</p>
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
