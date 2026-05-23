import { notFound } from 'next/navigation';
import { countryPagesData } from '@/data/countryPages';
import CountryPageContent from './components/CountryPageContent';
import { features } from '@/config/features';

export async function generateMetadata(props: { params: Promise<{ country: string }> }) {
  // Feature-flagged — return minimal metadata when disabled
  if (!features.countryPages) return { title: 'Page Not Found' };

  const params = await props.params;
  const data = countryPagesData[params.country.toLowerCase()];
  if (!data) return { title: 'Country Not Found' };

  return {
    title: `Car Rental in ${data.name} | Autours`,
    description: data.heroLead,
  };
}

export default async function CountryPage(props: { params: Promise<{ country: string }> }) {
  // 🚩 Feature flag gate — returns 404 when disabled. Code is fully preserved.
  if (!features.countryPages) {
    notFound();
  }

  const params = await props.params;
  const data = countryPagesData[params.country.toLowerCase()];

  if (!data) {
    notFound();
  }

  return <CountryPageContent data={data} />;
}
