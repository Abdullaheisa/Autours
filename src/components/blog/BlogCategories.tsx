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
    <div className="mt-20 border-t border-gray-100 pt-12">
      <h3 className="text-2xl font-black text-gray-900 mb-8 text-center">Browse by Category</h3>
      <div className="flex flex-wrap justify-center gap-4">
        {categories.map((cat: any) => (
          <Link
            key={cat.id}
            href={`/blog?category_id=${cat.id}`}
            className="px-6 py-3 bg-white border-2 border-gray-100 rounded-2xl shadow-sm hover:border-primary hover:shadow-md transition-all font-bold text-gray-700 hover:text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {cat.title || cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
