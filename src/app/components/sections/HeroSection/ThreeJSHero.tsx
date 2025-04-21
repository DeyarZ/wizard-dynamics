"use client";

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Float, MeshDistortMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Noise } from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';
import { Vector3, Group, Mesh, Object3D, ShaderMaterial } from 'three';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import * as THREE from 'three';

// Terminal component with blinking cursor and typing effect
const Terminal = ({ position = [0, 0, 0] as [number, number, number], rotation = [0, 0, 0] as [number, number, number], scale = [1, 1, 1] as [number, number, number] }) => {
  const termRef = useRef<Group>(null);
  const [currentLine, setCurrentLine] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [blinkCursor, setBlinkCursor] = useState(true);
  const [isReacting, setIsReacting] = useState(false);
  
  const terminalLines = useMemo(() => [
    "$ wizard --init new-product",
    "Initializing product development environment...",
    "Building innovation framework...",
    "Compiling technical expertise...",
    "Optimizing for maximum efficiency...",
    "Wizard product ready for deployment."
  ], []);
  
  const reactionLines = useMemo(() => [
    "$ detected --user-proximity",
    "Hello there, human!",
    "I'm the Wizard Terminal.",
    "I build the impossible.",
    "Want to see some magic?"
  ], []);

  useEffect(() => {
    const handleTerminalHover = () => {
      setIsReacting(true);
      setCurrentLine(0);
      setCharIndex(0);
      
      // Return to normal after showing reaction
      setTimeout(() => {
        setIsReacting(false);
        setCurrentLine(0);
        setCharIndex(0);
      }, 8000);
    };
    
    document.addEventListener('terminal-hover', handleTerminalHover);
    return () => {
      document.removeEventListener('terminal-hover', handleTerminalHover);
    };
  }, []);

  useFrame((state, delta) => {
    if (termRef.current) {
      // Subtle floating animation
      termRef.current.position.y += Math.sin(state.clock.elapsedTime) * 0.0005;
      termRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.03;
      
      // Add pulsing effect when reacting
      if (isReacting) {
        termRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.02;
        termRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.02;
      }
    }
    
    // Typing effect logic
    const currentLines = isReacting ? reactionLines : terminalLines;
    
    if (currentLine < currentLines.length) {
      if (charIndex < currentLines[currentLine].length) {
        const typingSpeed = 0.05;
        if (state.clock.elapsedTime % typingSpeed < delta) {
          setCharIndex(prev => prev + 1);
        }
      } else {
        if (state.clock.elapsedTime % 1.5 < delta) {
          setCurrentLine(prev => prev + 1);
          setCharIndex(0);
        }
      }
    }
    
    // Blinking cursor
    if (state.clock.elapsedTime % 0.5 < delta) {
      setBlinkCursor(prev => !prev);
    }
  });

  const visibleText = useMemo(() => {
    const lines = [];
    const currentLines = isReacting ? reactionLines : terminalLines;
    
    for (let i = 0; i < currentLine; i++) {
      lines.push(currentLines[i]);
    }
    if (currentLine < currentLines.length) {
      lines.push(currentLines[currentLine].substring(0, charIndex) + (blinkCursor ? '|' : ' '));
    }
    return lines.join('\n');
  }, [currentLine, charIndex, blinkCursor, terminalLines, reactionLines, isReacting]);

  return (
    <group position={position} rotation={rotation} scale={scale} ref={termRef}>
      <mesh>
        <boxGeometry args={[4, 2.2, 0.1]} />
        <meshStandardMaterial color="#000000" roughness={0.3} metalness={0.8} />
      </mesh>
      <Text
        position={[0, 0, 0.06]}
        fontSize={0.15}
        maxWidth={3.6}
        lineHeight={1.5}
        font="/fonts/fonts/ttf/JetBrainsMono-Regular.ttf"
        color={isReacting ? "#ff5bfc" : "#00ff00"}
        anchorX="center"
        anchorY="middle"
        material-toneMapped={false}
      >
        {visibleText}
      </Text>
    </group>
  );
};

