import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wizard Dynamics — App Studio",
  description: "We build apps people love. 100+ iOS apps, millions of downloads.",
  openGraph: {
    title: "Wizard Dynamics — App Studio",
    description: "We build apps people love. 100+ iOS apps, millions of downloads.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
