import type { Metadata } from "next";
import "@/app/globals.css";
import { BRAND_LOGO, BRAND_NAME } from "@/lib/brand";
import {
  SITE_URL,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  OG_IMAGE,
} from "@/lib/seo";
import StructuredData from "@/components/seo/StructuredData";
import Preloader from "@/components/medizen/Preloader";
import MouseFollower from "@/components/medizen/MouseFollower";
import { ThemeProvider } from "@/context/ThemeContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "@/components/ui/sonner";
import { SiteWidgets } from "@/components/medizen/SiteWidgets";
import "@/app/medizen-dark.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND_NAME} | Pharmacy Care in Madina, Odorkor, Sakumono & Santeo`,
    template: `%s | ${BRAND_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: BRAND_NAME,
  authors: [{ name: BRAND_NAME }],
  creator: BRAND_NAME,
  publisher: BRAND_NAME,
  alternates: { canonical: "/" },
  category: "Pharmacy",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_GH",
    siteName: BRAND_NAME,
    url: SITE_URL,
    title: `${BRAND_NAME} | Pharmacy Care in Madina, Odorkor, Sakumono & Santeo`,
    description: SITE_DESCRIPTION,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: BRAND_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_NAME} | Trusted Pharmacy in Accra, Ghana`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: BRAND_LOGO.favicon32, sizes: "32x32", type: "image/png" },
      { url: BRAND_LOGO.favicon48, sizes: "48x48", type: "image/png" },
      { url: BRAND_LOGO.favicon192, sizes: "192x192", type: "image/png" },
    ],
    shortcut: BRAND_LOGO.favicon48,
    apple: BRAND_LOGO.apple,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <ThemeProvider>
        <CartProvider>
          <body className="body-bg">
          <StructuredData />
          <div className="medizen-wrapper">
            <link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
            <link rel="stylesheet" href="/assets/css/all.min.css" />
            <link rel="stylesheet" href="/assets/css/animate.css" />
            <link rel="stylesheet" href="/assets/css/magnific-popup.css" />
            <link rel="stylesheet" href="/assets/css/meanmenu.css" />
            <link rel="stylesheet" href="/assets/css/swiper-bundle.min.css" />
            <link rel="stylesheet" href="/assets/css/nice-select.css" />
            <link rel="stylesheet" href="/assets/css/main.css" />
            <Preloader />
            <MouseFollower />
            {children}
            <SiteWidgets />
            <Toaster position="top-right" richColors closeButton />
          </div>
          </body>
        </CartProvider>
      </ThemeProvider>
    </html>
  );
}