// Floating hex code particles
const HexParticles = ({ count = 50 }) => {
  const particles = useRef<Array<Object3D | null>>([]);
  const hexCodes = ["0x", "1a", "2b", "3c", "4d", "5e", "6f", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
  
  const positions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 20;
      pos.push(new Vector3(x, y, z));
    }
    return pos;
  }, [count]);
  
  useFrame((state) => {
    particles.current.forEach((particle, i) => {
      if (!particle) return;
      
      // Move particles slowly upward
      particle.position.y += 0.01;
      
      // Reset position when it gets too high
      if (particle.position.y > 10) {
        particle.position.y = -10;
        particle.position.x = (Math.random() - 0.5) * 20;
        particle.position.z = (Math.random() - 0.5) * 20;
      }
      
      // Rotate slightly based on position
      particle.rotation.x = Math.sin(state.clock.elapsedTime * 0.1 + i) * 0.2;
      particle.rotation.y = Math.cos(state.clock.elapsedTime * 0.1 + i) * 0.2;
    });
  });
  
  return (
    <group>
      {positions.map((pos, i) => (
        <Text
          key={i}
          ref={(el) => (particles.current[i] = el)}
          position={pos}
          fontSize={0.3}
          color={i % 2 === 0 ? "#5bfcff" : "#ff5bfc"}
          font="/fonts/fonts/ttf/JetBrainsMono-Bold.ttf"
          material-toneMapped={false}
        >
          {hexCodes[Math.floor(Math.random() * hexCodes.length)]}
        </Text>
      ))}
    </group>
  );
};

