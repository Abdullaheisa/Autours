"use client";

import { ArrowLeft, Calendar, Clock, Eye, Tag, Share2, Printer, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { getStatusBadgeProps } from "@/utils/statusMapper";
import { Blog } from "@/hooks/useBlogs";

interface BlogDetailsProps {
  blog: Blog;
  onBack: () => void;
  onEdit?: () => void;
}

export default function BlogDetails({ blog, onBack, onEdit }: BlogDetailsProps) {
  const badgeProps = getStatusBadgeProps(blog.status);
  
  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Blogs
        </button>
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl text-sm font-bold transition-colors"
            >
              <Pencil size={14} /> Edit Article
            </button>
          )}
          <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
            <Share2 size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
            <Printer size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Hero Image */}
        <div className="relative h-64 sm:h-96">
          <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="px-3 py-1 bg-primary-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                {blog.category}
              </span>
              <Badge {...badgeProps} className="capitalize">
                {blog.status}
              </Badge>
              {blog.status === "scheduled" && blog.publishDate && (
                <span className="px-3 py-1 bg-purple-600/80 text-white text-xs font-bold rounded-full">
                  📅 Scheduled: {blog.publishDate} {blog.publishTime && `@ ${blog.publishTime}`}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight">{blog.title}</h1>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 pb-8 mb-8 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm">
                {blog.authorAvatar}
              </div>
              <div>
                <p className="text-xs text-gray-500">Written by</p>
                <p className="text-sm font-bold text-gray-900">{blog.author}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm font-medium text-gray-900">{blog.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Time</p>
                <p className="text-sm font-medium text-gray-900">{blog.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Views</p>
                <p className="text-sm font-medium text-gray-900">1,245</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-4xl">
            <p className="text-lg text-gray-600 font-medium leading-relaxed mb-8 italic border-l-4 border-primary-500 pl-6">
              {blog.excerpt}
            </p>

            {blog.content ? (
              <div className="prose max-w-none text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                {blog.content}
              </div>
            ) : (
              <div className="space-y-5 text-gray-700">
                <p>In today's fast-paced world, choosing the right car rental option in the UAE can be a daunting task. Whether you're a resident or a tourist, understanding the nuances between daily and monthly rentals is crucial for maximizing value and convenience.</p>
                <h2 className="text-xl font-bold text-gray-900">The Benefits of Long-Term Rentals</h2>
                <p>Monthly car rentals offer significant cost savings compared to daily rates. When you book for a longer duration, agencies typically provide substantial discounts, sometimes up to 40% off the standard daily rate.</p>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-3">Key Takeaways:</h3>
                  <ul className="list-disc list-inside space-y-1.5 text-sm text-gray-600">
                    <li>Understand your usage patterns before choosing a duration.</li>
                    <li>Compare total costs including insurance and additional fees.</li>
                    <li>Look for reputable agencies with good customer reviews.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-gray-100">
              <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Tag size={16} className="text-gray-400" /> Related Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {["Car Rental", "UAE", "Dubai", "Travel Tips", "Savings"].map((tag) => (
                  <span key={tag} className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-medium rounded-lg cursor-pointer transition-colors">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
