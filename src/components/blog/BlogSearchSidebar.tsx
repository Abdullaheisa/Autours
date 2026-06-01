'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function BlogSearchSidebarInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState('');

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) {
      params.set('search', search.trim());
    }
    router.push(`/blog?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <label htmlFor="blog-search-sidebar" className="sr-only">Search keywords</label>
      <input
        id="blog-search-sidebar"
        type="text"
        name="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Keywords..."
        className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary text-sm"
      />
    </form>
  );
}

export default function BlogSearchSidebar() {
  return (
    <div className="p-6 bg-gray-900 rounded-2xl shadow-xl">
      <h2 className="text-md font-black text-white mb-4">Search Articles</h2>
      <Suspense fallback={<div className="h-11 w-full bg-white/10 animate-pulse rounded-xl border border-white/20"></div>}>
        <BlogSearchSidebarInner />
      </Suspense>
    </div>
  );
}
