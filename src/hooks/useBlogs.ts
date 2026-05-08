"use client";

import { useState, useCallback, useMemo } from "react";

export type BlogStatus = "published" | "draft" | "scheduled";

export interface Blog {
  id: number;
  title: string;
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

const initialBlogs: Blog[] = [
  { id: 1, title: "Daily vs Monthly Car Rental in UAE: Which Option Offers Better Value?", excerpt: "Choosing the right car rental duration in the UAE can make a significant difference in your overall costs...", author: "Yomna Ayman", authorAvatar: "Y", category: "Money Saving Tips", status: "published", date: "Apr 16, 2026", time: "02:40 PM", image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop" },
  { id: 2, title: "How to Choose the Best Car Rental in Dubai for Your Needs", excerpt: "Choosing a car rental in Dubai can feel overwhelming at first with so many options available...", author: "waleed alnaggar", authorAvatar: "W", category: "Best Agencies", status: "scheduled", date: "May 10, 2026", time: "10:00 AM", image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=250&fit=crop", publishDate: "2026-05-10", publishTime: "10:00" },
  { id: 3, title: "Car Rental Security Deposit Explained Everything You Need to Know Before Booking", excerpt: "When booking a car rental security deposit, many travelers are unsure about the process...", author: "Waleed Al Nagga", authorAvatar: "W", category: "Money Saving Tips", status: "draft", date: "Apr 7, 2026", time: "02:38 PM", image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=250&fit=crop" },
  { id: 4, title: "Car Rental Security Deposit Explained What You Need to Know Before You Book", excerpt: "When renting a car, one of the most common concerns travelers have is about the security deposit...", author: "Waleed alnaggar", authorAvatar: "W", category: "Money Saving Tips", status: "published", date: "Apr 5, 2026", time: "01:08 PM", image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=250&fit=crop" },
  { id: 5, title: "UAE Car Rental Insurance Guide | What You Need to Know Before You Drive", excerpt: "Renting a car in the UAE offers unmatched freedom, whether you're exploring Dubai's skyline...", author: "Waleed Al naggar", authorAvatar: "W", category: "Country Travel Guides", status: "published", date: "Apr 4, 2026", time: "10:59 PM", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=250&fit=crop" },
  { id: 6, title: "Dubai Airport Car Rental Guide Compare, Book & Save Smartly", excerpt: "Arriving at Dubai International Airport can feel overwhelming, especially when it comes to transportation...", author: "Waleed Alnaggar", authorAvatar: "W", category: "Country Travel Guides", status: "published", date: "Apr 1, 2026", time: "07:12 PM", image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=250&fit=crop" },
  { id: 7, title: "Eid Al Adha 2026 Car Rental Deals in UAE: How to Find the Best Offers", excerpt: "Eid Al Adha is one of the most anticipated holidays in the UAE, and many residents and visitors...", author: "Waleed AlNaggar", authorAvatar: "W", category: "Best Agencies", status: "scheduled", date: "May 15, 2026", time: "06:23 PM", image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&h=250&fit=crop", publishDate: "2026-05-15", publishTime: "18:23" },
  { id: 8, title: "Car Rental Trends at Arabian Travel Market 2026: What Travelers Need to Know", excerpt: "The Arabian Travel Market 2026 stands as one of the most significant events in the Middle East tourism...", author: "Waleed Al-Naggar", authorAvatar: "W", category: "Country Travel Guides", status: "published", date: "Mar 26, 2026", time: "03:04 PM", image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=250&fit=crop" },
  { id: 9, title: "Best Car Rental Platform to Compare Price in Kuwait UAE | Autours", excerpt: "Finding the right car rental solution today is no longer just about walking into a rental office...", author: "Autours", authorAvatar: "A", category: "Best Agencies", status: "published", date: "Mar 24, 2026", time: "03:24 PM", image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=250&fit=crop" },
  { id: 10, title: "How to Choose the Best UAE Car Rental | Expert Tips and Smart Comparison", excerpt: "Typing 'car rental near me' into a search engine might give you hundreds of results...", author: "Waleed Al Naggar", authorAvatar: "W", category: "Best Agencies", status: "draft", date: "Mar 11, 2026", time: "01:33 PM", image: "https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=400&h=250&fit=crop" },
];

export function useBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveBlog = useCallback((data: Partial<Blog> & { id?: number }) => {
    setLoading(true);
    setError(null);
    try {
      if (data.id) {
        setBlogs((prev) => prev.map((b) => (b.id === data.id ? { ...b, ...data } : b)));
      } else {
        const newBlog: Blog = {
          id: Date.now(),
          title: data.title || "",
          excerpt: data.excerpt || "",
          author: data.author || "",
          authorAvatar: (data.author || "A")[0].toUpperCase(),
          category: data.category || "",
          status: data.status || "draft",
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          image: data.image || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop",
          publishDate: data.publishDate,
          publishTime: data.publishTime,
        };
        setBlogs((prev) => [newBlog, ...prev]);
      }
    } catch (e) {
      setError("Failed to save blog post.");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBlog = useCallback((id: number) => {
    setBlogs((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return { blogs, loading, error, saveBlog, deleteBlog };
}
