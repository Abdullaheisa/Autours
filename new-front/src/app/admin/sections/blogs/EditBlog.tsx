"use client";

import { useState, useEffect } from "react";
import { Save, Image as ImageIcon, ChevronDown, ArrowLeft, X, CalendarClock, Clock, Settings2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import RichTextEditor from "@/components/shared/RichTextEditor";
import { BlogCategory } from "@/store/slices/blogCategoriesSlice";
import { Blog, BlogStatus } from "@/store/slices/blogsSlice";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import ManageCategoriesModal from "@/components/shared/ManageCategoriesModal";
import { blogCategoryApi } from '@/services/api';

// 🎨 تعديل نوع Blog ليشمل imageFile
interface EditBlogProps {
  blog: (Blog & { imageFile?: File | null }) | null;
  onBack: () => void;
  onSave: (data: Partial<Blog> & { id?: number; imageFile?: File | null }) => void;
  blogCategories: BlogCategory[];
}

const statusOptions: { value: BlogStatus; label: string; desc: string; color: string }[] = [
  { value: "published", label: "Published", desc: "Visible to everyone immediately", color: "emerald" },
  { value: "draft", label: "Draft", desc: "Saved but not visible", color: "amber" },
  { value: "scheduled", label: "Scheduled", desc: "Publish at a specific date & time", color: "purple" },
];

export default function EditBlog({ blog, onBack, onSave, blogCategories }: EditBlogProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const isEditing = !!blog;

  const [title, setTitle] = useState(blog?.title || "");
  const [slug, setSlug] = useState(blog?.slug || "");
  const [isSlugManual, setIsSlugManual] = useState(!!blog?.slug);
  const [author, setAuthor] = useState(blog?.author || "");
  // Store category as ID (string) for submission - find matching ID if editing
  const [category, setCategory] = useState<string>("");
  const [content, setContent] = useState(blog?.content || "");
  const [metaDescription, setMetaDescription] = useState(blog?.excerpt || "");
  const [status, setStatus] = useState<BlogStatus>(blog?.status || "published");
  const [publishDate, setPublishDate] = useState(blog?.publishDate || "");
  const [publishTime, setPublishTime] = useState(blog?.publishTime || "");
  const [previewImage, setPreviewImage] = useState<string | null>(blog?.image || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageAltText, setImageAltText] = useState(blog?.image_alt_text || "");
  const [tags, setTags] = useState(blog?.tags || "");
  const [loading, setLoading] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [localCategories, setLocalCategories] = useState<any[]>([]);

  useEffect(() => {
    // Initial fetch of categories if not passed or empty
    const fetchCats = async () => {
      try {
        const res: any = await blogCategoryApi.getAll();
        setLocalCategories(res.data?.data || res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  // Use local state for categories to show real-time updates from modal
  const activeCategories = localCategories.length > 0 ? localCategories : blogCategories;

  // Auto-generate slug from title
  useEffect(() => {
    if (!isSlugManual) {
      // Create a basic URL-friendly slug, but allow Arabic characters to remain if the backend handles them, or just use basic dash replacement
      // A more inclusive regex that allows Arabic letters: /[^a-zA-Z0-9\u0621-\u064A\u0660-\u0669]+/g
      setSlug(title.toLowerCase().replace(/[^a-z0-9\u0621-\u064A\u0660-\u0669]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  }, [title, isSlugManual]);

  // Reset schedule when status changes away from scheduled
  useEffect(() => {
    if (status !== "scheduled") {
      setPublishDate("");
      setPublishTime("");
    }
  }, [status]);

  // When editing, pre-select the category ID from the blog's category name
  useEffect(() => {
    if (blog?.category && blogCategories.length > 0 && !category) {
      // blog.category is the name (from mapApiBlog), find the matching ID
      const match = blogCategories.find(
        (c) => c.name === blog.category || String(c.id) === String(blog.category)
      );
      if (match) setCategory(String(match.id));
    }
  }, [blog, blogCategories, category]);

  // Pre-fill author when creating a new article and user name becomes available
  useEffect(() => {
    if (!blog && !author && user?.name) {
      setAuthor(user.name);
    }
  }, [blog, user, author]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!title.trim() || !author.trim() || !category) {
      toast.error("Please fill in all required fields (Title, Author, Category).");
      return;
    }
    if (status === "scheduled" && (!publishDate || !publishTime)) {
      toast.error("Please set a publish date and time for scheduled posts.");
      return;
    }
    setLoading(true);
    await onSave({
      ...(blog?.id ? { id: blog.id } : {}),
      title, slug, excerpt: metaDescription, content, author,
      category, // this is the category ID
      status, publishDate: status === "scheduled" ? publishDate : undefined,
      publishTime: status === "scheduled" ? publishTime : undefined,
      imageFile: imageFile || undefined,
      image_alt_text: imageAltText,
      tags,
    });
    setLoading(false);
    onBack();
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Blogs
      </button>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <PageHeader
          title={isEditing ? "Edit Article" : "Create New Article"}
          description={isEditing ? "Update your blog article details" : "Write and schedule a new article"}
          showAction={false}
        />
        <div className="h-0.5 bg-primary-400 mb-8 mt-4" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left: Main Form ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">Title <span className="text-red-500">*</span></label>
              <input
                value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" placeholder="Enter article title..."
              />
            </div>

            {/* Slug */}
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">Slug (auto-generated)</label>
              <input
                value={slug} onChange={(e) => { setSlug(e.target.value); setIsSlugManual(true); }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 focus:outline-none transition-all"
                placeholder="auto-generated-from-title"
              />
              <p className="text-[10px] text-gray-400 mt-1.5 font-medium">Auto-generated from title. You can edit it manually.</p>
            </div>

            {/* Author & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">Author <span className="text-red-500">*</span></label>
                <input
                  value={author} onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" placeholder="Author name..."
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Category <span className="text-red-500">*</span></label>
                  <button
                    onClick={() => setIsCategoriesModalOpen(true)}
                    className="text-[10px] font-bold text-primary-600 flex items-center gap-1 hover:text-primary-800 transition-colors"
                  >
                    <Settings2 size={12} /> Manage Categories
                  </button>
                </div>
                <div className="relative">
                  <select
                    value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer bg-white transition-all"
                  >
                    <option value="">Select a category</option>
                    {activeCategories.map((c: any) => <option key={c.id} value={c.id}>{c.title || c.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
              </div>
            </div>

            {/* Content Editor */}
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">Content <span className="text-red-500">*</span></label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Write your article content here..."
                minHeight={280}
              />
            </div>

            {/* Dynamic Tags Input */}
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-3">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Related Tags (separated by commas)
              </label>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white"
                placeholder="e.g. Car Rental, UAE, Dubai, Travel Tips"
              />
              <p className="text-[10px] text-gray-400 font-medium">
                Type tags separated by commas. These tags help improve search engine visibility (SEO) on the public blog page.
              </p>
              {tags.trim() && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.split(',').map((t) => t.trim()).filter(Boolean).map((t, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-primary-100 text-primary-800 text-xs font-bold rounded-lg border border-primary-200 shadow-sm animate-fade-in transition-all">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Sidebar ── */}
          <div className="space-y-6">
            {/* Featured Image */}
            <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 block">Featured Image</label>
              <div className="relative aspect-video bg-gray-200 rounded-2xl overflow-hidden mb-3 group">
                {previewImage ? (
                  <>
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => setPreviewImage(null)} className="p-2 bg-white rounded-full text-red-500 shadow-lg">
                        <X size={18} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon size={32} className="mb-2" />
                    <span className="text-xs font-medium">No image selected</span>
                  </div>
                )}
              </div>
              <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 hover:border-primary-300 transition-all">
                <ImageIcon size={14} />
                {previewImage ? "Change Image" : "Upload Image"}
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
              
              <div className="mt-4">
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1 block">Image Alt Text (Accessibility)</label>
                <input
                  value={imageAltText} onChange={(e) => setImageAltText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white"
                  placeholder="Describe the image content..."
                />
              </div>
            </div>

            {/* Meta Description */}
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">Meta Description</label>
              <textarea
                value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none min-h-[100px]"
                placeholder="Brief description for search engines..."
                maxLength={160}
              />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">SEO</span>
                <span className={`text-[10px] font-bold ${metaDescription.length > 140 ? "text-amber-500" : "text-gray-400"}`}>
                  {metaDescription.length}/160
                </span>
              </div>
            </div>

            {/* Publishing Options */}
            <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm space-y-4">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">Publishing Status</label>
              <div className="space-y-2">
                {statusOptions.map((opt) => {
                  const activeClass =
                    opt.value === "published" ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-400" :
                    opt.value === "draft" ? "border-amber-500 bg-amber-50 ring-1 ring-amber-400" :
                    "border-purple-500 bg-purple-50 ring-1 ring-purple-400";
                  return (
                    <label
                      key={opt.value}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        status === opt.value ? activeClass : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio" name="status" value={opt.value}
                        checked={status === opt.value}
                        onChange={() => setStatus(opt.value)}
                        className="mt-0.5"
                      />
                      <div>
                        <p className="text-sm font-bold text-gray-800">{opt.label}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{opt.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Scheduling Fields — shown only when "scheduled" is selected */}
              {status === "scheduled" && (
                <div className="mt-2 p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarClock size={16} className="text-purple-600" />
                    <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Schedule Settings</span>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-purple-600 uppercase mb-1 block">Publish Date</label>
                    <input
                      type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 border border-purple-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-purple-600 uppercase mb-1 block">Publish Time</label>
                    <input
                      type="time" value={publishTime} onChange={(e) => setPublishTime(e.target.value)}
                      className="w-full px-3 py-2 border border-purple-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                    />
                  </div>
                  {publishDate && publishTime && (
                    <p className="text-[10px] text-purple-600 font-medium flex items-center gap-1">
                      <Clock size={11} />
                      Will publish on {publishDate} at {publishTime}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <ManageCategoriesModal
                isOpen={isCategoriesModalOpen}
                onClose={() => setIsCategoriesModalOpen(false)}
                categories={activeCategories}
                onCategoriesChange={(newCats) => setLocalCategories(newCats)}
              />
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-primary-100 active:scale-95"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                {loading ? "Saving..." : isEditing ? "Update Article" : "Publish Article"}
              </button>
              <button
                onClick={onBack}
                className="w-full flex items-center justify-center px-6 py-3.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-2xl text-sm font-bold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
