"use client";

import { useState } from "react";
// import { useRouter } from "next/navigation";

export default function RegisterForm() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    // const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!email) {
            setError("Please enter your email address.");
            setLoading(false);
            return;
        }

        // Validate email length
        if (email.length < 5 || email.length > 100) {
            setError("Email must be between 5 and 100 characters long.");
            setLoading(false);
            return;
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Invalid email format.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/auth/magic-link", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to send verification email.");
            } else {
                setEmailSent(true);
            }
        } catch (err) {
            setError(
                `An error occurred: ${
                    err instanceof Error ? err.message : "Unknown error"
                }`
            );
        } finally {
            setLoading(false);
        }
    };

    if (emailSent) {
        return (
            <div className="text-center text-gray-800 bg-gray-200">
                <h3 className="text-xl pt-4 text-gray-800 font-bold mb-4">
                    Check your inbox!
                </h3>
                <p className="mb-4 px-6 text-gray-800">
                    We&apos; sent a verification link to{" "}
                    <strong>{email}</strong>.
                </p>
                <p className="pb-4 px-6 text-gray-800">
                    Click the link in the email to complete your registration.
                    The link will expire in 1 hour.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    {error}
                </div>
            )}
            <div className="mb-6">
                <label
                    className="block text-gray-800 text-sm font-bold mb-2"
                    htmlFor="email"
                >
                    Email
                </label>
                <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-50 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
                    id="email"
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="flex items-center justify-between">
                <button
                    className="bg-gray-700 hover:bg-gray-900 text-gray-100 hover:text-gray-50 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Sending..." : "Send Verification Link"}
                </button>
                <a
                    className="inline-block align-baseline font-bold py-2 px-4 rounded border-1 bg-gray-50 hover:bg-gray-300 border-gray-700 hover:border-gray-900 text-gray-700 hover:text-gray-900"
                    href="/auth/login"
                >
                    Login
                </a>
            </div>
        </form>
    );
}
