export const COURSE_HREF =
  "https://whop.com/mx-crypto";

export type ExchangePartner = {
  name: string;
  href: string;
  blurb: string;
};

// Set real affiliate URLs via NEXT_PUBLIC_* vars when available.
export const EXCHANGE_PARTNERS: ExchangePartner[] = [
  {
    name: "Bybit",
    href: process.env.NEXT_PUBLIC_BYBIT_AFFILIATE || "https://www.bybit.com/",
    blurb: "Spot + futures",
  },
  {
    name: "Binance",
    href: process.env.NEXT_PUBLIC_BINANCE_AFFILIATE || "https://www.binance.com/",
    blurb: "Liquid market",
  },
  {
    name: "OKX",
    href: process.env.NEXT_PUBLIC_OKX_AFFILIATE || "https://www.okx.com/",
    blurb: "Pro tools",
  },
  {
    name: "MEXC",
    href: process.env.NEXT_PUBLIC_MEXC_AFFILIATE || "https://www.mexc.com/",
    blurb: "Altcoin depth",
  },
];
