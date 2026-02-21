import type { Metadata } from "next";
import { SmartChatPanel } from "@/components/SmartChatPanel";

export const metadata: Metadata = {
  title: "MxCrypto AI Chat",
  description:
    "MxCrypto AI chatbot: waydii smart money inflow/outflow, token analytics, iyo crypto market insights af-Soomaali.",
  keywords: [
    "mxcrypto ai",
    "crypto chatbot somali",
    "smart money chat",
    "crypto ai somali",
    "bitcoin ai chat somali",
    "token flow ai",
  ],
  alternates: { canonical: "/chat" },
  openGraph: {
    title: "MxCrypto AI Chat",
    description: "AI chatbot for smart money iyo crypto insights af-Soomaali.",
    type: "website",
    images: [{ url: "/brand/mxcrypto-logo.png" }],
  },
};

export default function ChatPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "MxCrypto AI Chat",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    inLanguage: "so",
    url: "https://www.mxcrypto.net/chat",
  };

  return (
    <main className="mx-container pt-6 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SmartChatPanel />
    </main>
  );
}

