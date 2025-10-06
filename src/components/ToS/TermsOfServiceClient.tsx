"use client";

import { useTranslations } from "@/hooks/useTranslations";

export default function TermsOfServiceClient() {
    const { t } = useTranslations("termsOfService");

    return (
        <main className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">{t("title")}</h1>

            <p className="mb-4">
                {t("effectiveDate", {
                    date: "29.09.2025",
                    author: "Cezar Luca",
                })}
            </p>

            <h2 className="text-xl font-medium mt-4">
                {t("useOfServiceTitle")}
            </h2>
            <p className="mb-2">{t("useOfService")}</p>

            <h2 className="text-xl font-medium mt-4">
                {t("userContentTitle")}
            </h2>
            <p className="mb-2">{t("userContent")}</p>

            <h2 className="text-xl font-medium mt-4">{t("prohibitedTitle")}</h2>
            <p className="mb-2">{t("prohibited")}</p>

            <h2 className="text-xl font-medium mt-4">
                {t("terminationTitle")}
            </h2>
            <p className="mb-2">{t("termination")}</p>

            <h2 className="text-xl font-medium mt-4">{t("disclaimerTitle")}</h2>
            <p className="mb-2">{t("disclaimer")}</p>

            <h2 className="text-xl font-medium mt-4">
                {t("indemnificationTitle")}
            </h2>
            <p className="mb-2">
                {t("indemnification", { author: "Cezar Luca" })}
            </p>

            <h2 className="text-xl font-medium mt-4">
                {t("governingLawTitle")}
            </h2>
            <p className="mb-2">{t("governingLaw")}</p>

            <h2 className="text-xl font-medium mt-4">{t("contactTitle")}</h2>
            <p className="mb-2">
                {t("contactText")}{" "}
                <a href="mailto:cezar.luca96@gmail.com">
                    cezar.luca96@gmail.com
                </a>
                .
            </p>
        </main>
    );
}
