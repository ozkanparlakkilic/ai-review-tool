import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { StructuredData } from "./structured-data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  ),
  title: {
    default: "AI Output Review Tool",
    template: "%s | AI Output Review Tool",
  },
  description:
    "Human-in-the-loop workflow for AI output review. Streamline your AI content validation with collaborative review queues, insights dashboard, and comprehensive audit logging.",
  keywords: [
    "AI review",
    "content moderation",
    "human-in-the-loop",
    "AI validation",
    "content review",
    "review workflow",
    "AI output validation",
    "quality assurance",
  ],
  authors: [{ name: "AI Review Tool Team" }],
  creator: "AI Review Tool",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "AI Output Review Tool",
    description:
      "Human-in-the-loop workflow for AI output review. Streamline your AI content validation with collaborative review queues.",
    siteName: "AI Output Review Tool",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Output Review Tool",
    description: "Human-in-the-loop workflow for AI output review",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StructuredData />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
