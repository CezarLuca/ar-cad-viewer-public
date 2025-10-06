import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionContext } from "@/context/SessionContext";
import { LanguageProvider } from "@/context/LanguageContext";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "AR CAD Viewer",
    description: "A 3D/AR CAD model viewer application",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen w-screen`}
            >
                <LanguageProvider>
                    <SessionContext>{children}</SessionContext>
                </LanguageProvider>
            </body>
        </html>
    );
}
