import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ShortcutSheet } from "@/components/ShortcutSheet";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : 'https://handywriterz.com'
  ),
  title: "HandyWriterz - AI-Powered Academic Writing Assistant",
  description: "Professional academic writing assistance powered by advanced AI. Create high-quality essays, reports, dissertations, and research papers with proper citations and plagiarism checking.",
  keywords: ["academic writing", "AI writing assistant", "essays", "research papers", "citations", "plagiarism check"],
  authors: [{ name: "HandyWriterz Team" }],
  creator: "HandyWriterz",
  publisher: "HandyWriterz",
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
    url: "https://handywriterz.com",
    siteName: "HandyWriterz",
    title: "HandyWriterz - AI-Powered Academic Writing Assistant",
    description: "Professional academic writing assistance powered by advanced AI. Create high-quality essays, reports, dissertations, and research papers.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HandyWriterz - AI Academic Writing Assistant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HandyWriterz - AI-Powered Academic Writing Assistant",
    description: "Professional academic writing assistance powered by advanced AI",
    images: ["/og-image.png"],
    creator: "@handywriterz",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SettingsProvider>
          <div className="min-h-screen bg-background text-foreground">
            {children}
            <ShortcutSheet />
          </div>
        </SettingsProvider>
      </body>
    </html>
  );
}