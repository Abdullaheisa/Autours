import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { 
  Calendar, User, Clock, ArrowLeft, Eye 
} from 'lucide-react';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import ShareButtons from '@/components/blog/ShareButtons';
import { siteConfig } from '@/config/site';
import { getBlogImageUrl } from '@/utils/getImageUrl';
import { SERVER_API_BASE } from '@/config/api';

interface PageProps {
  params: Promise<{ slug: string }>;
}



export const revalidate = 3600;

async function getBlogBySlugOrId(slug: string) {
  try {
    let res = await fetch(`${SERVER_API_BASE}/blogs/slug/${slug}`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      res = await fetch(`${SERVER_API_BASE}/blogs/${slug}`, {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 3600 }
      });
    }

    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || json;
  } catch {
    return null;
  }
}

async function getRelatedPosts() {
  try {
    const res = await fetch(`${SERVER_API_BASE}/blogs/published`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 }
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

// 🚀 حل مشكلة اختفاء الوصف في جوجل
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogBySlugOrId(slug);
  
  const defaultDesc = 'Discover the latest travel tips, destination guides, and expert car rental insights from Autours. Stay informed and save more on your next trip.';

  if (!post) {
    return { 
      title: 'Post Not Found | Autours Blog',
      description: defaultDesc, // 🚀 تأمين الوصف حتى لو المقالة مش موجودة
    }; 
  }

  const safeDescription = (post.meta_description && post.meta_description.trim() !== '') 
    ? post.meta_description.trim() 
    : defaultDesc;
    
  const blogImg = getBlogImageUrl(post.image) || `${siteConfig.url}/og-image.jpg`;

  return {
    metadataBase: new URL(siteConfig.url),
    title: `${post.title} | Autours Blog`,
    description: safeDescription,
    keywords: post.tags ? post.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : undefined,
    alternates: {
      canonical: `/blog/${post.slug || post.id}`,
    },
    openGraph: {
      title: post.title,
      description: safeDescription,
      url: `/blog/${post.slug || post.id}`,
      type: 'article',
      publishedTime: post.created_at,
      authors: [post.author || 'Autours'],
      images: [
        {
          url: blogImg,
          width: 1200,
          height: 630,
          alt: post.image_alt_text || post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: safeDescription,
      images: [blogImg],
    },
  };
}

export default async function BlogPostDetail({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogBySlugOrId(slug);
  
  if (!post) notFound();

  const authorName = post.author || 'Autours';
  const publishDate = post.created_at ? new Date(post.created_at) : null;
  
  const formattedDate = publishDate ? publishDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown Date';
  const formattedTime = publishDate ? publishDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'Unknown Time';
  
  const viewsCount = post.views || post.views_count || post.view_count || 0;
  const blogImg = getBlogImageUrl(post.image);

  const allPosts = await getRelatedPosts();
  const relatedPosts = allPosts.filter((p: Record<string, any>) => p.slug !== slug).slice(0, 3);

  const safeDescription = (post.meta_description && post.meta_description.trim() !== '') 
    ? post.meta_description.trim() 
    : 'Expert car rental insights from Autours.';

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": blogImg ? [blogImg] : [],
    "datePublished": post.created_at,
    "dateModified": post.created_at,
    "author": {
      "@type": "Person",
      "name": authorName
    },
    "description": safeDescription, 
    "publisher": {
      "@type": "Organization",
      "name": "Autours"
    }
  };

  return (
    <main className="min-h-screen container bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

<div className="relative w-full h-[136px] md:h-[245px] lg:h-[328px] bg-gray-100 overflow-hidden shadow-inner border-b border-gray-100">
  {blogImg ? (
    <Image
      src={blogImg}
      alt={post.image_alt_text || post.title}
      fill
      sizes="100vw"
      quality={85}
      // object-contain هتضمن إن الصورة تظهر بالكامل من غير ما تتقص في التلات مقاسات
      className="object-contain" 
      priority={true}
      fetchPriority="high"
    />
  ) : (
    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
      No Featured Image
    </div>
  )}
</div>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
        <div className="mb-5">
          <Link href="/blog" className="inline-flex items-center gap-2 text-gray-700 font-bold text-sm uppercase tracking-wider hover:text-gray-900 transition-all focus:outline-none focus:underline">
            <ArrowLeft size={16} className="text-primary" aria-hidden="true" /> Back to Blog
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          <article className="lg:col-span-8 space-y-6">
            <header className="space-y-4">
              <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                {post.title}
              </h1>
              
              {/* 🚀 Contrast Fix: text-gray-500 -> text-gray-600 */}
              <div className="flex flex-wrap items-center gap-6 text-gray-600 border-b border-gray-100 pb-5">
                <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider">
                  <User size={15} className="text-primary" aria-hidden="true" /> By {authorName}
                </div>
                <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider">
                  <Calendar size={15} className="text-primary" aria-hidden="true" /> {formattedDate}
                </div>
                <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider">
                  <Clock size={15} className="text-primary" aria-hidden="true" /> {formattedTime}
                </div>
                <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider">
                  <Eye size={15} className="text-primary" aria-hidden="true" /> {viewsCount} Views
                </div>
              </div>
            </header>

            <ShareButtons url={`${siteConfig.url}/blog/${post.slug || post.id}`} title={post.title} />

            <div 
              className="prose prose-base max-w-none text-gray-800 leading-relaxed space-y-4
                prose-headings:font-black prose-headings:text-gray-900 
                prose-strong:font-bold prose-strong:text-gray-900 
                [!&_*]:font-inherit"
              dangerouslySetInnerHTML={{ __html: post.content || '' }}
            />

            {/* Dynamic SEO Tag Badges */}
            {post.tags && post.tags.trim() !== '' && (
              <div className="mt-10 pt-6 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Related Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean).map((tag: string) => (
                    <span key={tag} className="px-3.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl border border-gray-200/60 shadow-sm cursor-pointer transition-all hover:scale-105 active:scale-95 duration-200">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>

          <aside className="lg:col-span-4 space-y-8">
            <div className="p-6 bg-gray-900 rounded-2xl shadow-xl">
              <h2 className="text-md font-black text-white mb-4">Search Articles</h2>
              <form action="/blog" method="GET" className="relative">
                <label htmlFor="blog-search-sidebar" className="sr-only">Search keywords</label>
                <input 
                  id="blog-search-sidebar"
                  type="text" 
                  name="search"
                  placeholder="Keywords..." 
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary text-sm" 
                />
              </form>
            </div>

            <div className="p-6 border border-gray-100 rounded-2xl">
              <h2 className="text-md font-black text-gray-900 mb-4 border-b border-gray-100 pb-2">Related Articles</h2>
              <div className="space-y-4">
                {relatedPosts.map((rp: any) => (
                  <Link key={rp.id} href={`/blog/${rp.slug || rp.id}`} className="flex gap-3 group focus:outline-none focus:ring-2 focus:ring-primary rounded-xl">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-50">
                      {getBlogImageUrl(rp.image) && (
                        <Image 
                          src={getBlogImageUrl(rp.image)!} 
                          alt={rp.image_alt_text || rp.title}
                          fill 
                          sizes="4rem"
                          quality={70}
                          className="object-cover transition-transform group-hover:scale-110" 
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors mb-1">{rp.title}</h3>
                      {/* 🚀 Contrast Fix: text-gray-500 -> text-gray-600 */}
                      <span className="text-[10px] font-bold text-gray-600">{rp.created_at ? new Date(rp.created_at).toLocaleDateString() : ''}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </main>
  );
}