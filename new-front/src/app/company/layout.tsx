import type { Metadata } from 'next';
import CompanyLayoutClient from './CompanyLayoutClient';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CompanyLayoutClient>{children}</CompanyLayoutClient>;
}
