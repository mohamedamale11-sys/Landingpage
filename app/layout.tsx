import type { Metadata } from "next";
import { IBM_Plex_Mono, Newsreader, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { Masthead } from "@/components/Masthead";
import { Suspense } from "react";
import { PriceBar } from "@/components/PriceBar";
import { SiteFooter } from "@/components/SiteFooter";

const fontHead = Newsreader({
  variable: "--font-head",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const fontBody = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fontMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "MxCrypto | Wararka Crypto",
    template: "%s | MxCrypto",
  },
  description: "Wararka crypto ee af-Soomaali, degdeg oo nadiif ah.",
  applicationName: "MxCrypto",
  metadataBase: process.env.SITE_URL ? new URL(process.env.SITE_URL) : undefined,
  alternates: { canonical: "/" },
  openGraph: {
    title: "MxCrypto | Wararka Crypto",
    description: "Wararka crypto ee af-Soomaali, degdeg oo nadiif ah.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MxCrypto | Wararka Crypto",
    description: "Wararka crypto ee af-Soomaali, degdeg oo nadiif ah.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="so">
      <body
        className={`${fontHead.variable} ${fontBody.variable} ${fontMono.variable} mx-body antialiased`}
      >
        <div className="min-h-screen">
          <Suspense
            fallback={
              <div className="sticky top-0 z-50 border-b mx-hairline bg-[rgba(0,0,0,0.82)] backdrop-blur-xl">
                <div className="mx-container">
                  <div className="flex h-14 items-center">
                    <div className="mx-mono text-[12px] font-semibold tracking-widest text-white/65">
                      MxCrypto
                    </div>
                  </div>
                </div>
              </div>
            }
          >
            <Masthead />
          </Suspense>
          <PriceBar />
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