// Dynamic 3D logo
const DynamicLogo = ({ position = [0, 0, 0] as [number, number, number] }) => {
  const groupRef = useRef<Group>(null);
  const sphereRef = useRef<Mesh>(null);
  const ringRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
    
    if (sphereRef.current) {
      // Pulsing effect
      sphereRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
    }
    
    if (ringRef.current) {
      // Rotating ring
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.5;
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.3;
    }
  });
  
  return (
    <group ref={groupRef} position={position}>
      {/* Central sphere */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <MeshDistortMaterial
          color="#5bfcff"
          roughness={0.1}
          metalness={0.8}
          distort={0.3}
          speed={2}
        />
      </mesh>
      
      {/* Orbiting ring */}
      <group ref={ringRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5, 0.05, 16, 100]} />
          <meshStandardMaterial color="#ff5bfc" emissive="#ff5bfc" emissiveIntensity={0.5} />
        </mesh>
      </group>
      
      {/* Smaller orbiting spheres */}
      {[0, 1, 2].map((idx) => (
        <Float
          key={idx}
          speed={2}
          rotationIntensity={1}
          floatIntensity={1}
          position={[
            Math.cos(idx * ((Math.PI * 2) / 3)) * 1.5,
            0,
            Math.sin(idx * ((Math.PI * 2) / 3)) * 1.5,
          ]}
        >
          <mesh>
            <sphereGeometry args={[0.2, 20, 20]} />
            <meshStandardMaterial color={idx % 2 === 0 ? "#5bfcff" : "#ff5bfc"} emissive={idx % 2 === 0 ? "#5bfcff" : "#ff5bfc"} emissiveIntensity={0.5} />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

// Glowing grid floor
const GridFloor = () => {
  const floorRef = useRef<Mesh>(null);
  
  useFrame((state) => {
    if (floorRef.current && floorRef.current.material instanceof ShaderMaterial) {
      // Subtle wave effect
      floorRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });
  
  // Custom shader for grid with glow
  const gridShader = useMemo(() => {
    return {
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color("#5bfcff") },
        uAccentColor: { value: new THREE.Color("#ff5bfc") }
      },
      vertexShader: `
        varying vec2 vUv;
        uniform float uTime;
        
        void main() {
          vUv = uv;
          vec3 pos = position;
          pos.z += sin(pos.x * 5.0 + uTime) * 0.05;
          pos.z += cos(pos.y * 5.0 + uTime) * 0.05;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float uTime;
        uniform vec3 uColor;
        uniform vec3 uAccentColor;
        
        float grid(vec2 st, float res) {
          vec2 grid = fract(st * res);
          return (step(0.98, grid.x) + step(0.98, grid.y));
        }
        
        void main() {
          // Main grid
          float mainGrid = grid(vUv, 10.0);
          
          // Secondary grid
          float secondaryGrid = grid(vUv, 50.0) * 0.5;
          
          // Pulse effect
          float pulse = sin(uTime * 0.5) * 0.5 + 0.5;
          
          // Color mixing based on position
          vec3 color = mix(uColor, uAccentColor, sin(vUv.x * 3.14159 + uTime * 0.2) * 0.5 + 0.5);
          
          // Final grid color with pulse
          vec3 finalColor = color * (mainGrid + secondaryGrid) * (0.5 + pulse * 0.5);
          
          gl_FragColor = vec4(finalColor, (mainGrid + secondaryGrid * 0.5) * 0.8);
        }
      `
    };
  }, []);
  
  return (
    <mesh ref={floorRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
      <planeGeometry args={[100, 100, 50, 50]} />
      <shaderMaterial
        attach="material"
        args={[gridShader]}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
};

// Interactive flying cubes
const FlyingCubes = ({ count = 10, mouseRef }: { count?: number, mouseRef: React.RefObject<{x: number, y: number}> }) => {
  const cubes = useRef<Array<Mesh | null>>([]);
  const { viewport } = useThree();
  
  // Generate initial positions
  const positions = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15
      ] as [number, number, number],
      rotation: [
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      ] as [number, number, number],
      scale: Math.random() * 0.5 + 0.2,
      speed: Math.random() * 0.3 + 0.1
    }));
  }, [count]);
  
  useFrame((state) => {
    cubes.current.forEach((cube, i) => {
      if (!cube) return;
      
      // Rotate cubes
      cube.rotation.x += positions[i].speed * 0.01;
      cube.rotation.y += positions[i].speed * 0.02;
      
      // Move cubes in a circular pattern
      const angle = state.clock.elapsedTime * positions[i].speed * 0.2;
      const radius = 5 + Math.sin(state.clock.elapsedTime * 0.2) * 2;
      
      cube.position.x = Math.cos(angle) * radius * (i % 3);
      cube.position.z = Math.sin(angle) * radius * (i % 3);
      cube.position.y = Math.sin(state.clock.elapsedTime * positions[i].speed) * 3;
      
      // Mouse interaction if mouseRef is provided
      if (mouseRef?.current) {
        const mouseInfluence = 0.05;
        cube.position.x += (mouseRef.current.x * viewport.width / 2) * mouseInfluence;
        cube.position.y += (mouseRef.current.y * viewport.height / 2) * mouseInfluence;
      }
    });
  });
  
  return (
    <group>
      {positions.map((props, i) => (
        <mesh
          key={i}
          ref={(el) => (cubes.current[i] = el)}
          position={props.position}
          rotation={props.rotation}
          scale={props.scale}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? "#5bfcff" : "#ff5bfc"}
            roughness={0.3}
            metalness={0.8}
            emissive={i % 2 === 0 ? "#5bfcff" : "#ff5bfc"}
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  );
};

// Camera controller with mouse movement
const CameraController = ({ mouseRef }: { mouseRef: React.RefObject<{x: number, y: number}> }) => {
  const { camera } = useThree();
  
  useFrame(() => {
    if (mouseRef?.current) {
      // Smooth camera movement following mouse
      camera.position.x += (mouseRef.current.x * 2 - camera.position.x) * 0.05;
      camera.position.y += (mouseRef.current.y * 1 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);
    }
  });
  
  return null;
};

// Scene setup with all components
const Scene = () => {
  const mouseRef = useRef<{x: number, y: number}>({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      };
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      <CameraController mouseRef={mouseRef} />
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5] as [number, number, number]} intensity={0.5} />
      <pointLight position={[-10, -10, -5] as [number, number, number]} color="#5bfcff" intensity={1} />
      <pointLight position={[10, -10, 5] as [number, number, number]} color="#ff5bfc" intensity={1} />
      
      <Terminal position={[0, 0.5, -2] as [number, number, number]} rotation={[0, 0, 0] as [number, number, number]} scale={[1, 1, 1] as [number, number, number]} />
      <DynamicLogo position={[3, 1, -1] as [number, number, number]} />
      <GridFloor />
      <HexParticles count={30} />
      <FlyingCubes count={15} mouseRef={mouseRef} />
      
      <EffectComposer>
        <Bloom 
          intensity={1.5}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
          kernelSize={KernelSize.LARGE}
        />
        <ChromaticAberration
          offset={[0.0005, 0.0005]}
          blendFunction={BlendFunction.NORMAL}
          radialModulation={true}
          modulationOffset={0.5}
        />
        <Noise
          opacity={0.05}
          blendFunction={BlendFunction.OVERLAY}
        />
      </EffectComposer>
    </>
  );
};

