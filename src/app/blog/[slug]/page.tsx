import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { 
  Calendar, User, Clock, Share2, Facebook, Twitter, 
  Linkedin, ArrowLeft, ArrowRight, CheckCircle2 
} from 'lucide-react';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import { blogPosts } from '@/data/blog';
import ShareButtons from '@/components/blog/ShareButtons';
import { siteConfig } from '@/config/site';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// SEO: Generate dynamic metadata for SSR
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  
  if (!post) return { title: 'Post Not Found' };

  return {
    title: `${post.title} | Autours Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image],
      type: 'article',
      publishedTime: post.date,
      authors: [post.author.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}

export default async function BlogPostDetail({ params }: PageProps) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  
  if (!post) notFound();

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": post.image,
    "datePublished": post.date,
    "author": {
      "@type": "Person",
      "name": post.author.name
    },
    "description": post.excerpt
  };

  const relatedPosts = blogPosts.filter(p => p.id !== post.id).slice(0, 3);

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      {/* Article Hero */}
      <header className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-6 hover:translate-x-1 transition-transform"
          >
            <ArrowLeft size={16} /> Back to Blog
          </Link>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-8 tracking-tight leading-[1.1]">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-white/80">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Calendar size={18} className="text-primary" />
              {post.date}
            </div>
            <div className="flex items-center gap-2 font-bold text-sm">
              <User size={18} className="text-primary" />
              By {post.author.name}
            </div>
            <div className="flex items-center gap-2 font-bold text-sm">
              <Clock size={18} className="text-primary" />
              {post.readingTime}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Main Content */}
          <article className="lg:col-span-8">
            {/* Share Buttons - Now before the article content */}
            <ShareButtons 
              url={`${siteConfig.url}/blog/${post.slug}`} 
              title={post.title} 
            />

            {/* Article Content */}
            <div 
              className="prose prose-lg max-w-none prose-headings:font-black prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600 prose-strong:text-gray-900 prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-a:text-primary-600 prose-a:font-bold hover:prose-a:text-primary-700"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Author Section */}
            <section className="mt-20 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row items-center gap-8">
              <div className="relative w-24 h-24 rounded-full overflow-hidden shrink-0 ring-4 ring-white shadow-xl">
                <Image
                  src={post.author.image || 'https://i.pravatar.cc/150?u=waleed'}
                  alt={post.author.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-center md:text-left">
                <p className="text-xs font-black text-primary-600 uppercase tracking-widest mb-1">About Author</p>
                <h3 className="text-xl font-black text-gray-900 mb-2">{post.author.name}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
                  {post.author.name} is a senior travel writer and car rental expert at Autours, specializing in the Middle East region with over 10 years of experience.
                </p>
                <div className="flex justify-center md:justify-start gap-4 mt-4">
                  {[Facebook, Twitter, Linkedin].map((Icon, i) => (
                    <Link key={i} href="#" className="text-gray-400 hover:text-primary transition-colors">
                      <Icon size={18} />
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-12">
            {/* Search */}
            <div className="p-8 bg-gray-900 rounded-[2rem] shadow-2xl">
              <h4 className="text-lg font-black text-white mb-6">Search Articles</h4>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Keywords..."
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3.5 px-5 text-white outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                  <Search size={16} className="text-gray-900" />
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="p-8 border border-gray-100 rounded-[2rem]">
              <h4 className="text-lg font-black text-gray-900 mb-6 border-b border-gray-100 pb-4">Categories</h4>
              <ul className="space-y-4">
                {['Best Agencies', 'Money Saving Tips', 'Car Reviews', 'Country Travel Guides'].map((cat) => (
                  <li key={cat}>
                    <Link href="#" className="flex items-center justify-between text-sm font-bold text-gray-500 hover:text-primary-600 transition-colors group">
                      {cat}
                      <span className="w-6 h-6 bg-gray-50 rounded flex items-center justify-center text-[10px] group-hover:bg-primary/10 transition-colors">12</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recent Posts */}
            <div className="p-8 border border-gray-100 rounded-[2rem]">
              <h4 className="text-lg font-black text-gray-900 mb-6 border-b border-gray-100 pb-4">Related Articles</h4>
              <div className="space-y-6">
                {relatedPosts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="flex gap-4 group">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                      <Image src={post.image} alt={post.title} fill className="object-cover transition-transform group-hover:scale-110" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors mb-1">
                        {post.title}
                      </h5>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{post.date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* You May Also Like Section */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight italic">You May Also Like</h2>
            <div className="flex gap-3">
              <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-white hover:shadow-lg transition-all text-gray-400 hover:text-gray-900">
                <ArrowLeft size={20} />
              </button>
              <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-white hover:shadow-lg transition-all text-gray-400 hover:text-gray-900">
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedPosts.map((post) => (
              <article key={post.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 group">
                <Link href={`/blog/${post.slug}`} className="block relative h-48">
                  <Image src={post.image} alt={post.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                </Link>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-3">
                    <Calendar size={12} /> {post.date}
                  </div>
                  <h3 className="text-lg font-black text-gray-900 line-clamp-2 mb-4 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-xs font-black text-gray-900 uppercase tracking-widest hover:gap-3 transition-all">
                    Read Post <ArrowRight size={14} className="text-primary" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Search(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}
