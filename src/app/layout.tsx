import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Wizard Dynamics",
  description:
    "100+ apps built. $210K+ ARR. Two founders, one AI, zero meetings. Munich.",
  openGraph: {
    title: "Wizard Dynamics",
    description:
      "100+ apps built. $210K+ ARR. Two founders, one AI, zero meetings. Munich.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${jetbrains.variable} ${inter.variable} antialiased bg-[#0c0c0f] text-[#e8e6e3]`}
      >
        {children}
      </body>
    </html>
  );
}
