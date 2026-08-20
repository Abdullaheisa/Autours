'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, ListFilter } from 'lucide-react';
import { CLIENT_API_BASE } from '@/config/api';

function BlogSearchFormInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCategoryId(searchParams.get('category_id') || '');
  }, [searchParams]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${CLIENT_API_BASE}/api/blog-categories/active`, {
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          const json = await res.json();
          setCategories(json?.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (search.trim()) {
      params.set('search', search.trim());
    } else {
      params.delete('search');
    }

    if (categoryId) {
      params.set('category_id', categoryId);
    } else {
      params.delete('category_id');
    }

    router.push(`/blogs?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="max-w-3xl mx-auto flex flex-col md:flex-row gap-3">
      <div className="relative group flex-1">
        <label htmlFor="blog-search" className="sr-only">Search articles</label>
        <input
          id="blog-search"
          type="text"
          name="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search articles..."
          className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl py-4 px-6 pl-12 text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary transition-all"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} aria-hidden="true" />
      </div>

      <div className="relative group md:w-48 shrink-0">
        <label htmlFor="category-select" className="sr-only">Select Category</label>
        <select
          id="category-select"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full h-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl py-4 px-4 pl-10 text-white appearance-none outline-none focus:ring-2 focus:ring-primary transition-all [&>option]:text-gray-900"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.title}</option>
          ))}
        </select>
        <ListFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} aria-hidden="true" />
      </div>

      <button type="submit" aria-label="Submit search" className="bg-primary text-gray-900 px-8 py-4 rounded-2xl font-black text-sm hover:bg-primary-300 transition-colors shadow-lg hover:scale-105 active:scale-95 shrink-0">
        Search
      </button>
    </form>
  );
}

export default function BlogSearchForm() {
  return (
    <Suspense fallback={<div className="h-14 w-full max-w-2xl mx-auto bg-white/10 animate-pulse rounded-2xl border border-white/20"></div>}>
      <BlogSearchFormInner />
    </Suspense>
  );
}
