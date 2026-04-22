import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SwrProvider } from "@/components/providers/SwrProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "codelearn — learn TypeScript in your browser",
  description: "Progate-style TypeScript learning platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <SwrProvider>{children}</SwrProvider>
      </body>
    </html>
  );
}
