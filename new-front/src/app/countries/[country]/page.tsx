import { notFound } from 'next/navigation';
import { countryPagesData, CountryPageData } from '@/data/countryPages';
import CountryPageContent from './components/CountryPageContent';
import { features } from '@/config/features';
import { SERVER_API_BASE } from '@/config/api';

async function fetchCountryFromApi(slug: string): Promise<CountryPageData | null> {
  try {
    const res = await fetch(`${SERVER_API_BASE}/country-pages/slug/${slug}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success || !json.data) return null;

    const d = json.data;
    return {
      slug: d.slug,
      name: d.name,
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
      cities: d.cities || [],
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

export async function generateMetadata(props: { params: Promise<{ country: string }> }) {
  if (!features.countryPages) return { title: 'Page Not Found' };

  const params = await props.params;
  const slug = params.country.toLowerCase();

  const apiData = await fetchCountryFromApi(slug);
  const data = apiData || countryPagesData[slug];

  if (!data) return { title: 'Country Not Found' };

  return {
    title: `Car Rental in ${data.name} | Autours`,
    description: data.heroLead,
  };
}

export default async function CountryPage(props: { params: Promise<{ country: string }> }) {
  if (!features.countryPages) {
    notFound();
  }

  const params = await props.params;
  const slug = params.country.toLowerCase();

  let data = await fetchCountryFromApi(slug);

  if (!data) {
    // Fallback to static data
    const staticData = countryPagesData[slug];
    if (staticData) {
      data = { ...staticData };
      // Attempt to load published cities matching this country
      try {
        const cityRes = await fetch(`${SERVER_API_BASE}/city-pages/published`, { cache: 'no-store' });
        if (cityRes.ok) {
          const cityJson = await cityRes.json();
          const allCities = cityJson.data || [];
          data.cities = allCities.filter(
            (c: any) =>
              c.country_slug?.toLowerCase() === slug ||
              c.country?.toLowerCase() === staticData.name.toLowerCase()
          );
        }
      } catch {
        data.cities = [];
      }
    }
  }

  if (!data) {
    notFound();
  }

  return <CountryPageContent data={data} />;
}
