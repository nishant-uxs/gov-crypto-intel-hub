import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Government Crypto Intelligence Hub — India Policy Advisory Platform",
  description:
    "Professional-grade crypto policy and intelligence platform for India — regulatory news, exchange compliance, scam intelligence, global policy comparisons, and AI-generated analysis.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
