import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchHighlight from "@/components/SearchHighlight";

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
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
    shortcut: "/favicon.png",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
    siteName: "Dr. Sunday Okafor",
    url: "https://sundayokafor.com/",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Inter:wght@300;400;500;600&family=Cinzel:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <Navbar />
        {children}
        <Footer />
        <SearchHighlight />
      </body>
    </html>
  );
}