// 3D Code Matrix (für die rechte Seite)
const CodeMatrix = () => {
  const matrixRef = useRef<Group>(null);
  const codeLines = [
    "function build(product) {",
    "  const tech = product.needs;",
    "  const stack = chooseTech(tech);",
    "  const timeline = '1-Sprint';",
    "  return wizardDynamics.create({",
    "    product,",
    "    stack,",
    "    timeline,",
    "    excellence: true",
    "  });",
    "",
    "// 5 products. 1 year.",
    "// This is just the beginning."
  ];
  
  useFrame((state) => {
    if (matrixRef.current) {
      matrixRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });
  
  return (
    <group ref={matrixRef} position={[8, 0, -3] as [number, number, number]}>
      {codeLines.map((line, i) => (
        <Text
          key={i}
          position={[0, 2 - i * 0.3, 0] as [number, number, number]}
          fontSize={0.15}
          color={i === 0 || i === 10 || i === 11 || i === 12 ? "#ff5bfc" : "#5bfcff"}
          font="/fonts/fonts/ttf/JetBrainsMono-Regular.ttf"
          material-toneMapped={false}
          anchorX="left"
        >
          {line}
        </Text>
      ))}
    </group>
  );
};

// 3D Produkt Showcase für die rechte Seite
const ProductShowcase = () => {
  const products = [
    { name: "Product 1", position: [8, 3, 2] as [number, number, number], scale: 1.2 },
    { name: "Product 2", position: [10, 1, 0] as [number, number, number], scale: 0.9 },
    { name: "Product 3", position: [7, -1, 1] as [number, number, number], scale: 1 },
    { name: "Product 4", position: [9, -3, -1] as [number, number, number], scale: 0.8 },
    { name: "Product 5", position: [11, 0, 3] as [number, number, number], scale: 1.1 }
  ];
  
  return (
    <group>
      {products.map((product, i) => (
        <Float 
          key={i}
          speed={(i % 2) + 1}
          rotationIntensity={0.5}
          floatIntensity={0.8}
          position={product.position as [number, number, number]}
        >
          <mesh scale={product.scale}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial 
              color={i % 2 === 0 ? "#5bfcff" : "#ff5bfc"} 
              emissive={i % 2 === 0 ? "#5bfcff" : "#ff5bfc"}
              emissiveIntensity={0.3}
              wireframe={true}
            />
          </mesh>
          <Text
            position={[0, -0.8, 0] as [number, number, number]}
            fontSize={0.2}
            color="#ffffff"
            font="/fonts/fonts/ttf/JetBrainsMono-Bold.ttf"
            material-toneMapped={false}
            anchorX="center"
          >
            {product.name}
          </Text>
        </Float>
      ))}
    </group>
  );
};

// Magic Cursor Component
const MagicCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorGlowRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [cursorText, setCursorText] = useState("");
  const previousPos = useRef({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{id: number, color: string}>>([]);
  
  // Initialize particles once
  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < 15; i++) {
      newParticles.push({
        id: i,
        color: i % 2 === 0 ? 'bg-[#5bfcff]' : 'bg-[#ff5bfc]'
      });
    }
    setParticles(newParticles);
  }, []);
  
  useEffect(() => {
    const particleElements: HTMLDivElement[] = [];
    
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current && cursorGlowRef.current) {
        // Calculate movement speed for effects
        const speed = Math.sqrt(
          Math.pow(e.clientX - previousPos.current.x, 2) +
          Math.pow(e.clientY - previousPos.current.y, 2)
        );
        
        previousPos.current = { x: e.clientX, y: e.clientY };
        
        // Update main cursor position
        gsap.to(cursorRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.1,
          ease: "power1.out"
        });
        
        // Update glow effect with slight delay for trailing effect
        gsap.to(cursorGlowRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.15,
          ease: "power1.out",
          scale: 1 + Math.min(speed / 100, 0.5)
        });
        
        // Collect particle elements
        if (particleElements.length === 0 && particlesRef.current) {
          const elements = particlesRef.current.querySelectorAll('.cursor-particle');
          elements.forEach(el => {
            particleElements.push(el as HTMLDivElement);
          });
        }
        
        // Update particles
        particleElements.forEach((particle) => {
          if (particle) {
            // Calculate random offset for each particle
            const offset = {
              x: (Math.random() - 0.5) * 40 * (isHovering ? 1.5 : 1),
              y: (Math.random() - 0.5) * 40 * (isHovering ? 1.5 : 1)
            };
            
            gsap.to(particle, {
              x: e.clientX + offset.x,
              y: e.clientY + offset.y,
              duration: 0.5 + Math.random() * 0.5,
              ease: "power2.out",
              opacity: isHovering ? 0.7 : 0.3,
              scale: isHovering ? 1 + Math.random() : 0.5 + Math.random() * 0.5
            });
          }
        });
      }
    };
    
    const handleMouseDown = () => {
      setIsActive(true);
      
      // Pulse effect on click
      if (cursorGlowRef.current) {
        gsap.to(cursorGlowRef.current, {
          scale: 1.2,
          opacity: 0.7,
          duration: 0.2,
          ease: "power2.out",
          yoyo: true,
          repeat: 1
        });
      }
      
      // Scatter particles on click
      particleElements.forEach(particle => {
        if (particle) {
          const angle = Math.random() * Math.PI * 2;
          const distance = 50 + Math.random() * 50;
          
          gsap.to(particle, {
            x: `+=${Math.cos(angle) * distance}`,
            y: `+=${Math.sin(angle) * distance}`,
            opacity: 0,
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => {
              if (particle) {
                gsap.set(particle, { opacity: 0.3 });
              }
            }
          });
        }
      });
    };
    
    const handleMouseUp = () => {
      setIsActive(false);
    };
    
    const handleMouseOver = (e: MouseEvent) => {
      // Check if we're hovering over an interactive element
      const target = e.target as HTMLElement;
      const isInteractive = target.tagName === 'A' || target.tagName === 'BUTTON' || 
        target.closest('a') || target.closest('button');
      
      if (isInteractive) {
        setIsHovering(true);
        setCursorText(target.getAttribute('data-cursor-text') || "");
        
        // Magical effect when hovering interactive elements
        if (cursorRef.current) {
          gsap.to(cursorRef.current, {
            scale: 1.2,
            backgroundColor: "#ff5bfc",
            mixBlendMode: "overlay",
            duration: 0.2
          });
        }
        
        if (cursorGlowRef.current) {
          gsap.to(cursorGlowRef.current, {
            scale: 2,
            backgroundColor: "rgba(91, 252, 255, 0.2)",
            duration: 0.2
          });
        }
        
        // Add terminal response effect when hovering it
        if (target.closest('.terminal-interactive')) {
          document.dispatchEvent(new CustomEvent('terminal-hover'));
        }
      }
    };
    
    const handleMouseOut = () => {
      setIsHovering(false);
      setCursorText("");
      
      // Reset cursor
      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          scale: 1,
          backgroundColor: "#5bfcff",
          mixBlendMode: "normal",
          duration: 0.2
        });
      }
      
      if (cursorGlowRef.current) {
        gsap.to(cursorGlowRef.current, {
          scale: 1,
          backgroundColor: "rgba(255, 91, 252, 0.1)",
          duration: 0.2
        });
      }
    };
    
    // Hide default cursor
    document.body.style.cursor = 'none';
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    
    return () => {
      // Reset cursor and remove event listeners
      document.body.style.cursor = 'auto';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [isHovering, particles]);
  
  return (
    <>
      {/* Main cursor dot */}
      <div 
        ref={cursorRef}
        className="fixed top-0 left-0 w-4 h-4 rounded-full bg-[#5bfcff] z-[9999] pointer-events-none"
        style={{
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 10px rgba(91, 252, 255, 0.5)',
          transition: 'width 0.2s, height 0.2s, background-color 0.2s',
          willChange: 'transform',
          mixBlendMode: isActive ? 'difference' : 'normal'
        }}
      />
      
      {/* Cursor glow effect */}
      <div 
        ref={cursorGlowRef}
        className="fixed top-0 left-0 w-12 h-12 rounded-full bg-[rgba(255,91,252,0.1)] z-[9998] pointer-events-none"
        style={{
          transform: 'translate(-50%, -50%)',
          filter: 'blur(8px)',
          willChange: 'transform'
        }}
      />
      
      {/* Cursor particles */}
      <div ref={particlesRef} className="pointer-events-none">
        {particles.map((particle) => (
          <div 
            key={particle.id}
            className={`cursor-particle fixed top-0 left-0 rounded-full z-[9997] pointer-events-none ${particle.color}`}
            style={{
              width: 2 + Math.random() * 4,
              height: 2 + Math.random() * 4,
              opacity: 0.3,
              transform: 'translate(-50%, -50%)',
              willChange: 'transform'
            }}
          />
        ))}
      </div>
      
      {/* Cursor text */}
      {cursorText && (
        <div 
          className="fixed top-0 left-0 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-[10000] pointer-events-none"
          style={{
            transform: 'translate(10px, 10px)'
          }}
        >
          {cursorText}
        </div>
      )}
    </>
  );
};

