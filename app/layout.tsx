import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import QueryProvider from "@/lib/cms/QueryProvider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cinzel",
  display: "swap",
});

const siteTitle =
  "Dr. Sunday Okafor, PhD – Do not let the difficult days deter you from moving forward, keep going everyday.";
const siteDescription =
  "Dr. Sunday Okafor, PhD — Transportation Engineer, Researcher, and Leader. Designing safer roads, mentoring emerging professionals, and leading with purpose.";

export const metadata: Metadata = {
  metadataBase: new URL("https://sundayokafor.com/"),
  title: siteTitle,
  description: siteDescription,
  keywords: [
    "Dr. Sunday Okafor",
    "sundayokafor.com",
    "Professional Engineer",
    "Transportation Engineer",
    "Researcher",
    "Leader",
    "Mentor",
    "Garver",
    "road safety",
  ],
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" },
    ],
    shortcut: "/favicon.png",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
    siteName: "Dr. Sunday Okafor",
    url: "https://sundayokafor.com/",
    images: [
      {
        url: "/images/hero-picture.jpeg",
        width: 1200,
        height: 800,
        alt: "Dr. Sunday Okafor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/images/hero-picture.jpeg"],
  },
  verification: {
    google: "OD3gvwtlO-B7ZMt1slCU_QWt6QFhk_lLx8rWFykJJC4",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${cormorant.variable} ${cinzel.variable}`}
    >
      <body suppressHydrationWarning>
        <QueryProvider>
          <SiteChrome>{children}</SiteChrome>
        </QueryProvider>
      </body>
    </html>
  );
}
