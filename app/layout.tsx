import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dr. Sunday Okafor, PhD",
  description: "Official portfolio of Dr. Sunday Okafor — researcher, scholar, and academic leader.",
  keywords: ["Dr. Sunday Okafor", "PhD", "researcher", "transportation", "University of Alabama"],
  openGraph: {
    title: "Dr. Sunday Okafor, PhD",
    description: "Official portfolio of Dr. Sunday Okafor — researcher, scholar, and academic leader.",
    type: "website",
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
        <link rel="icon" href="/images/headshot.jpg" />
      </head>
      <body>{children}</body>
    </html>
  );
}
