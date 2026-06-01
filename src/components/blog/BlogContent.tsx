'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { getBlogImageUrl } from '@/utils/getImageUrl';
import { CLIENT_API_BASE } from '@/config/api';

function BlogListInner({ initialPosts, initialPagination }: { initialPosts: any[], initialPagination?: any }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const search = searchParams.get('search') || '';
  const category_id = searchParams.get('category_id') || '';
  const pageParam = searchParams.get('page') || '1';

  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: initialPagination?.current_page || parseInt(pageParam),
    last_page: initialPagination?.last_page || 1,
    total: initialPagination?.total || initialPosts.length
  });

  useEffect(() => {
    // If no search, no category, and page is 1, use initial posts
    if (!search && !category_id && pageParam === '1') {
      setPosts(initialPosts);
      setPagination({
        current_page: initialPagination?.current_page || 1,
        last_page: initialPagination?.last_page || 1,
        total: initialPagination?.total || initialPosts.length
      });
      return;
    }

    const fetchPosts = async () => {
      setLoading(true);
      try {
        let queryPath = `${CLIENT_API_BASE}/blogs/published?per_page=8&page=${pageParam}`;
        if (search) queryPath += `&search=${encodeURIComponent(search)}`;
        if (category_id) queryPath += `&category_id=${category_id}`;

        const res = await fetch(queryPath, {
          headers: { 'Accept': 'application/json' },
        });
        if (res.ok) {
          const json = await res.json();
          const meta = json?.data?.current_page ? json.data : (json?.current_page ? json : null);
          const dataArray = json?.data?.data || json?.data || [];

          if (meta) {
             setPosts(Array.isArray(dataArray) ? dataArray : []);
             setPagination({
               current_page: meta.current_page || 1,
               last_page: meta.last_page || Math.ceil((meta.total || dataArray.length) / 8) || 1,
               total: meta.total || dataArray.length
             });
          } else {
             // Fallback pagination if the API does not return proper pagination meta
             const currentPage = parseInt(pageParam) || 1;
             const isArray = Array.isArray(dataArray);
             setPosts(isArray ? dataArray.slice((currentPage - 1) * 8, currentPage * 8) : []);
             setPagination({
               current_page: currentPage,
               last_page: isArray ? Math.ceil(dataArray.length / 8) || 1 : 1,
               total: isArray ? dataArray.length : 0
             });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [search, category_id, pageParam, initialPosts]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/blog?${params.toString()}`);
    document.getElementById('blog-grid-top')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Ensure pagination array calculations are safe
  const safeLastPage = Math.max(1, pagination.last_page || 1);

  if (loading) {
    return (
      <div className="flex justify-center py-20 min-h-[400px]">
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
    <div id="blog-grid-top" className="scroll-mt-32">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {posts.map((post: any, index: number) => {
          const blogImgUrl = getBlogImageUrl(post.image);
          const categoryTitle = post.blog_category?.title || post.category?.title || 'Blog';

          return (
            <article
              key={post.id}
              className="bg-white rounded-[1.5rem] overflow-hidden border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 group flex flex-col"
            >
              <Link
                href={`/blog/${post.slug || post.id}`}
                className="block relative h-48 overflow-hidden focus:outline-none focus:ring-4 focus:ring-primary"
                aria-label={`Read full article: ${post.title}`}
              >
                {blogImgUrl ? (
                  <Image
                    src={blogImgUrl}
                    alt={post.image_alt_text || post.title}
                    width={400}
                    height={300}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    quality={60}
                    loading={index < 4 ? "eager" : "lazy"}
                    priority={index < 2}
                    fetchPriority={index < 2 ? "high" : "auto"}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-sm">No Image</div>
                )}
                {/* Category Badge on Image */}
                <div className="absolute top-3 left-3">
                  <span className="bg-primary/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                    {categoryTitle}
                  </span>
                </div>
              </Link>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500">
                    <Calendar size={12} className="text-primary" aria-hidden="true" />
                    {post.created_at ? new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                  </div>
                </div>

                <Link href={`/blog/${post.slug || post.id}`} className="focus:outline-none focus:underline" aria-hidden="true" tabIndex={-1}>
                  <h2 className="text-lg font-black text-gray-900 mb-3 line-clamp-2 hover:text-primary transition-colors leading-tight">
                    {post.title}
                  </h2>
                </Link>

                <p className="text-xs text-gray-500 mb-6 line-clamp-3 leading-relaxed">
                  {post.meta_description || post.excerpt || ''}
                </p>

                <div className="mt-auto">
                  <Link
                    href={`/blog/${post.slug || post.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-black text-gray-900 uppercase tracking-widest hover:gap-2 transition-all focus:outline-none focus:text-primary"
                  >
                    Read More
                    <span className="sr-only">about {post.title}</span>
                    <ArrowRight size={14} strokeWidth={3} className="text-primary" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {safeLastPage > 1 && (
        <div className="mt-16 flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(pagination.current_page - 1)}
            disabled={pagination.current_page === 1}
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            aria-label="Previous Page"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-1 mx-2">
            {Array.from({ length: safeLastPage }).map((_, i) => {
              const pageNumber = i + 1;
              if (
                safeLastPage <= 5 ||
                pageNumber === 1 ||
                pageNumber === safeLastPage ||
                Math.abs(pageNumber - pagination.current_page) <= 1
              ) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-primary shadow-sm ${
                      pagination.current_page === pageNumber
                        ? 'bg-primary text-gray-900 border-2 border-primary'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-primary hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              } else if (
                pageNumber === pagination.current_page - 2 ||
                pageNumber === pagination.current_page + 2
              ) {
                return <span key={pageNumber} className="text-gray-400 font-bold px-1">...</span>;
              }
              return null;
            })}
          </div>

          <button
            onClick={() => handlePageChange(pagination.current_page + 1)}
            disabled={pagination.current_page === safeLastPage}
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            aria-label="Next Page"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function BlogContent({ initialPosts, initialPagination }: { initialPosts: any[], initialPagination?: any }) {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
      <BlogListInner initialPosts={initialPosts} initialPagination={initialPagination} />
    </Suspense>
  );
}
