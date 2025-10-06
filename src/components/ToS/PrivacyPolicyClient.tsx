"use client";

import { useTranslations } from "@/hooks/useTranslations";

export default function PrivacyPolicyClient() {
    const { t } = useTranslations("privacyPolicy");

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
                {t("dataControllerTitle")}
            </h2>
            <p className="mb-2">
                {t("dataControllerText")}{" "}
                <a href="mailto:cezar.luca96@gmail.com">
                    cezar.luca96@gmail.com
                </a>
                .
            </p>

            <h2 className="text-xl font-medium mt-4">
                {t("dataWeCollectTitle")}
            </h2>
            <ul className="list-disc ml-6 mb-4">
                <li>{t("dataWeCollect.account")}</li>
                <li>{t("dataWeCollect.uploadedFiles")}</li>
                <li>{t("dataWeCollect.usage")}</li>
                <li>{t("dataWeCollect.device")}</li>
                <li>{t("dataWeCollect.cookies")}</li>
            </ul>

            <h2 className="text-xl font-medium mt-4">{t("purposeTitle")}</h2>
            <p className="mb-2">{t("purposeText")}</p>

            <h2 className="text-xl font-medium mt-4">
                {t("thirdPartiesTitle")}
            </h2>
            <p className="mb-2">{t("thirdPartiesText")}</p>

            <h2 className="text-xl font-medium mt-4">{t("retentionTitle")}</h2>
            <p className="mb-2">{t("retentionText")}</p>

            <h2 className="text-xl font-medium mt-4">{t("rightsTitle")}</h2>
            <ul className="list-disc ml-6 mb-4">
                <li>{t("rights.access")}</li>
                <li>{t("rights.rectification")}</li>
                <li>{t("rights.erasure")}</li>
                <li>{t("rights.restriction")}</li>
                <li>{t("rights.withdrawConsent")}</li>
                <li>{t("rights.complaint")}</li>
            </ul>

            <h2 className="text-xl font-medium mt-4">{t("cookiesTitle")}</h2>
            <p className="mb-2">{t("cookiesText")}</p>

            <h2 className="text-xl font-medium mt-4">{t("securityTitle")}</h2>
            <p className="mb-2">{t("securityText")}</p>

            <h2 className="text-xl font-medium mt-4">{t("childrenTitle")}</h2>
            <p className="mb-2">{t("childrenText")}</p>

            <h2 className="text-xl font-medium mt-4">{t("changesTitle")}</h2>
            <p className="mb-2">{t("changesText")}</p>
        </main>
    );
}
