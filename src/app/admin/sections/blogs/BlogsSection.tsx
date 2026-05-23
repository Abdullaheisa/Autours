"use client";

import { useState, useMemo, useEffect } from "react";
import {
  FileText, CheckCircle2, Clock, CalendarClock,
} from "lucide-react";
import SectionLayout from "@/components/shared/SectionLayout";
import PageHeader from "@/components/ui/PageHeader";
import StatsCard from "@/components/ui/StatsCard";
import FilterBar from "@/components/shared/FilterBar";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
import BlogDetails from "./BlogDetails";
import EditBlog from "./EditBlog";
import BlogCard from "./BlogCard";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { 
  fetchBlogs, 
  saveLocalBlog, 
  deleteLocalBlog 
} from "@/store/slices/blogsSlice";
import { Blog } from "@/store/slices/blogsSlice";

const categories = ["All Categories", "Money Saving Tips", "Best Agencies", "Country Travel Guides"];
const statuses = ["All", "published", "draft", "scheduled"];

const categoryColors: Record<string, string> = {
  "Money Saving Tips": "bg-blue-50 text-blue-700 border-blue-200",
  "Best Agencies": "bg-purple-50 text-purple-700 border-purple-200",
  "Country Travel Guides": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function BlogsSection() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: blogs, loading, error } = useSelector((state: RootState) => state.blogs);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState<"list" | "details" | "edit">("list");
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const itemsPerPage = 8;

  useEffect(() => {
    if (blogs.length === 0) dispatch(fetchBlogs());
  }, [dispatch, blogs.length]);

  const saveBlog = (data: Partial<Blog> & { id?: number }) => dispatch(saveLocalBlog(data));
  const deleteBlog = (id: number) => dispatch(deleteLocalBlog(id));

  const filtered = useMemo(() => {
    return blogs.filter((b) => {
      const matchSearch = !searchQuery ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === "All Categories" || b.category === selectedCategory;
      const matchStatus = selectedStatus === "All" || b.status === selectedStatus;
      return matchSearch && matchCat && matchStatus;
    });
  }, [blogs, searchQuery, selectedCategory, selectedStatus]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const clearFilters = () => {
    setSearchQuery(""); setSelectedCategory("All Categories");
    setSelectedStatus("All"); setCurrentPage(1);
  };

  const handleEdit = (blog: Blog) => { setSelectedBlog(blog); setView("edit"); };
  const handleView = (blog: Blog) => { setSelectedBlog(blog); setView("details"); };
  const handleAddNew = () => { setSelectedBlog(null); setView("edit"); };
  const handleBack = () => { setSelectedBlog(null); setView("list"); };
  const handleDelete = (id: number) => {
    if (confirm("Delete this article?")) deleteBlog(id);
  };

  if (view === "details" && selectedBlog) return <BlogDetails blog={selectedBlog} onBack={handleBack} onEdit={() => handleEdit(selectedBlog)} />;
  if (view === "edit") return <EditBlog blog={selectedBlog} onBack={handleBack} onSave={saveBlog} />;

  const counts = {
    published: blogs.filter((b) => b.status === "published").length,
    draft: blogs.filter((b) => b.status === "draft").length,
    scheduled: blogs.filter((b) => b.status === "scheduled").length,
  };

  return (
    <SectionLayout>
      <PageHeader
        title="Blog Articles"
        description="Manage and schedule your blog articles"
        actionLabel="Add New Article"
        onAction={handleAddNew}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard label="Total Articles" value={blogs.length} icon={<FileText size={20} />} color="blue" />
        <StatsCard label="Published" value={counts.published} icon={<CheckCircle2 size={20} />} color="emerald" />
        <StatsCard label="Drafts" value={counts.draft} icon={<Clock size={20} />} color="amber" />
        <StatsCard label="Scheduled" value={counts.scheduled} icon={<CalendarClock size={20} />} color="purple" />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => { setSelectedStatus(s); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              selectedStatus === s
                ? "bg-primary-600 text-white shadow-lg shadow-primary-100"
                : "bg-white border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600"
            }`}
          >
            {s === "All" ? "All Articles" : s}
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
              selectedStatus === s ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
            }`}>
              {s === "All" ? blogs.length : blogs.filter(b => b.status === s).length}
            </span>
          </button>
        ))}
      </div>

      <FilterBar
        searchPlaceholder="Search by title or author..."
        searchValue={searchQuery}
        onSearchChange={(v) => { setSearchQuery(v); setCurrentPage(1); }}
        filters={[
          {
            label: "Category", value: selectedCategory,
            options: categories.map((c) => ({ value: c, label: c })),
            onChange: (v) => { setSelectedCategory(v); setCurrentPage(1); },
          },
        ]}
        onClearFilters={clearFilters}
      />

      <p className="text-sm text-gray-500">
        Showing <span className="font-semibold text-gray-900">{paginated.length}</span> of{" "}
        <span className="font-semibold text-gray-900">{filtered.length}</span> articles
      </p>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <span className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      )}

      {!loading && filtered.length === 0 ? (
        <EmptyState onAction={clearFilters} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {paginated.map((blog) => (
            <BlogCard
              key={blog.id}
              blog={blog}
              onView={() => handleView(blog)}
              onEdit={() => handleEdit(blog)}
              onDelete={() => handleDelete(blog.id)}
              categoryColors={categoryColors}
            />
          ))}
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </SectionLayout>
  );
}
