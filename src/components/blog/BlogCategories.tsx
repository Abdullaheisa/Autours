'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CLIENT_API_BASE } from '@/config/api';

export default function BlogCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${CLIENT_API_BASE}/blog-categories`, {
          headers: { 'Accept': 'application/json' },
        });
        if (res.ok) {
          const json = await res.json();
          // Adjust based on typical Laravel response format
          setCategories(json?.data || json || []);
        }
      } catch (err) {
        console.error('Failed to fetch categories', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return null;
  if (!categories || categories.length === 0) return null;

  return (
    <div className="p-6 border border-gray-100 rounded-2xl bg-white shadow-sm mt-8">
      <h2 className="text-md font-black text-gray-900 mb-4 border-b border-gray-100 pb-2">Browse Categories</h2>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat: any) => (
          <Link
            key={cat.id}
            href={`/blog?category_id=${cat.id}`}
            className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-xs font-bold text-gray-700 hover:text-primary-800"
          >
            {cat.title || cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
