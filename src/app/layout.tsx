import type { Metadata } from "next";
import { Anton, Caveat, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Bold, condensed grotesk display font for headlines.
const displayFont = Anton({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

// Handwritten script font, used only for selective accent words.
const scriptFont = Caveat({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: "Algrow Media — AI Videos, Banners, Web Apps, Websites & SaaS Development",
  description:
    "Algrow Media produces high-converting AI videos & commercial banners, and builds production-ready custom web applications, modern websites, and scalable SaaS platforms.",
  icons: {
    icon: "/logo.jpeg",
    apple: "/logo.jpeg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${displayFont.variable} ${scriptFont.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Caveat:wght@500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
