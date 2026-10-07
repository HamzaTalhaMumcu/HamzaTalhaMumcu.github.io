import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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
  metadataBase: new URL("https://pitlo.me"),
  title: {
    default: "PITLO — Your AI advertising team",
    template: "%s | PITLO",
  },
  description:
    "PITLO turns your product into a clear audience, advertising strategy, hooks, and ad copy.",
  openGraph: {
    type: "website",
    url: "https://pitlo.me/",
    siteName: "PITLO",
    title: "PITLO — Your AI advertising team",
    description:
      "Turn your product into a clear audience, advertising strategy, hooks, and ad copy.",
  },
  twitter: {
    card: "summary",
    title: "PITLO — Your AI advertising team",
    description:
      "Turn your product into a clear audience, advertising strategy, hooks, and ad copy.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
