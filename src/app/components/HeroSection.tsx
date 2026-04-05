"use client";

import { useState } from "react";
import Link from "next/link";
import TypewriterHero from "./TypewriterHero";

const heroLines = [
  {
    text: "We build things",
    className: "text-[#e8e6e3]",
  },
  {
    text: "that make money.",
    className: "bg-gradient-to-r from-[#c9b99a] via-[#e8d5b5] to-[#b4a896] bg-clip-text text-transparent",
  },
];

export default function HeroSection() {
  const [typingDone, setTypingDone] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-16">
      <div className="max-w-6xl mx-auto w-full">
        <div className="space-y-8">
          {/* Subtitle — fades in immediately */}
          <p
            className="font-mono text-xs tracking-[0.3em] text-[#b4a896]/80 uppercase transition-all duration-700"
            style={{
              opacity: 1,
              transform: "translateY(0)",
            }}
          >
            Munich-based product studio
          </p>

          {/* Typewriter Title */}
          <h1 className="font-mono text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95]">
            <TypewriterHero
              lines={heroLines}
              typingSpeed={60}
              pauseBetweenLines={500}
              onComplete={() => setTypingDone(true)}
            />
          </h1>

          {/* Description — fades in after typing */}
          <p
            className="font-sans text-lg sm:text-xl text-[#e8e6e3]/40 max-w-xl leading-relaxed transition-all duration-700 ease-out"
            style={{
              opacity: typingDone ? 1 : 0,
              transform: typingDone ? "translateY(0)" : "translateY(15px)",
            }}
          >
            Apps. SaaS. Content. Whatever needs building.
            We ship fast, optimize obsessively, and let the
            numbers do the talking.
          </p>

          {/* CTA — fades in after description */}
          <div
            className="flex gap-4 pt-4 transition-all duration-700 ease-out"
            style={{
              opacity: typingDone ? 1 : 0,
              transform: typingDone ? "translateY(0)" : "translateY(15px)",
              transitionDelay: typingDone ? "200ms" : "0ms",
            }}
          >
            <Link
              href="https://apps.wizarddynamics.com"
              className="font-mono text-sm tracking-wider px-8 py-4 bg-[#e8e6e3] text-[#0c0c0f] hover:bg-[#e8e6e3]/90 transition-colors"
            >
              SEE WHAT WE BUILT →
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
        <div className="w-px h-16 bg-gradient-to-b from-transparent via-[#e8e6e3]/15 to-transparent animate-pulse" />
      </div>
    </section>
  );
}
