"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ThreeJSHero from './components/sections/HeroSection/ThreeJSHero';

export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  
  return (
    <main className="font-sans">
      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        className="min-h-screen relative overflow-hidden"
        style={{ opacity, scale }}
      >
        <ThreeJSHero />
      </motion.section>

      {/* Services Section */}
      <section id="services" className="section bg-muted relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/30 blur-3xl rounded-full"></div>
          <div className="absolute top-32 -left-12 w-72 h-72 bg-primary/20 blur-3xl rounded-full"></div>
        </div>
      
        <div className="container relative z-10">
          <div className="flex flex-col items-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-mono mb-4"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>LEISTUNGEN</span>
            </motion.div>
            
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Digitale <span className="text-primary">Perfektion</span>. Keine Kompromisse.
            </motion.h2>
            
            <motion.p 
              className="text-muted-foreground max-w-2xl mx-auto text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Wir entwickeln Software, die andere für unmöglich halten – und das in Rekordzeit.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Service 1 */}
            <motion.div 
              className="card border border-muted-foreground/10 hover:border-primary/50 transition-colors group relative overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="mb-6 text-primary text-4xl relative z-10 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <span className="text-xl font-semibold">Webentwicklung</span>
              </div>
              <p className="text-muted-foreground mb-4 relative z-10">
                High-Performance-Webanwendungen mit modernsten Technologien. Wir bauen keine Websites, sondern digitale Erlebnisse.
              </p>
              <div className="flex items-center gap-2 text-primary font-medium relative z-10">
                <span>Tech-Stack:</span>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <span className="px-2 py-1 bg-muted rounded">React</span>
                  <span className="px-2 py-1 bg-muted rounded">Next.js</span>
                  <span className="px-2 py-1 bg-muted rounded">Node</span>
                </div>
              </div>
            </motion.div>

            {/* Service 2 */}
            <motion.div 
              className="card border border-muted-foreground/10 hover:border-primary/50 transition-colors group relative overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="mb-6 text-primary text-4xl relative z-10 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xl font-semibold">App-Entwicklung</span>
              </div>
              <p className="text-muted-foreground mb-4 relative z-10">
                Native und Cross-Platform-Apps mit nativer Performance. Von der Konzeption bis zur Veröffentlichung im App Store.
              </p>
              <div className="flex items-center gap-2 text-primary font-medium relative z-10">
                <span>Tech-Stack:</span>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <span className="px-2 py-1 bg-muted rounded">React Native</span>
                  <span className="px-2 py-1 bg-muted rounded">Swift</span>
                  <span className="px-2 py-1 bg-muted rounded">Kotlin</span>
                </div>
              </div>
            </motion.div>

            {/* Service 3 */}
            <motion.div 
              className="card border border-muted-foreground/10 hover:border-primary/50 transition-colors group relative overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="mb-6 text-primary text-4xl relative z-10 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xl font-semibold">SaaS-Produkte</span>
              </div>
              <p className="text-muted-foreground mb-4 relative z-10">
                Skalierbare Cloud-basierte Softwarelösungen. Vom MVP bis zur Enterprise-ready Plattform – innerhalb weniger Monate.
              </p>
              <div className="flex items-center gap-2 text-primary font-medium relative z-10">
                <span>Tech-Stack:</span>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <span className="px-2 py-1 bg-muted rounded">Cloud</span>
                  <span className="px-2 py-1 bg-muted rounded">GraphQL</span>
                  <span className="px-2 py-1 bg-muted rounded">Serverless</span>
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <a href="#contact" className="btn btn-outline text-lg group">
              <span className="group-hover:text-primary-foreground">Jetzt unverbindliches Beratungsgespräch vereinbaren</span>
              <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="section relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-full h-96 bg-gradient-to-b from-primary/10 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-t from-primary/10 to-transparent"></div>
        </div>
        
        <div className="container relative z-10">
          <div className="flex flex-col items-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-mono mb-4"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>CASE STUDIES</span>
            </motion.div>
            
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              5 Produkte in 12 Monaten
            </motion.h2>
            
            <motion.p 
              className="text-muted-foreground max-w-2xl mx-auto text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Was andere in Jahren nicht schaffen, setzen wir in Monaten um.
            </motion.p>
          </div>

          <div className="space-y-24">
            {/* Project 1 */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 items-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="order-2 lg:order-1">
                <div className="text-sm font-mono text-primary mb-4">01 / E-COMMERCE PLATFORM</div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Hyperperformante E-Commerce-Plattform mit 0.8s Ladezeit</h3>
                <p className="text-muted-foreground mb-6">
                  Eine Next.js-basierte E-Commerce-Lösung mit Server-Components, die eine Performance bietet, von der andere nur träumen können. Vollständige Integration mit Headless-CMS und Payment-Anbietern.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div>
                    <div className="text-2xl font-bold text-primary mb-1">2 Wochen</div>
                    <div className="text-sm text-muted-foreground">Zeit bis zum MVP</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary mb-1">300%</div>
                    <div className="text-sm text-muted-foreground">Conversion-Steigerung</div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span className="text-foreground">Serverless Architecture</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span className="text-foreground">Edge Functions für globale Skalierung</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span className="text-foreground">Vollständig typsicherer Code mit TypeScript</span>
                  </div>
                </div>
                
                <a href="#" className="group inline-flex items-center text-primary font-medium">
                  <span>Case Study ansehen</span>
                  <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
              
              <div className="order-1 lg:order-2 relative">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-background via-muted to-background border border-muted-foreground/10">
                    <span className="font-mono text-muted-foreground">PROJEKT SCREENSHOT</span>
                  </div>
                  
                  {/* Code overlay */}
                  <div className="absolute bottom-4 right-4 w-[60%] h-24 bg-card border border-muted-foreground/20 rounded-md overflow-hidden shadow-xl">
                    <div className="h-6 bg-muted flex items-center px-3">
                      <div className="flex space-x-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      </div>
                      <div className="text-xs text-muted-foreground mx-auto font-mono">terminal</div>
                    </div>
                    <div className="p-2 font-mono text-xs text-primary-foreground">
                      <div className="flex">
                        <span className="text-green-400">✓</span>
                        <span className="ml-2">Page loaded in 0.8s</span>
                      </div>
                      <div className="flex text-muted-foreground">
                        <span className="ml-4">Lighthouse score: 100/100</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-6 -left-6 h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-mono text-lg font-bold">01</div>
              </div>
            </motion.div>
            
            {/* Project 2 */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 items-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-background via-muted to-background border border-muted-foreground/10">
                    <span className="font-mono text-muted-foreground">PROJEKT SCREENSHOT</span>
                  </div>
                  
                  {/* Data visualization overlay */}
                  <div className="absolute top-4 left-4 w-[60%] h-24 bg-card border border-muted-foreground/20 rounded-md overflow-hidden shadow-xl">
                    <div className="h-6 bg-muted flex items-center px-3">
                      <div className="flex space-x-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      </div>
                      <div className="text-xs text-muted-foreground mx-auto font-mono">metrics.js</div>
                    </div>
                    <div className="p-2 font-mono text-xs">
                      <div className="flex items-center h-5">
                        <span className="w-10 text-muted-foreground">Q1</span>
                        <div className="h-2 bg-primary rounded" style={{ width: '20%' }}></div>
                        <span className="text-primary-foreground text-xs ml-2">20%</span>
                      </div>
                      <div className="flex items-center h-5">
                        <span className="w-10 text-muted-foreground">Q2</span>
                        <div className="h-2 bg-primary rounded" style={{ width: '65%' }}></div>
                        <span className="text-primary-foreground text-xs ml-2">65%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-6 -right-6 h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-mono text-lg font-bold">02</div>
              </div>
              
              <div>
                <div className="text-sm font-mono text-primary mb-4">02 / DATA ANALYTICS</div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Business Analytics Dashboard mit Echtzeit-Datenvisualisierung</h3>
                <p className="text-muted-foreground mb-6">
                  Ein interaktives Dashboard zur Visualisierung komplexer Geschäftsdaten. Mit Realtime-Updates, AI-gestützten Insights und einer Benutzeroberfläche, die selbst komplexe Daten verständlich macht.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div>
                    <div className="text-2xl font-bold text-primary mb-1">4 Wochen</div>
                    <div className="text-sm text-muted-foreground">Entwicklungszeit</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary mb-1">50.000+</div>
                    <div className="text-sm text-muted-foreground">Datensätze pro Sekunde</div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span className="text-foreground">Realtime-Datenverarbeitung</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span className="text-foreground">Machine Learning-gestützte Prognosen</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span className="text-foreground">Nahtlose API-Integration mit bestehenden Systemen</span>
                  </div>
                </div>
                
                <a href="#" className="group inline-flex items-center text-primary font-medium">
                  <span>Case Study ansehen</span>
                  <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            className="mt-20 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <a href="#" className="btn btn-primary text-lg">
              Alle Projekte ansehen
            </a>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section bg-muted relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute right-0 w-full h-full">
            <svg className="absolute right-0 w-full h-full text-primary/10" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon points="0,0 100,0 100,100" fill="currentColor" />
            </svg>
          </div>
        </div>
        
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-mono mb-4"
              >
                <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span>DIE MASCHINEN HINTER DER MAGIE</span>
              </motion.div>
              
              <motion.h2 
                className="text-4xl md:text-5xl font-bold mb-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Zwei Gründer. <span className="text-primary">Fünf Produkte.</span> Ein Jahr.
              </motion.h2>
              
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <p className="text-muted-foreground mb-6">
                  Wizard Dynamics wurde von zwei Tech-Enthusiasten gegründet, die es satt hatten, die gleichen Probleme in der Softwareentwicklung immer wieder zu lösen. Unsere Mission: Digitale Produkte zu entwickeln, die <span className="text-foreground font-medium">schneller, besser und effizienter</span> sind als alles, was Sie bisher gesehen haben.
                </p>
                
                <p className="text-muted-foreground mb-8">
                  Wir glauben nicht an endlose Meetings, aufgeblähte Teams oder Bullshit-Buzzwords. Wir liefern Resultate. Punkt.
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-1">Radikale Effizienz</h3>
                      <p className="text-muted-foreground">Wir bauen in Wochen, was andere in Monaten nicht schaffen.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-1">Technische Exzellenz</h3>
                      <p className="text-muted-foreground">Wir setzen auf zukunftssichere Technologien und kompromisslose Qualität.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-1">Performance-Obsession</h3>
                      <p className="text-muted-foreground">Jede Millisekunde zählt. Wir optimieren bis zur Perfektion.</p>
                    </div>
                  </div>
                </div>
                
                <a href="#contact" className="btn btn-primary group relative overflow-hidden">
                  <span className="relative z-10 flex items-center">
                    Team kennenlernen
                    <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity z-0" />
                </a>
              </motion.div>
            </motion.div>
            
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="grid grid-cols-2 gap-6 relative z-10">
                <motion.div 
                  className="h-40 flex flex-col justify-center items-center bg-card rounded-lg p-6 shadow-lg border border-muted-foreground/10"
                  whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)" }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  <div className="text-5xl font-bold text-primary mb-2">50+</div>
                  <p className="text-center text-muted-foreground font-medium">Projekte abgeschlossen</p>
                </motion.div>
                
                <motion.div 
                  className="h-40 flex flex-col justify-center items-center bg-card rounded-lg p-6 shadow-lg border border-muted-foreground/10"
                  whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)" }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  <div className="text-5xl font-bold text-primary mb-2">2x</div>
                  <p className="text-center text-muted-foreground font-medium">schnellere Entwicklung</p>
                </motion.div>
                
                <motion.div 
                  className="h-40 flex flex-col justify-center items-center bg-card rounded-lg p-6 shadow-lg border border-muted-foreground/10"
                  whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)" }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  <div className="text-5xl font-bold text-primary mb-2">100%</div>
                  <p className="text-center text-muted-foreground font-medium">Lighthouse-Score</p>
                </motion.div>
                
                <motion.div 
                  className="h-40 flex flex-col justify-center items-center bg-card rounded-lg p-6 shadow-lg border border-muted-foreground/10"
                  whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)" }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  <div className="text-5xl font-bold text-primary mb-2">24/7</div>
                  <p className="text-center text-muted-foreground font-medium">Support & Monitoring</p>
                </motion.div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
              
              {/* Code snippet overlay */}
              <motion.div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] bg-card border border-muted-foreground/20 rounded-md overflow-hidden shadow-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <div className="h-6 bg-muted flex items-center px-3">
                  <div className="flex space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  </div>
                  <div className="text-xs text-muted-foreground mx-auto font-mono">team.ts</div>
                </div>
                <div className="p-4 font-mono text-xs">
                  <pre className="text-muted-foreground">
                    <span className="text-blue-400">const</span> <span className="text-green-400">wizards</span> = [<br/>
                    <span className="ml-4">{'{'}</span><br/>
                    <span className="ml-8"><span className="text-blue-400">name</span>: <span className="text-amber-400">"Max Mustermann"</span>,</span><br/>
                    <span className="ml-8"><span className="text-blue-400">role</span>: <span className="text-amber-400">"Full-Stack Engineer"</span>,</span><br/>
                    <span className="ml-8"><span className="text-blue-400">superpower</span>: <span className="text-amber-400">"Schreibt Code in Lichtgeschwindigkeit"</span></span><br/>
                    <span className="ml-4">{'}'}</span>,<br/>
                    <span className="ml-4">{'{'}</span><br/>
                    <span className="ml-8"><span className="text-blue-400">name</span>: <span className="text-amber-400">"Anna Schmidt"</span>,</span><br/>
                    <span className="ml-8"><span className="text-blue-400">role</span>: <span className="text-amber-400">"UX/Frontend Expertin"</span>,</span><br/>
                    <span className="ml-8"><span className="text-blue-400">superpower</span>: <span className="text-amber-400">"Macht Benutzer sprachlos"</span></span><br/>
                    <span className="ml-4">{'}'}</span><br/>
                    ];
                  </pre>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle,theme(colors.background)_30%,theme(colors.background/95)_100%)] z-10" />
          <div className="absolute inset-0 z-0">
            <svg width="100%" height="100%" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(125, 83, 207, 0.05)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="800" height="800" fill="url(#grid)" />
            </svg>
          </div>
        </div>
        
        <div className="container relative z-20">
          <div className="flex flex-col items-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-mono mb-4"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>STARTE DEIN PROJEKT</span>
            </motion.div>
            
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Bereit für <span className="text-primary">unmögliche</span> Ergebnisse?
            </motion.h2>
            
            <motion.p 
              className="text-muted-foreground max-w-2xl mx-auto text-center mb-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Kein unnötiges Gerede. Kein Verkaufs-Bullshit. Schreib uns, was du brauchst, und wir setzen es um.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <motion.div 
              className="lg:col-span-3"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <form className="space-y-6 bg-card rounded-lg p-8 border border-muted-foreground/10 shadow-xl relative">
                <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-bl-full"></div>
                
                <h3 className="text-2xl font-bold mb-6 relative z-10">Lass uns reden</h3>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="relative">
                    <label htmlFor="name" className="block text-sm font-medium mb-2 text-foreground">Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      className="w-full p-3 bg-muted rounded-md border border-muted-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Dein Name"
                    />
                  </div>
                  <div className="relative">
                    <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground">E-Mail</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="w-full p-3 bg-muted rounded-md border border-muted-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="deine@email.de"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="project" className="block text-sm font-medium mb-2 text-foreground">Was möchtest du bauen?</label>
                  <select 
                    id="project" 
                    className="w-full p-3 bg-muted rounded-md border border-muted-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Wähle ein Projekt...</option>
                    <option value="website">Website / Webapp</option>
                    <option value="app">Mobile App</option>
                    <option value="saas">SaaS Produkt</option>
                    <option value="ecommerce">E-Commerce</option>
                    <option value="other">Anderes</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2 text-foreground">Projektbeschreibung</label>
                  <textarea 
                    id="message" 
                    rows={5} 
                    className="w-full p-3 bg-muted rounded-md border border-muted-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Beschreibe kurz dein Projekt und deine Ziele..."
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="budget" className="block text-sm font-medium mb-2 text-foreground">Budget</label>
                  <select 
                    id="budget" 
                    className="w-full p-3 bg-muted rounded-md border border-muted-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Wähle ein Budget...</option>
                    <option value="small">5.000€ - 10.000€</option>
                    <option value="medium">10.000€ - 25.000€</option>
                    <option value="large">25.000€ - 50.000€</option>
                    <option value="enterprise">50.000€+</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="timeline" className="block text-sm font-medium mb-2 text-foreground">Zeitrahmen</label>
                  <select 
                    id="timeline" 
                    className="w-full p-3 bg-muted rounded-md border border-muted-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Wähle einen Zeitrahmen...</option>
                    <option value="asap">So schnell wie möglich</option>
                    <option value="1month">Innerhalb eines Monats</option>
                    <option value="3months">1-3 Monate</option>
                    <option value="flexible">Flexibel</option>
                  </select>
                </div>
                
                <div className="pt-4">
                  <button type="submit" className="w-full btn btn-primary group relative overflow-hidden">
                    <span className="relative z-10 flex items-center justify-center">
                      <span className="font-mono">npm run build-awesome-project</span>
                      <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity z-0" />
                  </button>
                </div>
                
                {/* Terminal dots decoration */}
                <div className="absolute -bottom-3 -right-3 flex space-x-1">
                  <div className="w-3 h-3 rounded-full bg-primary/50"></div>
                  <div className="w-3 h-3 rounded-full bg-primary/30"></div>
                  <div className="w-3 h-3 rounded-full bg-primary/10"></div>
                </div>
              </form>
            </motion.div>
            
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="space-y-8">
                <div className="bg-card p-6 rounded-lg border border-muted-foreground/10 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Spezifikationen</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Neue Projekte</h4>
                        <p className="text-sm text-muted-foreground">Wir bauen dein Produkt von Grund auf</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Optimierungen</h4>
                        <p className="text-sm text-muted-foreground">Wir verbessern deine bestehende Anwendung</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">MVP-Entwicklung</h4>
                        <p className="text-sm text-muted-foreground">Schnelle Umsetzung deiner Produktidee</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card p-6 rounded-lg border border-muted-foreground/10 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Direkte Kommunikation</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="text-muted-foreground">
                        <a href="mailto:info@wizard-dynamics.com" className="text-primary hover:underline">info@wizard-dynamics.com</a>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div className="text-muted-foreground">
                        <a href="tel:+4912345678" className="text-primary hover:underline">+49 123 456 789</a>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-5 rounded-lg border border-primary/20 bg-primary/5 shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-3">
                        <span className="font-medium text-foreground">Keine Angst vor unmöglichen Projekten.</span> Wir lieben technische Herausforderungen. Je schwieriger, desto besser.
                      </p>
                      <div className="font-mono text-xs text-primary-foreground">
                        <span className="text-muted-foreground">$</span> git commit -m "Challenge accepted"
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-card text-card-foreground py-12 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute bottom-0 left-0 w-full h-full">
            <svg className="absolute bottom-0 left-0 w-full h-full text-primary/10" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon points="0,100 100,0 100,100" fill="currentColor" />
            </svg>
          </div>
        </div>
        
        <div className="container relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="font-bold text-xl text-foreground flex items-center gap-2 mb-4">
                <span className="text-primary text-2xl">✦</span>
                <span>Wizard Dynamics</span>
              </div>
              <p className="text-muted-foreground mb-6">
                Digitale Produkte, die andere für unmöglich halten. Schneller, besser und effizienter als alles, was du bisher gesehen hast.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Services</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Webentwicklung</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">App-Entwicklung</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">UX/UI Design</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">SaaS-Produkte</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Rechtliches</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Impressum</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Datenschutz</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">AGB</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Quick-Start</h3>
              <div className="bg-muted rounded-md p-4 border border-muted-foreground/10">
                <p className="text-sm text-muted-foreground mb-3">
                  Bereit für dein nächstes Projekt? 
                </p>
                <a href="#contact" className="btn btn-primary w-full font-mono text-sm">
                  npm init project
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-muted-foreground/10 mt-12 pt-6 text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} <span className="text-primary">Wizard Dynamics</span> – Mit 🔥 in Deutschland entwickelt</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
