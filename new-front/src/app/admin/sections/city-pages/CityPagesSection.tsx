"use client";

import { useState, useEffect, useMemo } from "react";
import {
  MapPin, Plus, Search, Eye, EyeOff, Pencil, Trash2,
  Globe, ChevronDown, ChevronUp, X, Save, Loader2,
  FileText, CheckCircle2, AlertCircle,
} from "lucide-react";
import SectionLayout from "@/components/shared/SectionLayout";
import PageHeader from "@/components/ui/PageHeader";
import StatsCard from "@/components/ui/StatsCard";
import { cityPageApi } from "@/services/api";
import toast from "react-hot-toast";

/* ───────── Types ───────── */
interface Benefit { title: string; description: string; }
interface Step { title: string; description: string; }
interface Place { name: string; description: string; image?: string; tags?: string[]; }
interface FAQ { q: string; a: string; }

interface CityPageRecord {
  id: number;
  slug: string;
  name: string;
  country: string;
  country_slug: string;
  hero_badge: string | null;
  hero_title: string;
  hero_highlight: string;
  hero_lead: string | null;
  hero_bottom_title: string | null;
  travel_info: { title: string; subtitle: string; image: string; benefits: Benefit[] } | null;
  steps: Step[] | null;
  documents: { items: string[] } | null;
  highlights: { title?: string; subtitle?: string; places: Place[] } | null;
  faqs: FAQ[] | null;
  partners_description: string | null;
  cta_title: string | null;
  cta_description: string | null;
  cta_primary_text: string | null;
  cta_secondary_text: string | null;
  meta_description: string | null;
  is_published: boolean;
  image: string | null;
  created_at: string;
  updated_at: string;
}

const EMPTY_FORM: Omit<CityPageRecord, "id" | "created_at" | "updated_at"> = {
  slug: "", name: "", country: "", country_slug: "",
  hero_badge: "", hero_title: "", hero_highlight: "", hero_lead: "", hero_bottom_title: "",
  travel_info: { title: "", subtitle: "", image: "", benefits: [] },
  steps: [{ title: "Search", description: "" }, { title: "Compare", description: "" }, { title: "Book & Drive", description: "" }],
  documents: { items: [] },
  highlights: { title: "", subtitle: "", places: [] },
  faqs: [],
  partners_description: "", cta_title: "", cta_description: "", cta_primary_text: "Compare Prices", cta_secondary_text: "Get Expert Help",
  meta_description: "", is_published: true, image: null,
};

/* ───────── Collapsible Section ───────── */
function Section({ title, icon, children, defaultOpen = false }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors">
        <span className="flex items-center gap-2.5 font-bold text-gray-800 text-sm">{icon}{title}</span>
        {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
      {open && <div className="p-5 space-y-4 bg-white">{children}</div>}
    </div>
  );
}

/* ───────── Input helpers ───────── */
function Input({ label, value, onChange, placeholder, required, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all" />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all resize-y" />
    </div>
  );
}

