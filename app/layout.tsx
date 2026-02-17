import type { Metadata } from "next";
import { IBM_Plex_Mono, Newsreader, Source_Sans_3, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Masthead } from "@/components/Masthead";
import { Suspense } from "react";
import { PriceBar } from "@/components/PriceBar";
import { SiteFooter } from "@/components/SiteFooter";
import { CoursePopup } from "@/components/CoursePopup";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";

const fontHead = Newsreader({
  variable: "--font-head",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const fontBody = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const fontMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const fontBrand = Space_Grotesk({
  variable: "--font-brand",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
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
    "wararka bitcoin",
    "wararka ethereum",
    "wararka memecoin",
    "memecoin somali",
    "crypto somali",
    "crypto af soomaali",
    "crypto news somalia",
    "suuqa crypto somalia",
    "bitcoin somali",
    "ethereum somali",
    "dogecoin somali",
    "shiba inu somali",
    "pepe coin somali",
    "bonk somali",
    "altcoin somali",
    "qiimaha bitcoin maanta",
    "qiimaha ethereum maanta",
    "bitcoin price today somali",
    "ethereum price today somali",
    "btc price somali",
    "eth price somali",
    "bitcoin news somali",
    "ethereum news somali",
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
  metadataBase: new URL(process.env.SITE_URL || "https://www.mxcrypto.net"),
  alternates: {
    canonical: "/",
    languages: {
      so: "/",
      "x-default": "/",
    },
  },
  category: "news",
  creator: "MxCrypto",
  publisher: "MxCrypto",
  manifest: "/manifest.webmanifest",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "MxCrypto | Wararka Crypto Somali",
    description:
      "Wararka Bitcoin, Ethereum, iyo suuqa crypto ee af-Soomaali. Degdeg oo nadiif ah.",
    type: "website",
    url: "/",
    siteName: "MxCrypto",
    locale: "so_SO",
    images: [{ url: "/brand/mxcrypto-logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MxCrypto | Wararka Crypto Somali",
    description:
      "Wararka Bitcoin, Ethereum, iyo suuqa crypto ee af-Soomaali. Degdeg oo nadiif ah.",
    images: ["/brand/mxcrypto-logo.png"],
    site: "@mxcrypto",
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: {
    "theme-color": "#02050b",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteUrl = (process.env.SITE_URL || "https://www.mxcrypto.net").replace(/\/+$/, "");
  const gaMeasurementId =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-62LCFXX3MC";
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: "MxCrypto",
    url: siteUrl,
    logo: `${siteUrl}/brand/mxcrypto-logo.png`,
    inLanguage: "so",
  };
  const siteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MxCrypto",
    url: siteUrl,
    inLanguage: "so",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="so">
      <body
        className={`${fontHead.variable} ${fontBody.variable} ${fontMono.variable} ${fontBrand.variable} mx-body antialiased`}
      >
        <GoogleAnalytics measurementId={gaMeasurementId} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
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
