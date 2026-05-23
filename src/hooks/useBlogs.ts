"use client";

import { useState, useCallback, useEffect } from "react";
import { blogApi } from "@/services/api";

export type BlogStatus = "published" | "draft" | "scheduled";

export interface Blog {
  id: number;
  title: string;
  slug?: string;
  excerpt: string;
  content?: string;
  author: string;
  authorAvatar: string;
  category: string;
  status: BlogStatus;
  date: string;
  time: string;
  image: string;
  publishDate?: string;
  publishTime?: string;
}

function mapApiBlog(raw: any): Blog {
  return {
    id: raw.id,
    title: raw.title || '',
    slug: raw.slug || '',
    excerpt: raw.meta_description || raw.excerpt || '',
    content: raw.content || '',
    author: raw.author || 'Autours',
    authorAvatar: (raw.author || 'A')[0].toUpperCase(),
    category: raw.blog_category?.title || raw.category || '',
    status: raw.is_published ? 'published' : 'draft',
    date: raw.created_at ? new Date(raw.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
    time: raw.created_at ? new Date(raw.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
    image: raw.image || '',
    publishDate: raw.publishDate,
    publishTime: raw.publishTime,
  };
}

export function useBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response: any = await blogApi.getAll();
        const wrapper = response?.data;
        let data: any[] = [];
        if (Array.isArray(wrapper)) data = wrapper;
        else if (wrapper?.data && Array.isArray(wrapper.data)) data = wrapper.data;
        else if (Array.isArray(response)) data = response;
        setBlogs(data.map(mapApiBlog));
      } catch (e: any) {
        console.error('[useBlogs] Error:', e);
        setError(e.message || 'Failed to fetch blogs');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const saveBlog = useCallback(async (data: Partial<Blog> & { id?: number }) => {
    setLoading(true);
    setError(null);
    try {
      if (data.id) {
        const response: any = await blogApi.update(data.id, data);
        const updated = mapApiBlog(response?.data || response || data);
        setBlogs((prev) => prev.map((b) => (b.id === data.id ? { ...b, ...updated } : b)));
      } else {
        const response: any = await blogApi.create(data);
        const created = mapApiBlog(response?.data || response || data);
        setBlogs((prev) => [created, ...prev]);
      }
    } catch (e: any) {
      setError(e.message || "Failed to save blog post.");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBlog = useCallback(async (id: number) => {
    try {
      await blogApi.delete(id);
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    } catch (e: any) {
      setError(e.message || "Failed to delete blog.");
    }
  }, []);

  return { blogs, loading, error, saveBlog, deleteBlog };
}