export const ThreeJSHero = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Trigger entered view animation
    if (canvasRef.current) {
      gsap.from(canvasRef.current, {
        opacity: 0,
        duration: 1.5,
        ease: "power2.out"
      });
    }
  }, []);
  
  const handleInteraction = () => {
    // Handle interaction if needed
  };
  
  return (
    <div className="min-h-screen relative">
      {/* Experience Canvas */}
      <div 
        className="w-full h-screen absolute top-0 left-0 z-0 terminal-interactive"
        ref={canvasRef}
        onClick={handleInteraction}
        onMouseMove={handleInteraction}
        data-cursor-text="Interact with terminal"
      >
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 6], fov: 60 }}>
          <Scene />
          <CodeMatrix />
          <ProductShowcase />
        </Canvas>
      </div>
      
      {/* Magic Cursor */}
      <MagicCursor />
      
      {/* Content overlay */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center items-start px-8 md:px-16 lg:px-24">
        <motion.div 
          className="max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-8 tracking-tight leading-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8,
              delay: 0.8,
            }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#5bfcff] to-[#ff5bfc]">
              Wizard Dynamics
            </span>
            <span className="block">
              Code wird zur <span className="relative inline-block text-[#5bfcff]">
                Magie
                <span className="absolute -bottom-2 left-0 h-1 w-full bg-[#ff5bfc] z-0" />
              </span>
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-300 mb-8 max-w-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            Im Jahr 2024 gründeten zwei Entwickler ein Labor für digitalen Wahnsinn. Ihr Ziel: In einem Jahr das bauen, wofür andere Jahrzehnte brauchen.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
          >
            <a 
              href="#projects" 
              className="px-8 py-3 bg-gradient-to-r from-[#5bfcff] to-[#ff5bfc] text-black font-medium rounded-full text-lg hover:scale-105 transition-transform"
              data-cursor-text="Unsere Projekte"
            >
              <span className="relative z-10 flex items-center">
                Projekte entdecken
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </a>
            
            <a 
              href="#contact" 
              className="px-8 py-3 border border-[#5bfcff] text-white font-medium rounded-full text-lg hover:bg-[#5bfcff]/10 transition-colors"
              data-cursor-text="Lass uns gemeinsam bauen"
            >
              Lass uns reden
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ThreeJSHero; 