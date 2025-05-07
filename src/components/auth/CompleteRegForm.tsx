"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

const CompleteRegistrationForm = () => {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [validatingToken, setValidatingToken] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();

    const token = searchParams?.get("token") || "";
    const email = searchParams?.get("email") || "";

    useEffect(() => {
        const validateToken = async () => {
            if (!token || !email) {
                setError("Invalid or missing registration link");
                setValidatingToken(false);
                return;
            }

            // Validate token and email format
            // const tokenRegex = /^[a-zA-Z0-9]{32}$/; // Example regex for a 32-character token
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setError("Invalid or expired registration link");
                setValidatingToken(false);
                return;
            }

            try {
                const response = await fetch("/api/auth/validate-token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token, email }),
                });

                const data = await response.json();

                if (response.ok) {
                    setTokenValid(true);
                } else {
                    setError(
                        data.error || "Invalid or expired registration link"
                    );
                }
            } catch (err) {
                setError("Failed to validate registration link");
                console.error(err);
            } finally {
                setValidatingToken(false);
            }
        };

        validateToken();
    }, [token, email]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!name || !password) {
            setError("Please fill in all fields");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords don't match");
            setLoading(false);
            return;
        }

        // Validate name length
        if (name.length < 2 || name.length > 50) {
            setError("Name must be between 2 and 50 characters long");
            setLoading(false);
            return;
        }
        // Validate name format
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!nameRegex.test(name)) {
            setError("Name can only contain letters and spaces");
            setLoading(false);
            return;
        }
        // Validate password length
        if (password.length < 8 || password.length > 20) {
            setError("Password must be between 8 and 20 characters long");
            setLoading(false);
            return;
        }
        // Validate password strength (at least one uppercase letter, one lowercase letter, one number, and one special character)
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            setError(
                "Password must contain at least one lowercase letter, one uppercase letter, one number and one special character"
            );
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/auth/complete-registration", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, email, name, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to complete registration");
            } else {
                // Sign in the user
                const signInResult = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                });

                if (signInResult?.error) {
                    setError("Account created but failed to sign in");
                } else {
                    router.push("/dashboard");
                }
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

    if (validatingToken) {
        return (
            <div className="text-center text-gray-800">
                <p className="mb-4">Validating your registration link...</p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto"></div>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    {error || "Invalid or expired registration link"}
                </div>
                <div className="text-center mt-4">
                    <a
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        href="/auth/register"
                    >
                        Try Again
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center p-4">
            <div className="bg-gray-200 shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-xl">
                <h2 className="text-2xl text-gray-800 font-bold mb-4">
                    Complete Your Registration
                </h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4 text-gray-800">
                        <p className="mb-2">
                            Email: <strong>{email}</strong>
                        </p>
                    </div>

                    <div className="mb-4">
                        <label
                            className="block text-gray-800 text-sm font-bold mb-2"
                            htmlFor="name"
                        >
                            Name
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-gray-50 leading-tight focus:outline-none focus:shadow-outline"
                            id="name"
                            type="text"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="mb-4">
                        <label
                            className="block text-gray-800 text-sm font-bold mb-2"
                            htmlFor="password"
                        >
                            Password
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 bg-gray-50 leading-tight focus:outline-none focus:shadow-outline"
                            id="password"
                            type="password"
                            placeholder="Choose a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="mb-10">
                        <label
                            className="block text-gray-800 text-sm font-bold mb-2"
                            htmlFor="confirmPassword"
                        >
                            Confirm Password
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 bg-gray-50 leading-tight focus:outline-none focus:shadow-outline"
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center justify-center">
                        <button
                            className="bg-gray-700 hover:bg-gray-900 text-gray-100 text-xl font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating account..."
                                : "Complete Registration"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompleteRegistrationForm;
