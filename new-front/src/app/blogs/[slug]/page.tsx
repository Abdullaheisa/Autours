import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Clock, User, Eye, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import ShareButtons from '@/components/blog/ShareButtons';
import { siteConfig } from '@/config/site';
import { getBlogImageUrl } from '@/utils/getImageUrl';
import { SERVER_API_BASE } from '@/config/api';
import BlogSearchSidebar from '@/components/blog/BlogSearchSidebar';
import BlogCategories from '@/components/blog/BlogCategories';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getBlogBySlugOrId(slug: string) {
  try {
    let res = await fetch(`${SERVER_API_BASE}/blogs/slug/${slug}`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 } // Enable ISR
    });

    if (!res.ok) {
      res = await fetch(`${SERVER_API_BASE}/blogs/${slug}`, {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 3600 } // Enable ISR
      });
    }

    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || json;
  } catch {
    return null;
  }
}

async function getRelatedPosts(categoryId?: number) {
  try {
    // If a category ID is provided, try to fetch related blogs for that category
    let endpoint = `${SERVER_API_BASE}/blogs/published`;
    if (categoryId) {
      // Trying to fetch by category first. Note: The backend endpoint /blog-categories/{id}/blogs is available
      // but might not be public/published only. For safety, we can use the main endpoint with a filter if supported
      endpoint = `${SERVER_API_BASE}/blogs/published?category_id=${categoryId}`;
    }

    const res = await fetch(endpoint, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 } // Enable ISR
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogBySlugOrId(slug);
  
  const defaultDesc = 'Discover the latest travel tips, destination guides, and expert car rental insights from Autours. Stay informed and save more on your next trip.';

  if (!post) {
    return { 
      title: 'Post Not Found | Autours Blog',
      description: defaultDesc,
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
      canonical: `/blogs/${post.slug || post.id}`,
    },
    openGraph: {
      title: post.title,
      description: safeDescription,
      url: `/blogs/${post.slug || post.id}`,
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
  const categoryTitle = post.category?.title || post.blog_category?.title || 'Blog';
  const categoryId = post.blog_category_id || post.blog_category?.id;

  // 🚀 Fetch related posts dynamically by category
  let relatedPosts = [];
  if (categoryId) {
     const categoryPosts = await getRelatedPosts(categoryId);
     relatedPosts = categoryPosts.filter((p: Record<string, any>) => p.slug !== slug && p.id !== post.id).slice(0, 3);
  }

  // Fallback if no related posts found in category
  if (relatedPosts.length === 0) {
     const allPosts = await getRelatedPosts();
     relatedPosts = allPosts.filter((p: Record<string, any>) => p.slug !== slug && p.id !== post.id).slice(0, 3);
  }

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
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="mb-5">
          <Link href="/blogs" className="inline-flex items-center gap-2 text-gray-700 font-bold text-sm uppercase tracking-wider hover:text-gray-900 transition-all focus:outline-none focus:underline">
            <ArrowLeft size={16} className="text-primary" aria-hidden="true" /> Back to Blog
          </Link>
        </div>

        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] lg:aspect-[3/1] bg-gray-50 rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 mb-10">
          {blogImg ? (
            <Image
              src={blogImg}
              alt={post.image_alt_text || post.title}
              fill
              sizes="100vw"
              quality={90}
              className="object-cover hover:scale-105 transition-transform duration-700"
              priority={true}
              fetchPriority="high"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl">
              No Featured Image
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <article className="lg:col-span-8 space-y-6">

            <header className="space-y-4">
              <div className="mb-2">
                <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-gray-200">
                  {categoryTitle}
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                {post.title}
              </h1>
              <div className="w-24 md:w-32 h-1.5 md:h-2 bg-primary rounded-full mb-6"></div>
              
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

            <ShareButtons url={`${siteConfig.url}/blogs/${post.slug || post.id}`} title={post.title} />

            <div 
              className="prose prose-base max-w-none text-gray-800 leading-relaxed space-y-4
                prose-headings:font-black prose-headings:text-gray-900 
                prose-strong:font-bold prose-strong:text-gray-900 
                prose-table:w-full prose-table:border-collapse prose-table:my-6
                prose-th:bg-gray-100 prose-th:border prose-th:border-gray-200 prose-th:p-3 prose-th:text-left
                prose-td:border prose-td:border-gray-200 prose-td:p-3
                [!&_*]:font-inherit overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: post.content || '' }}
            />

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

          <aside className="lg:col-span-4 space-y-6">
            <BlogSearchSidebar />
            <BlogCategories />

            {/* Related Articles */}
            {relatedPosts.length > 0 && (
              <div className="p-6 border border-gray-100 rounded-2xl bg-white shadow-sm">
                <h2 className="text-md font-black text-gray-900 mb-4 border-b border-gray-100 pb-2">Related Articles</h2>
                <div className="space-y-4">
                  {relatedPosts.map((rp: any) => (
                    <Link
                      key={rp.id}
                      href={`/blogs/${rp.slug || rp.id}`}
                      className="flex gap-3 group focus:outline-none focus:ring-2 focus:ring-primary rounded-xl"
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-50 border border-gray-100">
                        {getBlogImageUrl(rp.image) && (
                          <Image
                            src={getBlogImageUrl(rp.image)!}
                            alt={rp.image_alt_text || rp.title}
                            fill
                            sizes="4rem"
                            quality={70}
                            loading="lazy"
                            className="object-cover transition-transform group-hover:scale-110"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors mb-1 leading-snug">
                          {rp.title}
                        </h3>
                        <span className="text-[10px] font-bold text-gray-500">
                          {rp.created_at ? new Date(rp.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </aside>
        </div>
      </div>

      <Footer />
    </main>
  );
}
