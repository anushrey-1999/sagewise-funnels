import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import MinimalFooter from "@/components/MinimalFooter";
import AppToaster from "@/components/ui/sonner";
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
      <head>
        {/* Google Tag Manager */}
        <script dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-MPCLQGPD');` }} />
        {/* End Google Tag Manager */}
      </head>
      <body
        className="font-sans antialiased"
      >
        {/* Google Tag Manager (noscript) */}
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MPCLQGPD" height="0" width="0" style={{ display: 'none', visibility: 'hidden' }}></iframe></noscript>
        {/* End Google Tag Manager (noscript) */}
        <div className="flex flex-col min-h-screen">
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
          <main className="flex-1 bg-sg-canvas">
            {children}
          </main>
          <MinimalFooter />
        </div>
        <AppToaster />
      </body>
    </html>
  );
}
