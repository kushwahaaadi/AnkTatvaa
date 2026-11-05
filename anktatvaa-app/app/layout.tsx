import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CosmosCanvas from "@/components/CosmosCanvas";
import ToastProvider from "@/components/ToastProvider";

export const metadata: Metadata = {
  title: "AnkTatvaa | Celestial Vedic Numerology & Astrological Geometry",
  description: "Ancient Vedic wisdom rendered through celestial architectural geometry and Chaldean mathematical precision.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&family=Cinzel:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0D0D0C] text-[#E8E0D2] min-h-screen relative overflow-x-hidden selection:bg-[#B08A57] selection:text-[#0D0D0C]">
        <CosmosCanvas />
        <ToastProvider>
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 pt-[72px]">
              {children}
            </main>
            <Footer />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
