import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Sans_Arabic, Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";
import { getLang } from "@/lib/i18n/server";
import { I18nProvider } from "@/components/layout/i18n-provider";

const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex", display: "swap" });
const plexAr = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "500", "600"], variable: "--font-plex-ar", display: "swap" });
const kufi = Noto_Kufi_Arabic({ subsets: ["arabic"], weight: ["500", "700"], variable: "--font-kufi", display: "swap" });

export const metadata: Metadata = {
  title: { default: "بناء ليبيا · Benaa Libya", template: "%s · Benaa Libya" },
  description: "Construction materials marketplace for Libya — real regional prices, trusted suppliers, delivery and cost tools.",
};

export const viewport: Viewport = { themeColor: "#14171A", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"} className={`${plex.variable} ${plexAr.variable} ${kufi.variable}`}>
      <body>
        <I18nProvider lang={lang}>{children}</I18nProvider>
      </body>
    </html>
  );
}
