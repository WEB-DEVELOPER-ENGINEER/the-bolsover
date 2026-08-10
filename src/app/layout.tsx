import type { Metadata } from "next";
import "./globals.css";
import { CMSProvider } from "@/context/CMSContext";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "The Bolsover | Luxury Apartments in Fitzrovia, London W1",
  description: "An exclusive collection of 24 luxury apartments at 3–8 Bolsover Street, London W1, set in the heart of Fitzrovia. Marketed in partnership with Savills and A’ayan Real Estate.",
  keywords: ["The Bolsover", "Bolsover Street", "Fitzrovia luxury apartments", "London W1 real estate", "Savills London", "A'ayan Real Estate"],
  openGraph: {
    title: "The Bolsover | Apartments in Fitzrovia W1",
    description: "An exclusive collection of 24 luxury apartments at 3–8 Bolsover Street, London W1.",
    url: "https://thebolsover.co.uk",
    siteName: "The Bolsover",
    images: [
      {
        url: "/assets/images/building.png",
        width: 1200,
        height: 630,
        alt: "The Bolsover London W1",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preload" href="/assets/fonts/trajan-pro/TrajanPro-Regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#FBF5F0] text-[#1C1916] font-sans antialiased selection:bg-[#BA9D81] selection:text-white">
        <CMSProvider>
          <Header />
          {children}
        </CMSProvider>
      </body>
    </html>
  );
}
