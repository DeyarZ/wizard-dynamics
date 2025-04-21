import React from 'react';
import HeroSection from './index';

export const DefaultHero: React.FC = () => (
  <HeroSection
    title="Transform Your Digital Experience"
    subtitle="Innovative solutions to help your business grow and succeed in the digital age"
    ctaText="Get Started"
    ctaLink="#contact"
    imageSrc="https://placehold.co/600x400/0066cc/ffffff?text=Wizard+Dynamics"
    imageAlt="Hero image"
    backgroundColor="bg-gradient-to-r from-blue-600 to-indigo-800"
  />
);

export const ProductHero: React.FC = () => (
  <HeroSection
    title="Revolutionary Product Suite"
    subtitle="Our cutting-edge products drive efficiency and innovation in your business"
    ctaText="Explore Products"
    ctaLink="#products"
    imageSrc="https://placehold.co/600x400/6600cc/ffffff?text=Product+Suite"
    imageAlt="Product showcase"
    backgroundColor="bg-gradient-to-r from-purple-600 to-pink-600"
  />
);

export const EventHero: React.FC = () => (
  <HeroSection
    title="Join Our Upcoming Event"
    subtitle="Connect with industry leaders and discover the latest trends in technology"
    ctaText="Register Now"
    ctaLink="#events"
    imageSrc="https://placehold.co/600x400/cc6600/ffffff?text=Upcoming+Event"
    imageAlt="Event announcement"
    backgroundColor="bg-gradient-to-r from-amber-500 to-orange-600"
  />
);

export const MinimalHero: React.FC = () => (
  <HeroSection
    title="Simple. Effective. Powerful."
    subtitle="Less is more. Discover our minimalist approach to digital solutions."
    ctaText="Learn More"
    ctaLink="#about"
    imageSrc="https://placehold.co/600x400/333333/ffffff?text=Minimal+Design"
    imageAlt="Minimal design"
    backgroundColor="bg-gray-900"
  />
); 