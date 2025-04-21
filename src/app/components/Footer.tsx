"use client";

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useCursor } from './utils/cursorUtils';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const Footer = () => {
  const { setCursorType } = useCursor();
  const footerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  useEffect(() => {
    if (!footerRef.current) return;
    
    // Add glowing effect to the footer background
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: footerRef.current,
        start: "top 80%",
        end: "center center",
        scrub: 1,
      }
    });
    
    tl.fromTo('.footer-glow', 
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1, ease: "power2.out" }
    );
    
    // Animate form elements
    if (formRef.current) {
      const formElements = formRef.current.querySelectorAll('input, textarea, button');
      
      gsap.fromTo(formElements,
        { y: 20, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          stagger: 0.1, 
          duration: 0.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: formRef.current,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      );
    }
    
    return () => {
      if (footerRef.current) {
        const triggers = ScrollTrigger.getAll().filter(
          trigger => trigger.vars.trigger === footerRef.current
        );
        triggers.forEach(trigger => trigger.kill());
      }
    };
  }, []);
  
  return (
    <footer 
      ref={footerRef}
      className="relative bg-gray-900 text-white overflow-hidden pt-20 pb-12"
      id="contact"
    >
      {/* Glowing background effect */}
      <div className="footer-glow absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-indigo-900/20 blur-[100px]"></div>
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] rounded-full bg-purple-900/20 blur-[80px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-blue-900/20 blur-[80px]"></div>
      </div>
      
      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Contact form */}
          <div>
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-6 text-white"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Summon Us
            </motion.h2>
            
            <motion.p 
              className="text-purple-200 mb-8 max-w-md"
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Ready to transform your digital presence? Send us a message and we'll connect our magical circuits to yours.
            </motion.p>
            
            <form 
              ref={formRef}
              className="space-y-4" 
              onSubmit={(e) => e.preventDefault()}
            >
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  placeholder="Your name"
                  onFocus={() => setCursorType('focus')}
                  onBlur={() => setCursorType('default')}
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  placeholder="your.email@example.com"
                  onFocus={() => setCursorType('focus')}
                  onBlur={() => setCursorType('default')}
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">Message</label>
                <textarea 
                  id="message" 
                  rows={4} 
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white resize-none"
                  placeholder="Tell us about your project..."
                  onFocus={() => setCursorType('focus')}
                  onBlur={() => setCursorType('default')}
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="btn-depth px-6 py-3 relative overflow-hidden rounded-md bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-medium transition duration-300 hover:from-indigo-500 hover:to-purple-600"
                onMouseEnter={() => setCursorType('hover')}
                onMouseLeave={() => setCursorType('default')}
              >
                <span className="relative z-10">Send Message</span>
              </button>
            </form>
          </div>
          
          {/* Info */}
          <div>
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div>
                <h3 className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Visit Our Tower</h3>
                <p className="text-gray-300 mb-2">Wizard Dynamics Inc.</p>
                <p className="text-gray-300 mb-2">123 Arcane Street</p>
                <p className="text-gray-300">Techlandia, TX 75001</p>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Connect</h3>
                <p className="text-gray-300 mb-2">contact@wizarddynamics.com</p>
                <p className="text-gray-300">+1 (555) 123-4567</p>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Follow Our Spells</h3>
                <div className="flex space-x-4">
                  {['twitter', 'github', 'linkedin', 'instagram'].map((social) => (
                    <a 
                      key={social}
                      href={`https://${social}.com/wizarddynamics`} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition duration-300"
                      onMouseEnter={() => setCursorType('hover')}
                      onMouseLeave={() => setCursorType('default')}
                    >
                      <span className="sr-only">{social}</span>
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        {social === 'twitter' && (
                          <path d="M8.29 20.25c7.55 0 11.68-6.25 11.68-11.67 0-.18 0-.36-.01-.53.8-.58 1.49-1.3 2.04-2.13-.74.33-1.53.55-2.36.65.85-.51 1.5-1.32 1.8-2.28-.79.47-1.67.81-2.6.99-.75-.8-1.81-1.3-2.99-1.3-2.26 0-4.1 1.84-4.1 4.1 0 .32.04.63.11.94-3.41-.17-6.43-1.8-8.46-4.29-.35.61-.55 1.32-.55 2.08 0 1.42.72 2.68 1.83 3.42-.67-.02-1.31-.21-1.86-.52v.05c0 1.99 1.41 3.65 3.29 4.02-.34.09-.71.14-1.08.14-.26 0-.52-.03-.77-.08.52 1.63 2.04 2.82 3.83 2.85-1.4 1.1-3.17 1.76-5.1 1.76-.33 0-.66-.02-.98-.06 1.82 1.17 3.97 1.85 6.29 1.85"></path>
                        )}
                        {social === 'github' && (
                          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
                        )}
                        {social === 'linkedin' && (
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                        )}
                        {social === 'instagram' && (
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"></path>
                        )}
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Wizard Dynamics. All spells reserved.
          </p>
          
          <div className="flex space-x-6">
            <a 
              href="#" 
              className="text-gray-400 hover:text-white text-sm transition-colors duration-300"
              onMouseEnter={() => setCursorType('hover')}
              onMouseLeave={() => setCursorType('default')}
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              className="text-gray-400 hover:text-white text-sm transition-colors duration-300"
              onMouseEnter={() => setCursorType('hover')}
              onMouseLeave={() => setCursorType('default')}
            >
              Terms of Service
            </a>
            <a 
              href="#" 
              className="text-gray-400 hover:text-white text-sm transition-colors duration-300"
              onMouseEnter={() => setCursorType('hover')}
              onMouseLeave={() => setCursorType('default')}
            >
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 