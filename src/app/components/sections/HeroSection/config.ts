import { DefaultHero, ProductHero, EventHero, MinimalHero } from './variants';

export interface HeroConfig {
  variant: 'default' | 'product' | 'event' | 'minimal';
  props?: {
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    imageSrc?: string;
    imageAlt?: string;
    backgroundColor?: string;
  };
}

export const heroVariants = {
  default: DefaultHero,
  product: ProductHero,
  event: EventHero,
  minimal: MinimalHero,
};

export const getHeroComponent = (config: HeroConfig) => {
  const Component = heroVariants[config.variant];
  return Component;
};

export default getHeroComponent; 