/* ───────── Dynamic List Item ───────── */
function DynamicListItem({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="relative border border-gray-100 rounded-xl p-4 bg-gray-50/50 group">
      <button type="button" onClick={onRemove} className="absolute top-2 right-2 p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
        <X size={14} />
      </button>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════ MAIN SECTION ═══════════════════════════════════════ */
export default function CityPagesSection() {
  const [cityPages, setCityPages] = useState<CityPageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<CityPageRecord | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);

  /* ── Fetch ── */
  const loadData = async () => {
    setLoading(true);
    try {
      const res: any = await cityPageApi.getAll();
      const data = res?.data?.data?.data || res?.data?.data || [];
      setCityPages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load city pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  /* ── Stats ── */
  const published = cityPages.filter((c) => c.is_published).length;
  const draft = cityPages.length - published;

  /* ── Filter ── */
  const filtered = useMemo(() => {
    if (!search) return cityPages;
    const q = search.toLowerCase();
    return cityPages.filter((c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
  }, [cityPages, search]);

  /* ── Form helpers ── */
  const openCreate = () => { setEditing(null); setForm(JSON.parse(JSON.stringify(EMPTY_FORM))); setImageFile(null); setView("form"); };
  const openEdit = (c: CityPageRecord) => {
    setEditing(c);
    setForm({
      slug: c.slug, name: c.name, country: c.country, country_slug: c.country_slug,
      hero_badge: c.hero_badge || "", hero_title: c.hero_title, hero_highlight: c.hero_highlight,
      hero_lead: c.hero_lead || "", hero_bottom_title: c.hero_bottom_title || "",
      travel_info: c.travel_info || { title: "", subtitle: "", image: "", benefits: [] },
      steps: c.steps || [], documents: c.documents || { items: [] },
      highlights: c.highlights || { title: "", subtitle: "", places: [] },
      faqs: c.faqs || [],
      partners_description: c.partners_description || "", cta_title: c.cta_title || "",
      cta_description: c.cta_description || "", cta_primary_text: c.cta_primary_text || "Compare Prices",
      cta_secondary_text: c.cta_secondary_text || "Get Expert Help",
      meta_description: c.meta_description || "", is_published: c.is_published, image: c.image,
    });
    setImageFile(null);
    setView("form");
  };

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      if (form.slug) fd.append("slug", form.slug);
      fd.append("country", form.country);
      fd.append("country_slug", form.country_slug);
      fd.append("hero_badge", form.hero_badge || "");
      fd.append("hero_title", form.hero_title);
      fd.append("hero_highlight", form.hero_highlight);
      fd.append("hero_lead", form.hero_lead || "");
      fd.append("hero_bottom_title", form.hero_bottom_title || "");
      fd.append("travel_info", JSON.stringify(form.travel_info));
      fd.append("steps", JSON.stringify(form.steps));
      fd.append("documents", JSON.stringify(form.documents));
      fd.append("highlights", JSON.stringify(form.highlights));
      fd.append("faqs", JSON.stringify(form.faqs));
      fd.append("partners_description", form.partners_description || "");
      fd.append("cta_title", form.cta_title || "");
      fd.append("cta_description", form.cta_description || "");
      fd.append("cta_primary_text", form.cta_primary_text || "");
      fd.append("cta_secondary_text", form.cta_secondary_text || "");
      fd.append("meta_description", form.meta_description || "");
      fd.append("is_published", form.is_published ? "1" : "0");
      if (imageFile) fd.append("image", imageFile);

      if (editing) {
        await cityPageApi.update(editing.id, fd);
        toast.success("City page updated!");
      } else {
        await cityPageApi.create(fd);
        toast.success("City page created!");
      }
      setView("list");
      loadData();
    } catch (err: any) {
      const msg = err?.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(", ") : err?.response?.data?.message || "Failed to save";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this city page?")) return;
    try {
      await cityPageApi.delete(id);
      toast.success("City page deleted!");
      loadData();
    } catch {
      toast.error("Failed to delete city page");
    }
  };

  /* ── Toggle publish ── */
  const handleTogglePublish = async (id: number) => {
    try {
      await cityPageApi.togglePublish(id);
      toast.success("Publication status updated!");
      loadData();
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  /* ── Update nested form helpers ── */
  const updateTravelInfo = (key: string, value: any) => setForm((f) => ({ ...f, travel_info: { ...(f.travel_info || { title: "", subtitle: "", image: "", benefits: [] }), [key]: value } }));
  const updateHighlights = (key: string, value: any) => setForm((f) => ({ ...f, highlights: { ...(f.highlights || { title: "", subtitle: "", places: [] }), [key]: value } }));

  /* ═══════════════════════ RENDER ═══════════════════════ */
  if (view === "form") {
    return (
      <SectionLayout>
        <div className="flex items-center justify-between">
          <PageHeader title={editing ? `Edit: ${editing.name}` : "Create City Page"} showAction={false} />
          <button onClick={() => setView("list")} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">
            <X size={18} /> Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ── Basic Info ── */}
          <Section title="Basic Information" icon={<Globe size={16} className="text-primary" />} defaultOpen>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="City Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="e.g. Dubai" required />
              <Input label="Slug (auto-generated)" value={form.slug} onChange={(v) => setForm((f) => ({ ...f, slug: v }))} placeholder="e.g. dubai" />
              <Input label="Country" value={form.country} onChange={(v) => setForm((f) => ({ ...f, country: v }))} placeholder="e.g. United Arab Emirates" required />
              <Input label="Country Slug" value={form.country_slug} onChange={(v) => setForm((f) => ({ ...f, country_slug: v }))} placeholder="e.g. uae" required />
            </div>
            <div className="flex items-center gap-3 mt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_published} onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm font-semibold text-gray-700">Published</span>
              </label>
            </div>
          </Section>

          {/* ── Hero Section ── */}
          <Section title="Hero Section" icon={<FileText size={16} className="text-blue-500" />} defaultOpen>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Badge Text" value={form.hero_badge || ""} onChange={(v) => setForm((f) => ({ ...f, hero_badge: v }))} placeholder="e.g. Autours Dubai Airport Car Rental" />
              <Input label="Hero Title" value={form.hero_title} onChange={(v) => setForm((f) => ({ ...f, hero_title: v }))} placeholder="e.g. Book Your Airport Rental" required />
              <Input label="Highlight (colored text)" value={form.hero_highlight} onChange={(v) => setForm((f) => ({ ...f, hero_highlight: v }))} placeholder="e.g. in Dubai" required />
              <Input label="Bottom Title" value={form.hero_bottom_title || ""} onChange={(v) => setForm((f) => ({ ...f, hero_bottom_title: v }))} placeholder="e.g. Search by Dubai airport..." />
            </div>
            <TextArea label="Lead Text" value={form.hero_lead || ""} onChange={(v) => setForm((f) => ({ ...f, hero_lead: v }))} placeholder="Hero subtitle / description" />
          </Section>

          {/* ── Travel Info / Why Autours ── */}
          <Section title="Why Autours (Travel Info)" icon={<CheckCircle2 size={16} className="text-green-500" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Section Title" value={form.travel_info?.title || ""} onChange={(v) => updateTravelInfo("title", v)} placeholder="e.g. Why Choose Autours?" />
              <Input label="Image path" value={form.travel_info?.image || ""} onChange={(v) => updateTravelInfo("image", v)} placeholder="e.g. countries/uae.png" />
            </div>
            <TextArea label="Subtitle" value={form.travel_info?.subtitle || ""} onChange={(v) => updateTravelInfo("subtitle", v)} placeholder="Section description" />

            {/* Image upload */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Upload Image</label>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-gray-900 hover:file:bg-primary/20 transition-all" />
            </div>

            {/* Benefits */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Benefits</label>
                <button type="button" onClick={() => updateTravelInfo("benefits", [...(form.travel_info?.benefits || []), { title: "", description: "" }])}
                  className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                  <Plus size={14} /> Add Benefit
                </button>
              </div>
              <div className="space-y-3">
                {(form.travel_info?.benefits || []).map((b, i) => (
                  <DynamicListItem key={i} onRemove={() => updateTravelInfo("benefits", form.travel_info!.benefits.filter((_, idx) => idx !== i))}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input label="Title" value={b.title} onChange={(v) => { const bens = [...form.travel_info!.benefits]; bens[i] = { ...bens[i], title: v }; updateTravelInfo("benefits", bens); }} />
                      <Input label="Description" value={b.description} onChange={(v) => { const bens = [...form.travel_info!.benefits]; bens[i] = { ...bens[i], description: v }; updateTravelInfo("benefits", bens); }} />
                    </div>
                  </DynamicListItem>
                ))}
              </div>
            </div>
          </Section>

          {/* ── Steps ── */}
          <Section title="How It Works (Steps)" icon={<CheckCircle2 size={16} className="text-indigo-500" />}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Steps</label>
              <button type="button" onClick={() => setForm((f) => ({ ...f, steps: [...(f.steps || []), { title: "", description: "" }] }))}
                className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                <Plus size={14} /> Add Step
              </button>
            </div>
            <div className="space-y-3">
              {(form.steps || []).map((s, i) => (
                <DynamicListItem key={i} onRemove={() => setForm((f) => ({ ...f, steps: f.steps!.filter((_, idx) => idx !== i) }))}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input label={`Step ${i + 1} Title`} value={s.title} onChange={(v) => { const ss = [...form.steps!]; ss[i] = { ...ss[i], title: v }; setForm((f) => ({ ...f, steps: ss })); }} />
                    <Input label="Description" value={s.description} onChange={(v) => { const ss = [...form.steps!]; ss[i] = { ...ss[i], description: v }; setForm((f) => ({ ...f, steps: ss })); }} />
                  </div>
                </DynamicListItem>
              ))}
            </div>
          </Section>

          {/* ── Documents ── */}
          <Section title="Required Documents" icon={<FileText size={16} className="text-orange-500" />}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Documents</label>
              <button type="button" onClick={() => setForm((f) => ({ ...f, documents: { items: [...(f.documents?.items || []), ""] } }))}
                className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                <Plus size={14} /> Add Document
              </button>
            </div>
            <div className="space-y-2">
              {(form.documents?.items || []).map((doc, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={doc} onChange={(e) => { const items = [...form.documents!.items]; items[i] = e.target.value; setForm((f) => ({ ...f, documents: { items } })); }}
                    placeholder="e.g. Valid driving license" className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all" />
                  <button type="button" onClick={() => setForm((f) => ({ ...f, documents: { items: f.documents!.items.filter((_, idx) => idx !== i) } }))}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><X size={14} /></button>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Highlights / Destinations ── */}
          <Section title="Top Destinations (Highlights)" icon={<MapPin size={16} className="text-red-500" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Section Title" value={form.highlights?.title || ""} onChange={(v) => updateHighlights("title", v)} placeholder="e.g. Top Destinations in Dubai" />
            </div>
            <TextArea label="Section Subtitle" value={form.highlights?.subtitle || ""} onChange={(v) => updateHighlights("subtitle", v)} placeholder="Section description" />

            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Places</label>
              <button type="button" onClick={() => updateHighlights("places", [...(form.highlights?.places || []), { name: "", description: "", image: "", tags: [] }])}
                className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                <Plus size={14} /> Add Place
              </button>
            </div>
            <div className="space-y-3">
              {(form.highlights?.places || []).map((p, i) => (
                <DynamicListItem key={i} onRemove={() => updateHighlights("places", form.highlights!.places.filter((_, idx) => idx !== i))}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input label="Name" value={p.name} onChange={(v) => { const pp = [...form.highlights!.places]; pp[i] = { ...pp[i], name: v }; updateHighlights("places", pp); }} />
                    <Input label="Image URL" value={p.image || ""} onChange={(v) => { const pp = [...form.highlights!.places]; pp[i] = { ...pp[i], image: v }; updateHighlights("places", pp); }} placeholder="https://..." />
                    <Input label="Tags (comma-separated)" value={(p.tags || []).join(", ")} onChange={(v) => { const pp = [...form.highlights!.places]; pp[i] = { ...pp[i], tags: v.split(",").map((t) => t.trim()).filter(Boolean) }; updateHighlights("places", pp); }} placeholder="Beach, Luxury" />
                  </div>
                  <div className="mt-2">
                    <TextArea label="Description" value={p.description} onChange={(v) => { const pp = [...form.highlights!.places]; pp[i] = { ...pp[i], description: v }; updateHighlights("places", pp); }} rows={2} />
                  </div>
                </DynamicListItem>
              ))}
            </div>
          </Section>

          {/* ── FAQs ── */}
          <Section title="FAQs" icon={<AlertCircle size={16} className="text-purple-500" />}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Questions & Answers</label>
              <button type="button" onClick={() => setForm((f) => ({ ...f, faqs: [...(f.faqs || []), { q: "", a: "" }] }))}
                className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                <Plus size={14} /> Add FAQ
              </button>
            </div>
            <div className="space-y-3">
              {(form.faqs || []).map((faq, i) => (
                <DynamicListItem key={i} onRemove={() => setForm((f) => ({ ...f, faqs: f.faqs!.filter((_, idx) => idx !== i) }))}>
                  <Input label="Question" value={faq.q} onChange={(v) => { const ff = [...form.faqs!]; ff[i] = { ...ff[i], q: v }; setForm((f) => ({ ...f, faqs: ff })); }} />
                  <div className="mt-2">
                    <TextArea label="Answer" value={faq.a} onChange={(v) => { const ff = [...form.faqs!]; ff[i] = { ...ff[i], a: v }; setForm((f) => ({ ...f, faqs: ff })); }} rows={2} />
                  </div>
                </DynamicListItem>
              ))}
            </div>
          </Section>

          {/* ── CTA & Partners ── */}
          <Section title="CTA & Partners" icon={<Globe size={16} className="text-teal-500" />}>
            <TextArea label="Partners Description" value={form.partners_description || ""} onChange={(v) => setForm((f) => ({ ...f, partners_description: v }))} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="CTA Title" value={form.cta_title || ""} onChange={(v) => setForm((f) => ({ ...f, cta_title: v }))} />
              <Input label="CTA Primary Button" value={form.cta_primary_text || ""} onChange={(v) => setForm((f) => ({ ...f, cta_primary_text: v }))} />
            </div>
            <TextArea label="CTA Description" value={form.cta_description || ""} onChange={(v) => setForm((f) => ({ ...f, cta_description: v }))} />
            <Input label="CTA Secondary Button" value={form.cta_secondary_text || ""} onChange={(v) => setForm((f) => ({ ...f, cta_secondary_text: v }))} />
          </Section>

          {/* ── SEO ── */}
          <Section title="SEO" icon={<Search size={16} className="text-gray-500" />}>
            <TextArea label="Meta Description" value={form.meta_description || ""} onChange={(v) => setForm((f) => ({ ...f, meta_description: v }))} placeholder="SEO description for search engines" />
          </Section>

          {/* ── Submit ── */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-gray-900 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/20 disabled:opacity-50">
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {editing ? "Update City Page" : "Create City Page"}
            </button>
            <button type="button" onClick={() => setView("list")} className="px-6 py-3 rounded-xl font-bold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </SectionLayout>
    );
  }

  /* ═══════════════════════ LIST VIEW ═══════════════════════ */
  return (
    <SectionLayout>
      <PageHeader
        title="City Pages"
        description="Manage dynamic city landing pages"
        actionLabel="New City Page"
        actionIcon={<Plus size={18} />}
        onAction={openCreate}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard label="Total Cities" value={cityPages.length} icon={<MapPin size={20} />} color="blue" />
        <StatsCard label="Published" value={published} icon={<CheckCircle2 size={20} />} color="emerald" />
        <StatsCard label="Drafts" value={draft} icon={<EyeOff size={20} />} color="orange" />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search cities..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400">
          <Loader2 size={24} className="animate-spin mr-2" /> Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <MapPin size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-bold">No city pages found</p>
          <p className="text-sm mt-1">Create your first city page to get started</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-bold text-gray-600 uppercase text-xs tracking-wider">City</th>
                  <th className="text-left px-5 py-3.5 font-bold text-gray-600 uppercase text-xs tracking-wider">Country</th>
                  <th className="text-left px-5 py-3.5 font-bold text-gray-600 uppercase text-xs tracking-wider">Slug</th>
                  <th className="text-center px-5 py-3.5 font-bold text-gray-600 uppercase text-xs tracking-wider">Status</th>
                  <th className="text-center px-5 py-3.5 font-bold text-gray-600 uppercase text-xs tracking-wider">FAQs</th>
                  <th className="text-right px-5 py-3.5 font-bold text-gray-600 uppercase text-xs tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <MapPin size={14} className="text-primary" />
                        </div>
                        <span className="font-bold text-gray-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{c.country}</td>
                    <td className="px-5 py-4"><code className="text-xs bg-gray-100 px-2 py-1 rounded-lg font-mono text-gray-600">/cities/{c.slug}</code></td>
                    <td className="px-5 py-4 text-center">
                      <button onClick={() => handleTogglePublish(c.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${c.is_published ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100" : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"}`}>
                        {c.is_published ? <Eye size={12} /> : <EyeOff size={12} />}
                        {c.is_published ? "Live" : "Draft"}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-gray-500 font-mono text-xs">{c.faqs?.length || 0}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => openEdit(c)} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </SectionLayout>
  );
}
