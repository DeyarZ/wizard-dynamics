"use client";

import { useState, useEffect, useRef } from 'react';

/**
 * Hook to detect if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mediaQuery.matches);
    
    const handleChange = () => {
      setPrefersReduced(mediaQuery.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
  
  return prefersReduced;
}

/**
 * Hook to check if an element is in the viewport
 */
export function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<Element | null>(null);
  const [isInView, setIsInView] = useState(false);
  
  useEffect(() => {
    if (!ref.current) return;
    
    // Store reference to the DOM element
    const currentElement = ref.current;
    
    const callback: IntersectionObserverCallback = (entries) => {
      entries.forEach(entry => {
        setIsInView(entry.isIntersecting);
      });
    };
    
    const observer = new IntersectionObserver(callback, {
      root: null,
      rootMargin: '0px',
      threshold: 0,
      ...options
    });
    
    observer.observe(currentElement);
    
    return () => {
      // Use the captured reference for cleanup
      observer.unobserve(currentElement);
    };
  }, [options]);
  
  return { ref, isInView };
}

/**
 * Hook to optimize canvas rendering (pause when not in view)
 */
export function useOptimizedCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const { ref: containerRef, isInView } = useInView({
    rootMargin: '100px 0px' // Start rendering a bit before it comes into view
  });
  
  const requestRender = (renderFn: FrameRequestCallback) => {
    if (isInView && !frameIdRef.current) {
      frameIdRef.current = requestAnimationFrame(time => {
        frameIdRef.current = null;
        renderFn(time);
      });
    }
  };
  
  const cancelRender = () => {
    if (frameIdRef.current) {
      cancelAnimationFrame(frameIdRef.current);
      frameIdRef.current = null;
    }
  };
  
  useEffect(() => {
    return () => {
      cancelRender();
    };
  }, []);
  
  return { canvasRef, containerRef, isInView, requestRender, cancelRender };
}

/**
 * Hook to handle font loading and prevent CLS
 */
export function useFontLoading() {
  const [fontLoaded, setFontLoaded] = useState(false);
  
  useEffect(() => {
    document.documentElement.classList.add('font-loading');
    
    // Use the document.fonts.ready promise to detect when fonts have loaded
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        setFontLoaded(true);
        document.documentElement.classList.remove('font-loading');
        document.documentElement.classList.add('font-loaded');
      });
    } else {
      // Fallback for browsers that don't support the fonts API
      const timeoutId = setTimeout(() => {
        setFontLoaded(true);
        document.documentElement.classList.remove('font-loading');
        document.documentElement.classList.add('font-loaded');
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, []);
  
  return fontLoaded;
}

/**
 * Hook to initialize and manage audio for the site
 */
export function useAudio() {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [audioInitialized, setAudioInitialized] = useState(false);
  
  useEffect(() => {
    let audioElement: HTMLAudioElement;
    
    try {
      audioElement = new Audio('/audio/ambient-hum.mp3');
      audioElement.loop = true;
      audioElement.volume = 0.15; // Set to -30 LUFS equivalent
      audioElement.muted = true;
      
      // Add error handling for audio loading
      audioElement.addEventListener('error', (e) => {
        console.error('Error loading audio:', e);
      });
      
      // Check if audio loaded successfully
      audioElement.addEventListener('canplaythrough', () => {
        setAudioInitialized(true);
      });
      
      setAudio(audioElement);
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
    
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
        audioElement.remove();
      }
    };
  }, []);
  
  const togglePlay = () => {
    if (!audio || !audioInitialized) return;
    
    // Use user interaction to bypass autoplay restrictions
    const playPromise = isPlaying ? Promise.resolve() : audio.play();
    
    playPromise
      .then(() => {
        if (isPlaying) {
          audio.pause();
        }
        setIsPlaying(!isPlaying);
      })
      .catch(error => {
        console.error('Audio playback error:', error);
        // Force muted playback as fallback
        audio.muted = true;
        audio.play().catch(e => console.error('Cannot play audio even when muted:', e));
      });
  };
  
  const toggleMute = () => {
    if (!audio || !audioInitialized) return;
    
    const newMutedState = !audio.muted;
    audio.muted = newMutedState;
    setIsMuted(newMutedState);
    
    if (!newMutedState && !isPlaying) {
      audio.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(error => {
          console.error('Cannot unmute audio:', error);
          // Keep it muted if we can't play
          audio.muted = true;
          setIsMuted(true);
        });
    }
  };
  
  return { audio, isPlaying, isMuted, audioInitialized, togglePlay, toggleMute };
} 