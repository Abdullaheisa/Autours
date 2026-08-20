"use client";

import React, { useMemo } from 'react';
import { Calendar, User, Search } from 'lucide-react';

interface BlogPreviewData {
  title: string;
  author: string;
  content: string;
  meta_description: string;
  image_preview_url: string;
}

interface AdminBlogPreviewProps {
  blogData: BlogPreviewData;
}

export default function AdminBlogPreview({ blogData }: AdminBlogPreviewProps) {
  const currentDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  return (
    <div className="flex flex-col gap-8">
      {/* Google SERP Snippet Preview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold border-b border-gray-100 pb-3">
          <Search size={18} className="text-blue-500" />
          <h3>Google Search Preview (SEO)</h3>
        </div>
        
        <div className="bg-[#f8f9fa] rounded-xl p-5 font-sans border border-gray-200/60 max-w-2xl">
          {/* Breadcrumb / URL Simulation */}
          <div className="flex items-center text-sm mb-1.5 text-[#202124]">
            <span className="bg-[#f1f3f4] rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2 border border-gray-300">
              A
            </span>
            <span>autours.com</span>
            <span className="text-[#5f6368] mx-1.5">›</span>
            <span className="text-[#5f6368]">blog</span>
          </div>
          
          {/* Title */}
          <div className="text-[20px] leading-[1.3] text-[#1a0dab] cursor-pointer hover:underline mb-1 font-medium truncate">
            {blogData.title || "Your Blog Title Will Appear Here"}
          </div>
          
          {/* Meta Description */}
          <div className="text-[14px] leading-[1.58] text-[#4d5156] line-clamp-2">
            <span className="text-[#70757a] mr-1">{currentDate} —</span>
            {blogData.meta_description || "Your meta description will appear here. Write a compelling summary to increase click-through rates from search results."}
          </div>
        </div>
      </div>

      {/* Live Article Preview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 p-4 px-6">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            Live Article Preview
          </h3>
        </div>

        <div className="p-0 sm:p-6 lg:p-10 bg-white">
          <article className="max-w-4xl mx-auto border border-gray-100 rounded-3xl overflow-hidden shadow-lg">
            {/* Simulated Hero */}
            <div className="bg-gray-50 p-8 text-center border-b border-gray-100">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                {blogData.title || "Blog Title"}
              </h1>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500 font-medium uppercase tracking-wide">
                {blogData.author && (
                  <span className="flex items-center gap-1.5">
                    <User size={14} />
                    {blogData.author}
                  </span>
                )}
                {blogData.author && <span>•</span>}
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {currentDate}
                </span>
              </div>
            </div>

            {/* Featured Image */}
            {blogData.image_preview_url && (
              <div className="w-full h-[300px] sm:h-[400px] bg-gray-100">
                <img 
                  src={blogData.image_preview_url} 
                  alt="Featured Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content Body */}
            <div className="p-8 sm:p-12">
              {blogData.content ? (
                <div 
                  className="prose prose-lg prose-yellow max-w-none
                            prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl 
                            prose-a:text-primary hover:prose-a:text-primary-dark 
                            prose-img:rounded-xl prose-img:shadow-md 
                            prose-blockquote:border-l-primary prose-blockquote:bg-gray-50 
                            prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg"
                  dangerouslySetInnerHTML={{ __html: blogData.content }}
                />
              ) : (
                <div className="text-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                  Write some content to see the live preview here.
                </div>
              )}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
