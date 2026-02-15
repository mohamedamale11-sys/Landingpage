import type { Metadata } from "next";
import { IBM_Plex_Mono, Newsreader, Source_Sans_3, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Masthead } from "@/components/Masthead";
import { Suspense } from "react";
import { PriceBar } from "@/components/PriceBar";
import { SiteFooter } from "@/components/SiteFooter";
import { CoursePopup } from "@/components/CoursePopup";

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

const fontBrand = Space_Grotesk({
  variable: "--font-brand",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "MxCrypto | Wararka Crypto Somali",
    template: "%s | MxCrypto",
  },
  description:
    "Wararka Bitcoin, Ethereum, iyo suuqa crypto ee af-Soomaali. Qiimaha tooska ah, soo koobid nadiif ah, iyo barashada crypto.",
  keywords: [
    "wararka crypto",
    "wararka crypto somali",
    "crypto somali",
    "bitcoin somali",
    "ethereum somali",
    "qiimaha bitcoin maanta",
    "qiimaha crypto maanta",
    "qiimaha bitcoin",
    "qiimaha ethereum",
    "suuqa crypto",
    "baro crypto",
    "free crypto courses",
    "wallet",
    "defi",
    "blockchain",
    "altcoins",
  ],
  applicationName: "MxCrypto",
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "MxCrypto | Wararka Crypto Somali",
    description:
      "Wararka Bitcoin, Ethereum, iyo suuqa crypto ee af-Soomaali. Degdeg oo nadiif ah.",
    type: "website",
    images: [{ url: "/brand/mxcrypto-logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MxCrypto | Wararka Crypto Somali",
    description:
      "Wararka Bitcoin, Ethereum, iyo suuqa crypto ee af-Soomaali. Degdeg oo nadiif ah.",
    images: ["/brand/mxcrypto-logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
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
        className={`${fontHead.variable} ${fontBody.variable} ${fontMono.variable} ${fontBrand.variable} mx-body antialiased`}
      >
        <div className="min-h-screen">
          <Suspense
            fallback={
              <div className="sticky top-0 z-50 border-b mx-hairline bg-[rgba(0,0,0,0.82)] backdrop-blur-xl">
                <div className="mx-container">
                  <div className="flex h-14 items-center">
                    <div className="mx-brand text-[20px] font-semibold leading-none tracking-tight">
                      <span className="text-[rgb(var(--accent))]">Mx</span>
                      <span className="text-white">Crypto</span>
                    </div>
                  </div>
                </div>
              </div>
            }
          >
            <Masthead />
          </Suspense>
          <PriceBar />
          <CoursePopup />
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
