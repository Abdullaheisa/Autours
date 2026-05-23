import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Calendar, User, ArrowRight } from 'lucide-react';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';

export const metadata: Metadata = {
  title: 'Autours Blog | Travel Tips, Destination Guides, and Car Rental Insights',
  description: 'Discover the latest travel tips, destination guides, and expert car rental insights from Autours. Stay informed and save more on your next trip.',
  openGraph: {
    title: 'Autours Blog | Expert Car Rental & Travel Guides',
    description: 'Expert advice on car rentals and travel destinations in the UAE and beyond.',
    type: 'website',
  },
};

function getBlogImageUrl(image: string | undefined | null): string | null {
  if (!image) return null;
  if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/')) return image;
  return `https://www.autours.net/img/blogs/${image}`;
}

async function getBlogPosts() {
  try {
    const res = await fetch('https://www.autours.net/api/blogs/published', {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const wrapper = json?.data;
    if (Array.isArray(wrapper)) return wrapper;
    if (wrapper?.data && Array.isArray(wrapper.data)) return wrapper.data;
    return [];
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <main className="min-h-screen bg-[#fcfcfc]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-gray-900">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2000&auto=format&fit=crop"
            alt="Blog Hero"
            fill
            className="object-cover opacity-40"
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

          <div className="max-w-2xl mx-auto relative group">
            <input
              type="text"
              placeholder="Search articles..."
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl py-5 px-6 pl-14 text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary transition-all"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={24} />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-gray-900 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-300 transition-colors">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="max-w-7xl mx-auto px-4 -mt-16 pb-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post: any) => (
            <article 
              key={post.id}
              className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-500 group"
            >
              <Link href={`/blog/${post.slug}`} className="block relative h-64 overflow-hidden">
                {getBlogImageUrl(post.image) ? (
                  <Image
                    src={getBlogImageUrl(post.image)!}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
                <div className="absolute top-4 left-4">
                  <span className="bg-primary text-gray-900 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                    {post.blog_category?.title || (typeof post.category === 'string' ? post.category : post.category?.title) || 'Blog'}
                  </span>
                </div>
                <div className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 shadow-xl">
                  <ArrowRight size={20} className="text-gray-900" />
                </div>
              </Link>

              <div className="p-8">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                    <Calendar size={14} className="text-primary" />
                    {post.created_at ? new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                    <User size={14} className="text-primary" />
                    By: {post.author || 'Autours'}
                  </div>
                </div>

                <Link href={`/blog/${post.slug}`}>
                  <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4 line-clamp-2 hover:text-primary transition-colors leading-tight">
                    {post.title}
                  </h2>
                </Link>

                <p className="text-sm text-gray-500 mb-8 line-clamp-3 leading-relaxed">
                  {post.meta_description || post.excerpt || ''}
                </p>

                <Link 
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-black text-gray-900 uppercase tracking-widest hover:gap-3 transition-all"
                >
                  Read More <ArrowRight size={16} strokeWidth={3} className="text-primary" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
