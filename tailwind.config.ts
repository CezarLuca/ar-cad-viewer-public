import type { Config } from "tailwindcss";

export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                "white-50": "#d9ecff",
                "black-50": "#1c1c21",
                "black-100": "#0e0e10",
                "black-200": "#282732",
                "blue-50": "#839cb5",
                "blue-100": "#2d2d38",
            },
            fontFamily: {
                sans: ["Mona Sans", "sans-serif"],
                serif: ["var(--font-serif)", "serif"],
                mono: ["var(--font-mono)", "monospace"],
            },
            transitionProperty: {
                slider: "all 0.1s cubic-bezier(0.4, 0, 0.2, 1)",
            },
            animation: {
                fadeIn: "fadeIn 0.3s ease-in-out",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0", transform: "translateY(-10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
            },
        },
    },
    plugins: [],
} satisfies Config;
