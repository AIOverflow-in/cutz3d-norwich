import type { Metadata, Viewport } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "3D Cutz Norwich | Fades, Cuts & Beard Grooming", template: "%s | 3D Cutz Norwich" },
  description: SITE.description,
  keywords: ["barber Norwich", "skin fade Norwich", "haircut Norwich", "men's barber Norwich", "beard trim Norwich", "barber near Norwich station", "3D Cutz Norwich"],
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "en_GB", url: SITE.url, siteName: SITE.name, title: "3D Cutz Norwich | Precision barbering", description: SITE.description, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "3D Cutz Norwich" }] },
  twitter: { card: "summary_large_image", title: "3D Cutz Norwich", description: SITE.description, images: ["/opengraph-image"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  category: "Barber shop",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#72ec31" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-GB" data-scroll-behavior="smooth"><body><a className="skip-link" href="#main">Skip to content</a><Header /><main id="main">{children}</main><Footer /></body></html>;
}
