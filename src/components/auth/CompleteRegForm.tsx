"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslations } from "@/hooks/useTranslations";

const CompleteRegistrationForm = () => {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [validatingToken, setValidatingToken] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);

    const { t } = useTranslations("auth");
    const router = useRouter();
    const searchParams = useSearchParams();

    const token = searchParams?.get("token") || "";
    const email = searchParams?.get("email") || "";

    useEffect(() => {
        const validateToken = async () => {
            if (!token || !email) {
                setError(t("errors.invalidLink"));
                setValidatingToken(false);
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setError(t("errors.expiredLink"));
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
                    setError(data.error || t("errors.expiredLink"));
                }
            } catch (err) {
                setError(t("errors.validateFailed"));
                console.error(err);
            } finally {
                setValidatingToken(false);
            }
        };

        validateToken();
    }, [token, email, t]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!name || !password) {
            setError(t("errors.allFieldsRequired"));
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError(t("errors.passwordMismatch"));
            setLoading(false);
            return;
        }

        if (name.length < 2 || name.length > 50) {
            setError(t("errors.nameLength"));
            setLoading(false);
            return;
        }
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!nameRegex.test(name)) {
            setError(t("errors.nameFormat"));
            setLoading(false);
            return;
        }
        if (password.length < 8 || password.length > 20) {
            setError(t("errors.passwordLength"));
            setLoading(false);
            return;
        }
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            setError(t("errors.passwordStrength"));
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
                setError(data.error || t("errors.registrationFailed"));
            } else {
                // Sign in the user
                const signInResult = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                });

                if (signInResult?.error) {
                    setError(t("errors.accountCreatedSignInFailed"));
                } else {
                    router.push("/dashboard");
                }
            }
        } catch (err) {
            setError(
                `${t("errors.unknownError")}: ${
                    err instanceof Error ? err.message : "Unknown error"
                }`
            );
        } finally {
            setLoading(false);
        }
    };

    if (validatingToken) {
        return (
            <>
                <h2 className="text-2xl text-gray-800 font-bold mb-4">
                    {t("completeRegistration")}
                </h2>
                <div className="text-center text-gray-800">
                    <p className="mb-4">{t("validatingLink")}</p>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto"></div>
                </div>
            </>
        );
    }

    if (!tokenValid) {
        return (
            <>
                <h2 className="text-2xl text-gray-800 font-bold mb-4">
                    {t("completeRegistration")}
                </h2>
                <div>
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        {error || t("errors.expiredLink")}
                    </div>
                    <div className="text-center mt-4">
                        <a
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            href="/auth/register"
                        >
                            {t("tryAgain")}
                        </a>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <h2 className="text-2xl text-gray-800 font-bold mb-4">
                {t("completeRegistration")}
            </h2>
            <div className="flex justify-center items-center p-4">
                <div className="bg-gray-200 shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-xl">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4 text-gray-800">
                            <p className="mb-2">
                                {t("email")}: <strong>{email}</strong>
                            </p>
                        </div>

                        <div className="mb-4">
                            <label
                                className="block text-gray-800 text-sm font-bold mb-2"
                                htmlFor="name"
                            >
                                {t("name")}
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-gray-50 leading-tight focus:outline-none focus:shadow-outline"
                                id="name"
                                type="text"
                                placeholder={t("namePlaceholder")}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                className="block text-gray-800 text-sm font-bold mb-2"
                                htmlFor="password"
                            >
                                {t("password")}
                            </label>
                            <div className="relative">
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 bg-gray-50 leading-tight focus:outline-none focus:shadow-outline"
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder={t("passwordPlaceholder")}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute text-gray-700 hover:cursor-pointer inset-y-0 right-0 px-3 flex items-center text-sm leading-5"
                                >
                                    {showPassword ? t("hide") : t("show")}
                                </button>
                            </div>
                        </div>

                        <div className="mb-10">
                            <label
                                className="block text-gray-800 text-sm font-bold mb-2"
                                htmlFor="confirmPassword"
                            >
                                {t("confirmPassword")}
                            </label>
                            <div className="relative">
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 bg-gray-50 leading-tight focus:outline-none focus:shadow-outline"
                                    id="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder={t(
                                        "confirmPasswordPlaceholder"
                                    )}
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                    className="absolute text-gray-700 hover:cursor-pointer inset-y-0 right-0 px-3 flex items-center text-sm leading-5"
                                >
                                    {showConfirmPassword
                                        ? t("hide")
                                        : t("show")}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-center">
                            <button
                                className="bg-gray-700 hover:bg-gray-900 text-gray-100 text-xl font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                type="submit"
                                disabled={loading}
                            >
                                {loading
                                    ? t("creatingAccount")
                                    : t("completeRegistrationButton")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CompleteRegistrationForm;
