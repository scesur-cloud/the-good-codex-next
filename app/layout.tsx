import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "The God Codex",
    description: "Operational Management Panel",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body suppressHydrationWarning>{children}</body>
        </html>
    );
}
