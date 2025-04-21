"use client";

import React from 'react';
import Link from 'next/link';
import { DefaultHero, ProductHero, EventHero, MinimalHero } from '../components/sections/HeroSection/variants';

export default function HeroDemo() {
  return (
    <div className="font-sans">
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Hero Section Variants</h1>
          <p className="text-gray-300">Scroll down to see different modular hero section variants</p>
        </div>
      </header>
      
      <section className="py-8 bg-gray-100">
        <div className="container mx-auto">
          <h2 className="text-xl font-semibold mb-4 px-4">Default Hero</h2>
        </div>
        <DefaultHero />
      </section>
      
      <section className="py-8 bg-gray-100">
        <div className="container mx-auto">
          <h2 className="text-xl font-semibold mb-4 px-4">Product Hero</h2>
        </div>
        <ProductHero />
      </section>
      
      <section className="py-8 bg-gray-100">
        <div className="container mx-auto">
          <h2 className="text-xl font-semibold mb-4 px-4">Event Hero</h2>
        </div>
        <EventHero />
      </section>
      
      <section className="py-8 bg-gray-100">
        <div className="container mx-auto">
          <h2 className="text-xl font-semibold mb-4 px-4">Minimal Hero</h2>
        </div>
        <MinimalHero />
      </section>
      
      <footer className="bg-gray-800 text-white p-4 text-center">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} Wizard Dynamics – Modular Hero Section Demo</p>
          <p className="mt-2">
            <Link href="/" className="text-blue-300 hover:text-blue-100">Back to Home</Link>
          </p>
        </div>
      </footer>
    </div>
  );
} 