import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import "./globals.css";
import StoreProvider from "@/components/shared/StoreProvider";
import RootLayoutContent from "@/components/shared/layout/RootLayoutContent";
import { siteConfig } from "@/config/site";

// 🔢 خط Tajawal للأرقام فقط - يتطبق تلقائياً على كل الأرقام في المشروع
const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  variable: "--font-tajawal",
  display: "swap",
  weight: ["400", "500", "700", "800", "900"],
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
      <head>
        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1377275434528711');
fbq('track', 'PageView');
            `,
          }}
        />
      </head>
      <body className={`${tajawal.variable} antialiased font-sans`}>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1377275434528711&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <StoreProvider>
          <RootLayoutContent>{children}</RootLayoutContent>
        </StoreProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}