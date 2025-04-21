"use client";

import { useEffect, ReactNode, useState } from 'react';
import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from './hooks';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface SmoothScrollProps {
  children: ReactNode;
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  const prefersReducedMotion = useReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);
  
  useEffect(() => {
    // Skip smooth scrolling for reduced motion preference
    if (prefersReducedMotion) return;

    // Check for mobile device - use simplified settings for mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Initialize Lenis with optimized settings
    const lenisInstance = new Lenis({
      duration: isMobile ? 0.8 : 1.0,  // Reduced duration for smoother experience
      easing: (t) => 1 - Math.pow(1 - t, 3), // Cubic ease out for smoother stops
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 1.5, // Reduced from 2 for better control
      infinite: false,
      wheelMultiplier: 0.8, // Reduced for more control
    });
    
    setLenis(lenisInstance);
    
    // GSAP ScrollTrigger integration
    gsap.ticker.add((time) => {
      lenisInstance.raf(time * 1000); // Convert GSAP time to milliseconds
    });
    
    // Update ScrollTrigger when scrolling
    lenisInstance.on('scroll', ScrollTrigger.update);
    
    // Add a resize listener to fix any scroll position issues
    const handleResize = () => {
      lenisInstance.resize();
      ScrollTrigger.refresh();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Prevent conflicts with native browser behavior
    const preventDefaultWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 40) {
        e.preventDefault();
      }
    };
    
    // Only add this event listener on desktop
    if (!isMobile) {
      window.addEventListener('wheel', preventDefaultWheel, { passive: false });
    }
    
    // iOS overscroll fix
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overscrollBehavior = 'none';
    
    // Cleanup
    return () => {
      lenisInstance.destroy();
      gsap.ticker.remove(lenisInstance.raf);
      window.removeEventListener('resize', handleResize);
      
      if (!isMobile) {
        window.removeEventListener('wheel', preventDefaultWheel);
      }
      
      document.body.style.overscrollBehavior = '';
      document.documentElement.style.overscrollBehavior = '';
    };
  }, [prefersReducedMotion]);
  
  // Method to stop scrolling when needed
  useEffect(() => {
    if (!lenis) return;
    
    // Stop scrolling during heavy animations or in specific sections
    // Commented out because currently not used
    // const handleAnimationStart = () => {
    //   lenis.stop();
    // };
    
    // const handleAnimationComplete = () => {
    //   lenis.start();
    // };
    
    // Listen for animation events from GSAP
    gsap.ticker.add(() => {
      if (ScrollTrigger.isScrolling()) {
        // Ensure scroll animations are smooth
        lenis.scroll(ScrollTrigger.getScrollFunc(window));
      }
    });
    
    return () => {
      // Clean up any event listeners
    };
  }, [lenis]);
  
  return <>{children}</>;
}

export default SmoothScroll; 