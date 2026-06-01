import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Calendar, User, ArrowRight } from 'lucide-react';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import { siteConfig } from '@/config/site';
import { getBlogImageUrl } from '@/utils/getImageUrl';
import { assets } from '@/config/assets';
import { SERVER_API_BASE } from '@/config/api';

interface PageProps {
  searchParams: Promise<{ search?: string; category_id?: string }>;
}

async function getBlogPosts(search?: string, categoryId?: string) {
  try {
    let queryPath = `${SERVER_API_BASE}/blogs/published?per_page=15`;

    if (search && search.trim() !== '') queryPath += `&search=${encodeURIComponent(search.trim())}`;
    if (categoryId) queryPath += `&category_id=${categoryId}`;

    const res = await fetch(queryPath, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.data || [];
  } catch {
    return [];
  }
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: 'Autours Blog | Travel Tips, Destination Guides, and Car Rental Insights',
  description: 'Discover the latest travel tips, destination guides, and expert car rental insights from Autours. Stay informed and save more on your next trip.',
  alternates: {
    canonical: '/blog',
  },
};

export default async function BlogPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const currentSearch = resolvedParams.search || '';
  const currentCategory = resolvedParams.category_id || '';

  const allPosts = await getBlogPosts(currentSearch, currentCategory);
  const posts = allPosts.slice(0, 12);

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
            width={1920}
            height={1080}
            quality={75}
            priority={true}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
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

          <form action="/blog" method="GET" role="search" className="max-w-2xl mx-auto relative group">
            <label htmlFor="blog-search" className="sr-only">Search articles</label>
            <input
              id="blog-search"
              type="text"
              name="search"
              defaultValue={currentSearch}
              placeholder="Search articles..."
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl py-5 px-6 pl-14 text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary transition-all"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={24} aria-hidden="true" />
            <button type="submit" aria-label="Submit search" className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-gray-900 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-300 transition-colors">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="max-w-7xl mx-auto px-4 -mt-16 pb-20 relative z-20">
        {posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100 shadow-xl">
            <p className="text-base font-bold text-gray-500">No articles found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post: any, index: number) => {
              const blogImgUrl = getBlogImageUrl(post.image);
              const categoryTitle = post.blog_category?.title || 'Blog';

              return (
                <article 
                  key={post.id}
                  className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-500 group flex flex-col"
                >
                  <Link 
                    href={`/blog/${post.slug || post.id}`} 
                    className="block relative h-64 overflow-hidden focus:outline-none focus:ring-4 focus:ring-primary"
                    aria-label={`Read full article: ${post.title}`} 
                  >
                    {blogImgUrl ? (
                      <Image
                        src={blogImgUrl}
                        alt={post.image_alt_text || post.title}
                        width={600}
                        height={400}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        quality={75}
                        priority={index === 0} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-sm">No Image</div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-primary text-gray-900 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                        {categoryTitle}
                      </span>
                    </div>
                  </Link>

                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <Calendar size={14} className="text-primary" aria-hidden="true" />
                        {post.created_at ? new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                      </div>
                    </div>

                    <Link href={`/blog/${post.slug || post.id}`} className="focus:outline-none focus:underline" aria-hidden="true" tabIndex={-1}>
                      <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4 line-clamp-2 hover:text-primary transition-colors leading-tight">
                        {post.title}
                      </h2>
                    </Link>

                    <p className="text-sm text-gray-500 mb-8 line-clamp-3 leading-relaxed">
                      {post.meta_description || post.excerpt || ''}
                    </p>

                    <div className="mt-auto">
                      <Link 
                        href={`/blog/${post.slug || post.id}`}
                        className="inline-flex items-center gap-2 text-sm font-black text-gray-900 uppercase tracking-widest hover:gap-3 transition-all focus:outline-none focus:text-primary"
                      >
                        Read More 
                        <span className="sr-only">about {post.title}</span> 
                        <ArrowRight size={16} strokeWidth={3} className="text-primary" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
