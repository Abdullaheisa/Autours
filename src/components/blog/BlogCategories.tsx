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
        const res = await fetch(`${CLIENT_API_BASE}/api/blog-categories`, {
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
    <div className="p-6 border border-primary rounded-xl bg-white shadow-sm mt-8">
      <h2 className="text-lg font-black text-gray-900 mb-4 pb-2 border-b-2 border-primary inline-block min-w-[50%]">
        Category
      </h2>
      <div className="flex flex-col gap-4 mt-2">
        {categories.map((cat: any) => (
          <Link
            key={cat.id}
            href={`/blog?category_id=${cat.id}`}
            className="flex items-center gap-3 group"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 transition-transform group-hover:scale-125"></span>
            <span className="text-sm font-medium text-gray-800 group-hover:text-primary transition-colors">
              {cat.title || cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
