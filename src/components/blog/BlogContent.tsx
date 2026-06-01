'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { getBlogImageUrl } from '@/utils/getImageUrl';
import { CLIENT_API_BASE } from '@/config/api';

function BlogListInner({ initialPosts }: { initialPosts: any[] }) {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';
  const category_id = searchParams.get('category_id') || '';

  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!search && !category_id) {
      setPosts(initialPosts);
      return;
    }

    const fetchPosts = async () => {
      setLoading(true);
      try {
        let queryPath = `${CLIENT_API_BASE}/blogs/published?per_page=15`;
        if (search) queryPath += `&search=${encodeURIComponent(search)}`;
        if (category_id) queryPath += `&category_id=${category_id}`;

        const res = await fetch(queryPath, {
          headers: { 'Accept': 'application/json' },
        });
        if (res.ok) {
          const json = await res.json();
          setPosts((json?.data?.data || []).slice(0, 12));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [search, category_id, initialPosts]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100 shadow-xl">
        <p className="text-base font-bold text-gray-500">No articles found matching your criteria.</p>
      </div>
    );
  }

  return (
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
                  quality={60}
                  loading={index === 0 ? "eager" : "lazy"}
                  priority={index === 0}
                  fetchPriority={index === 0 ? "high" : "auto"}
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
  );
}

export default function BlogContent({ initialPosts }: { initialPosts: any[] }) {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
      <BlogListInner initialPosts={initialPosts} />
    </Suspense>
  );
}
