import { assets } from '@/config/assets';

export interface CityPageData {
  slug: string;
  name: string;
  country: string;
  countrySlug: string;
  heroBadge: string;
  heroTitle: string;
  heroHighlight: string;
  heroLead: string;
  heroBottomTitle: string;
  travelInfo: {
    title: string;
    subtitle: string;
    benefits: {
      title: string;
      description: string;
    }[];
    image: string;
  };
  steps: {
    title: string;
    description: string;
  }[];
  documents: {
    items: string[];
  };
  faqs: {
    q: string;
    a: string;
  }[];
  highlights?: {
    title?: string;
    subtitle?: string;
    places: {
      name: string;
      description: string;
      image?: string;
      tags?: string[];
      attractions?: {
        name: string;
        description: string;
        image: string;
      }[];
    }[];
  };
  partnersDescription?: string;
  ctaTitle?: string;
  ctaDescription?: string;
  ctaPrimaryText?: string;
  ctaSecondaryText?: string;
}

export const cityPagesData: Record<string, CityPageData> = {};

export const getCitiesByCountrySlug = (countrySlug: string): CityPageData[] => {
  const normSlug = countrySlug.toLowerCase().replace(/_/g, '-');
  return Object.values(cityPagesData).filter(
    (c) => c.countrySlug.toLowerCase().replace(/_/g, '-') === normSlug
  );
};

export const getAllCityPages = (): CityPageData[] => Object.values(cityPagesData);

