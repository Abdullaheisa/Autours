import { notFound } from 'next/navigation';
import { cityPagesData } from '@/data/cityPages';
import CityPageContent from './components/CityPageContent';
import { features } from '@/config/features';

export async function generateMetadata(props: { params: Promise<{ city: string }> }) {
  // Feature-flagged — return minimal metadata when disabled
  if (!features.cityPages) return { title: 'Page Not Found' };

  const params = await props.params;
  const data = cityPagesData[params.city.toLowerCase()];
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
  const data = cityPagesData[params.city.toLowerCase()];

  if (!data) {
    notFound();
  }

  return <CityPageContent data={data} />;
}
