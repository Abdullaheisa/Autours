import { Metadata } from 'next';
import Image from 'next/image';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import { siteConfig } from '@/config/site';
import { assets } from '@/config/assets';
import { SERVER_API_BASE } from '@/config/api';

// Use the new Client Components
import BlogContent from '@/components/blog/BlogContent';
import BlogSearchForm from '@/components/blog/BlogSearchForm';
import BlogCategories from '@/components/blog/BlogCategories';

// This function fetches the initial (default) blog posts at build time (or via ISR)
async function getInitialBlogPosts() {
  try {
    // 🚀 Fetch exactly 8 posts for the first page to ensure fast LCP and accurate pagination
    const queryPath = `${SERVER_API_BASE}/blogs/published?per_page=8&page=1`;
    const res = await fetch(queryPath, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 }, // Enable ISR
    });

    if (!res.ok) return null;
    const json = await res.json();
    // Return the full pagination object so the client component knows total pages
    return json?.data || null;
  } catch {
    return null;
  }
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: 'Autours Blog | Travel Tips, Destination Guides, and Car Rental Insights',
  description: 'Discover the latest travel tips, destination guides, and expert car rental insights from Autours. Stay informed and save more on your next trip.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Autours Blog | Travel Tips, Destination Guides, and Car Rental Insights',
    description: 'Discover the latest travel tips, destination guides, and expert car rental insights from Autours. Stay informed and save more on your next trip.',
    url: '/blog',
    type: 'website',
    images: [
      {
        url: `${siteConfig.url}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Autours Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Autours Blog | Travel Tips, Destination Guides, and Car Rental Insights',
    description: 'Discover the latest travel tips, destination guides, and expert car rental insights from Autours. Stay informed and save more on your next trip.',
    images: [`${siteConfig.url}/og-image.jpg`],
  },
};

export default async function BlogPage() {
  // Fetch initial posts without any search params so this page can be statically generated
  const initialData = await getInitialBlogPosts();
  const initialPosts = initialData?.data || [];
  const initialPagination = {
    current_page: initialData?.current_page || 1,
    last_page: initialData?.last_page || 1,
    total: initialData?.total || initialPosts.length
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Autours Blog",
    "description": "Travel tips, destination guides, and expert car rental insights.",
    "url": `${siteConfig.url}/blog`,
  };

  return (
    <main className="min-h-screen bg-[#fcfcfc]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-gray-900">
        <div className="absolute inset-0 z-0">
          <Image
            src={assets.hero.background}
            alt="Autours Blog Hero Background"
            fill
            sizes="100vw"
            quality={85}
            priority={true} // LCP optimization
            fetchPriority="high"
            className="absolute inset-0 object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-900 to-gray-900" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Autours Blog
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Discover travel tips, destination guides, and car rental insights to make your next journey unforgettable.
          </p>

          {/* Client-side Search Form wrapped in Suspense */}
          <BlogSearchForm />
        </div>
      </section>

      {/* Blog Grid */}
      <section className="max-w-7xl mx-auto px-4 -mt-16 pb-20 relative z-20">
        {/* Client-side Blog Content wrapped in Suspense */}
        <BlogContent initialPosts={initialPosts} initialPagination={initialPagination} />

        {/* 🚀 New Categories Section */}
        <BlogCategories />
      </section>

      <Footer />
    </main>
  );
}
