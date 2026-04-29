import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Noto_Sans_JP } from "next/font/google";
import { SwrProvider } from "@/components/providers/SwrProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Arcode — ブラウザで TypeScript を学ぶ",
  description: "モノづくりで学ぶ TypeScript 学習プラットフォーム",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ja"
      className={`dark ${inter.variable} ${jetbrainsMono.variable} ${notoSansJp.variable} h-full antialiased`}
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <SwrProvider>{children}</SwrProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
