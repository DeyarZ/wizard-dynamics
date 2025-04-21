import React from 'react';
import Image from 'next/image';

interface HeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  imageSrc?: string;
  imageAlt?: string;
  backgroundColor?: string;
}

const HeroSection: React.FC<HeroProps> = ({
  title = 'Transform Your Digital Experience',
  subtitle = 'Innovative solutions to help your business grow and succeed in the digital age',
  ctaText = 'Get Started',
  ctaLink = '#contact',
  imageSrc = 'https://placehold.co/600x400/0066cc/ffffff?text=Wizard+Dynamics',
  imageAlt = 'Hero image',
  backgroundColor = 'bg-gradient-to-r from-blue-600 to-indigo-800',
}) => {
  return (
    <section className={`relative overflow-hidden ${backgroundColor}`}>
      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">{title}</h1>
            <p className="text-lg md:text-xl mb-8 max-w-xl">{subtitle}</p>
            <a 
              href={ctaLink} 
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-full hover:bg-blue-50 transition duration-300"
            >
              {ctaText}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 ml-2" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
            </a>
          </div>
          <div className="relative h-64 md:h-80 lg:h-96">
            {imageSrc && (
              <div className="relative h-full w-full rounded-lg overflow-hidden shadow-2xl">
                <Image 
                  src={imageSrc}
                  alt={imageAlt || 'Hero image'}
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Abstract shapes for background effect */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500 opacity-20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-600 opacity-20 rounded-full blur-3xl"></div>
    </section>
  );
};

export default HeroSection; 