"use client";

import { FolderOpen, CalendarClock, Calendar, ArrowUpRight, Eye, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { getStatusBadgeProps } from "@/utils/statusMapper";
import { Blog } from "@/store/slices/blogsSlice";

interface BlogCardProps {
  blog: Blog;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  categoryColors: Record<string, string>;
}

export default function BlogCard({ blog, onView, onEdit, onDelete, categoryColors }: BlogCardProps) {
  const badgeProps = getStatusBadgeProps(blog.status);
  
  return (
    <div className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-primary-200 transition-all duration-300 overflow-hidden flex flex-col">
      <div className="relative h-44 overflow-hidden">
        <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-3 left-3">
          <Badge {...badgeProps} className="capitalize">
            {blog.status}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border backdrop-blur-sm bg-white/90 ${categoryColors[blog.category] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
            <FolderOpen size={10} />{blog.category}
          </span>
        </div>
        {blog.status === "scheduled" && blog.publishDate && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-purple-600/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-lg">
            <CalendarClock size={11} />
            Scheduled: {blog.publishDate} {blog.publishTime && `@ ${blog.publishTime}`}
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {blog.title}
        </h3>
        <p className="text-xs text-gray-500 mt-2 line-clamp-2 flex-1">{blog.excerpt}</p>

        <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-[10px] font-bold text-primary-700">{blog.authorAvatar}</span>
            </div>
            <span className="text-xs text-gray-600 truncate">{blog.author}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar size={12} />
            <span className="text-xs">{blog.date} · {blog.time}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <button onClick={onView} className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors">
            Read <ArrowUpRight size={12} />
          </button>
          <div className="flex items-center gap-1">
            <button onClick={onView} className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"><Eye size={14} /></button>
            <button onClick={onEdit} className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"><Pencil size={14} /></button>
            <button onClick={onDelete} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
