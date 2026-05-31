import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Vehicles | Autours',
  description: 'Search and book premium rental cars, luxury vehicles, SUVs and sedans from top suppliers in the Middle East. Flexible options and transparent pricing.',
  keywords: ['rent a car', 'car rental search', 'luxury cars', 'rent car dubai', 'rent car egypt', 'rent car saudi arabia'],
  openGraph: {
    title: 'Search Vehicles | Autours',
    description: 'Search and book premium rental cars, luxury vehicles, SUVs and sedans from top suppliers in the Middle East. Flexible options and transparent pricing.',
    type: 'website',
  }
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
