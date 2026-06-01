'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

function BlogSearchFormInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState('');

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search.trim()) {
      params.set('search', search.trim());
    } else {
      params.delete('search');
    }
    router.push(`/blog?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="max-w-2xl mx-auto relative group">
      <label htmlFor="blog-search" className="sr-only">Search articles</label>
      <input
        id="blog-search"
        type="text"
        name="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search articles..."
        className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl py-5 px-6 pl-14 text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary transition-all"
      />
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={24} aria-hidden="true" />
      <button type="submit" aria-label="Submit search" className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-gray-900 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-300 transition-colors">
        Search
      </button>
    </form>
  );
}

export default function BlogSearchForm() {
  return (
    <Suspense fallback={<div className="h-16 w-full max-w-2xl mx-auto bg-white/10 animate-pulse rounded-2xl border border-white/20"></div>}>
      <BlogSearchFormInner />
    </Suspense>
  );
}
