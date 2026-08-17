import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import PageTransition from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "ProductIQ — AI Product Intelligence for Industrial Commerce",
  description:
    "Turn limited product inputs into structured, validated, traceable product intelligence."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700;800&family=Roboto+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-blueprint-bg text-blueprint-text min-h-screen">
        <NavBar />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
