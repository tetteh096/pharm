import type { Metadata } from "next";
import "@/app/globals.css";
import { BRAND_LOGO, BRAND_NAME } from "@/lib/brand";
import Preloader from "@/components/medizen/Preloader";
import MouseFollower from "@/components/medizen/MouseFollower";
import { ThemeProvider } from "@/context/ThemeContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "@/components/ui/sonner";
import "@/app/medizen-dark.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: `${BRAND_NAME} | Pharmacy Care in Madina, Odorkor, Sakumono and Santeo`,
  description:
    "Enviro Pharmacy serves Madina, Odorkor, Sakumono and Santeo with trusted pharmacy care, local support, and dependable branch access.",
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
            <Toaster position="top-right" richColors closeButton />
          </div>
          </body>
        </CartProvider>
      </ThemeProvider>
    </html>
  );
}
