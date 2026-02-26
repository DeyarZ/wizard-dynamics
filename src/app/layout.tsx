import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Wizard Dynamics — 103 Apps on the App Store",
  description: "Wizard Dynamics builds iOS apps used by millions. Browse our full portfolio of 103 live apps.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
