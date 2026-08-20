import { notFound } from 'next/navigation';
import { cityPagesData, CityPageData } from '@/data/cityPages';
import CityPageContent from './components/CityPageContent';
import { features } from '@/config/features';

async function fetchCityFromApi(slug: string): Promise<CityPageData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const res = await fetch(`${baseUrl}/api/city-pages/slug/${slug}`, {
      next: { revalidate: 60 }, // cache for 60 seconds
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success || !json.data) return null;

    const d = json.data;
    // Map API response (snake_case) to CityPageData interface (camelCase)
    return {
      slug: d.slug,
      name: d.name,
      country: d.country,
      countrySlug: d.country_slug,
      heroBadge: d.hero_badge || '',
      heroTitle: d.hero_title,
      heroHighlight: d.hero_highlight,
      heroLead: d.hero_lead || '',
      heroBottomTitle: d.hero_bottom_title || '',
      travelInfo: d.travel_info || { title: '', subtitle: '', image: '', benefits: [] },
      steps: d.steps || [],
      documents: d.documents || { items: [] },
      highlights: d.highlights || undefined,
      faqs: d.faqs || [],
      partnersDescription: d.partners_description || undefined,
      ctaTitle: d.cta_title || undefined,
      ctaDescription: d.cta_description || undefined,
      ctaPrimaryText: d.cta_primary_text || undefined,
      ctaSecondaryText: d.cta_secondary_text || undefined,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata(props: { params: Promise<{ city: string }> }) {
  // Feature-flagged — return minimal metadata when disabled
  if (!features.cityPages) return { title: 'Page Not Found' };

  const params = await props.params;
  const slug = params.city.toLowerCase();

  // Try API first, then static fallback
  const apiData = await fetchCityFromApi(slug);
  const data = apiData || cityPagesData[slug];
  if (!data) return { title: 'City Not Found' };

  return {
    title: `Car Rental in ${data.name} | Autours`,
    description: data.heroLead,
  };
}

export default async function CityPage(props: { params: Promise<{ city: string }> }) {
  // 🚩 Feature flag gate — returns 404 when disabled. Code is fully preserved.
  if (!features.cityPages) {
    notFound();
  }

  const params = await props.params;
  const slug = params.city.toLowerCase();

  // Try API first, then static fallback
  const apiData = await fetchCityFromApi(slug);
  const data = apiData || cityPagesData[slug];

  if (!data) {
    notFound();
  }

  return <CityPageContent data={data} />;
}
