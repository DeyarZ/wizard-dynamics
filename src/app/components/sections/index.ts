// Basic section components
export { default as HeroSection } from './HeroSection/index';
export { default as ProductsSection } from './ProductsSection';
export { default as AboutSection } from './AboutSection';

// Hero variants
export { 
  DefaultHero,
  ProductHero,
  EventHero,
  MinimalHero 
} from './HeroSection/variants';

// Hero configuration
export { 
  getHeroComponent,
  type HeroConfig
} from './HeroSection/config';