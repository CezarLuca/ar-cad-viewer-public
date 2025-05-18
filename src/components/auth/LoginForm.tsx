"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!email || !password) {
            setError("Please enter your email and password.");
            setLoading(false);
            return;
        }

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid credentials. Please try again.");
            } else {
                router.push("/dashboard");
            }
        } catch (err) {
            setError(
                `An error occurred during login: ${
                    err instanceof Error ? err.message : "Unknown error"
                }`
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    {error}
                </div>
            )}
            <div className="mb-4">
                <label
                    className="block text-gray-800 text-sm font-bold mb-2"
                    htmlFor="email"
                >
                    Email
                </label>
                <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 bg-gray-50 leading-tight focus:outline-none focus:shadow-outline"
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="mb-6">
                <label
                    className="block text-gray-800 text-sm font-bold mb-2"
                    htmlFor="password"
                >
                    Password
                </label>
                <div className="relative">
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 bg-gray-50 leading-tight focus:outline-none focus:shadow-outline"
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute text-gray-700 hover:cursor-pointer inset-y-0 right-0 px-3 flex items-center text-sm leading-5"
                    >
                        {showPassword ? "Hide" : "Show"}
                    </button>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <button
                    className="bg-gray-700 hover:bg-gray-800 text-gray-100 hover:text-gray-50 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Sign In"}
                </button>
                <a
                    className="inline-block align-baseline font-bold text-sm text-gray-700 hover:text-gray-900 border-1 bg-gray-50 hover:bg-gray-300 py-2 px-4 rounded border-gray-700 hover:border-gray-900 transition-colors"
                    href="/auth/register"
                >
                    Register
                </a>
            </div>
        </form>
    );
}
