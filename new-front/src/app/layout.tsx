import type { Metadata } from "next";
import { Hubot_Sans } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import "./globals.css";
import StoreProvider from "@/components/shared/StoreProvider";
import RootLayoutContent from "@/components/shared/layout/RootLayoutContent";
import { siteConfig } from "@/config/site";

// 🚀 تجهيز خط Hubot Sans من جوجل مباشرة
const hubotSans = Hubot_Sans({
  subsets: ["latin"],
  variable: "--font-hubot",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | ${siteConfig.description}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["car rental", "marketplace", "luxury cars", "middle east", "rent a car"],
  authors: [{ name: "Autours Team" }],
  creator: "Autours",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["/og-image.jpg"],
    creator: "@autours",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  verification: {
    google: "FxPJTO-NvFJRMu_l6bfJ5gStyUaVAjBDUHuqI3KAAf8",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${hubotSans.variable} antialiased font-sans`}>
        <StoreProvider>
          <RootLayoutContent>{children}</RootLayoutContent>
        </StoreProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}