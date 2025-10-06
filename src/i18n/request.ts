import { getRequestConfig } from "next-intl/server";
import { headers } from "next/headers";

async function getLocaleFromHeaders(): Promise<string> {
    const headersList = await headers();
    const acceptLanguage = headersList.get("accept-language") || "";

    // Parse the Accept-Language header
    const languages = acceptLanguage
        .split(",")
        .map((lang) => lang.split(";")[0].trim().toLowerCase());

    // Check if German is preferred
    if (languages.some((lang) => lang.startsWith("de"))) {
        return "de";
    }

    // Default to English
    return "en";
}

export default getRequestConfig(async () => {
    // Get locale from browser headers or default to 'en'
    const locale = await getLocaleFromHeaders();

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default,
    };
});
