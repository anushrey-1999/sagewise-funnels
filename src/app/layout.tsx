import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import MinimalFooter from "@/components/MinimalFooter";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sagewise - Walk-in Bathtubs",
  description: "Get quotes from 12 providers for walk-in bathtubs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body
        className="font-sans antialiased"
      >
        <div className="flex flex-col min-h-screen">
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
          <main className="flex-1 bg-[#F8F8F8]">
            {children}
          </main>
          <MinimalFooter />
        </div>
      </body>
    </html>
  );
}
