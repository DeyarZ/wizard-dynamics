"use client";

import { Geist } from "next/font/google";
import { useEffect } from "react";
import "./globals.css";
import Navigation from "@/app/components/Navigation";

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Fix for iOS momentum scrolling issues
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    
    // Clean up on unmount
    return () => {
      document.documentElement.style.height = '';
      document.body.style.height = '';
    };
  }, []);
  
  return (
    <html lang="de" className="scroll-smooth">
      <head>
        <title>Wizard Dynamics - Engineering Reality</title>
        <meta name="description" content="We materialize digital solutions, transforming ideas into tangible results for your business." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#111827" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${geist.className} min-h-screen bg-background text-foreground antialiased overflow-x-hidden`}>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
