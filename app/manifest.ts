import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MxCrypto",
    short_name: "MxCrypto",
    description:
      "Wararka Bitcoin, Ethereum, iyo crypto ee af-Soomaali. News cusub, qiime toos ah, iyo free courses.",
    start_url: "/",
    display: "standalone",
    background_color: "#02050b",
    theme_color: "#02050b",
    lang: "so",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
