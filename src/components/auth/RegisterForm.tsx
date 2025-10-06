"use client";

import { useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import SliderCaptcha from "@/components/auth/SliderCaptcha";

export default function RegisterForm() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [tosAccepted, setTosAccepted] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const { t } = useTranslations("auth");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!email) {
            setError(t("errors.emailRequired"));
            setLoading(false);
            return;
        }

        if (email.length < 5 || email.length > 100) {
            setError(t("errors.emailLength"));
            setLoading(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError(t("errors.emailFormat"));
            setLoading(false);
            return;
        }

        if (!tosAccepted) {
            setError(t("errors.tosRequired"));
            setLoading(false);
            return;
        }

        if (!captchaToken) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/auth/magic-link", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, tosAccepted, captchaToken }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || t("errors.sendFailed"));
            } else {
                setEmailSent(true);
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

    const handleCaptchaSuccess = (token: string) => {
        setCaptchaToken(token);
        setError("");
    };

    const handleCaptchaError = () => {
        setCaptchaToken(null);
        setError("Captcha verification failed. Please try again.");
    };

    if (emailSent) {
        return (
            <div className="text-center text-gray-800 bg-gray-200">
                <h3 className="text-xl pt-4 text-gray-800 font-bold mb-4">
                    {t("checkInbox")}
                </h3>
                <p className="mb-4 px-6 text-gray-800">
                    {t("verificationSent")} <strong>{email}</strong>.
                </p>
                <p className="pb-4 px-6 text-gray-800">
                    {t("verificationInstructions")}
                </p>
            </div>
        );
    }

    return (
        <>
            <h2 className="text-2xl text-gray-800 font-bold mb-4">
                {t("register")}
            </h2>
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
                        {t("email")}
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-50 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
                        id="email"
                        type="email"
                        placeholder={t("emailPlaceholder")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="mb-6">
                    <label className="flex items-start">
                        <input
                            type="checkbox"
                            checked={tosAccepted}
                            onChange={(e) => setTosAccepted(e.target.checked)}
                            className="mt-1 mr-3 h-4 w-4 text-gray-700 focus:ring-gray-500 border-gray-300 rounded"
                            required
                        />
                        <span className="text-sm text-gray-700 leading-5">
                            {t("tosConsent.prefix")}{" "}
                            <a
                                href="/terms-of-service"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                            >
                                {t("tosConsent.termsLink")}
                            </a>{" "}
                            {t("tosConsent.and")}{" "}
                            <a
                                href="/privacy-policy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                            >
                                {t("tosConsent.privacyLink")}
                            </a>
                            . {t("tosConsent.dataProcessing")}
                        </span>
                    </label>
                </div>

                <div className="mb-6 p-4 border-2 border-gray-300 rounded-lg bg-gray-50">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">
                        {t("captcha.title")}
                    </h3>
                    <SliderCaptcha
                        onSuccess={handleCaptchaSuccess}
                        onError={handleCaptchaError}
                        width={300}
                        height={150}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <button
                        className="bg-gray-700 hover:bg-gray-900 text-gray-100 hover:text-gray-50 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
                        type="submit"
                        disabled={loading || !tosAccepted || !captchaToken}
                    >
                        {loading ? t("sending") : t("sendVerificationLink")}
                    </button>
                    <a
                        className="inline-block align-baseline font-bold py-2 px-4 rounded border-1 bg-gray-50 hover:bg-gray-300 border-gray-700 hover:border-gray-900 text-gray-700 hover:text-gray-900"
                        href="/auth/login"
                    >
                        {t("login")}
                    </a>
                </div>
            </form>
        </>
    );
}
