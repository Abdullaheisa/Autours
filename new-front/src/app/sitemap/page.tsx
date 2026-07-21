import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import { SERVER_API_BASE } from '@/config/api';
import SitemapClient, { SitemapGroup, SitemapItem } from './components/SitemapClient';

export const metadata: Metadata = {
  title: 'Site Map | Autours Car Rental',
  description: 'Autours Sitemap. Navigate easily through all car rental brands, destinations, airport locations, company resources, and support pages.',
  alternates: { canonical: '/sitemap' },
};

// Helper: Fetch or read the raw sitemap.xml content
async function getSitemapXmlContent(): Promise<string> {
  // 1. Try fetching from backend / API URL
  try {
    const backendXmlUrl = `${SERVER_API_BASE.replace(/\/api\/?$/, '')}/sitemap.xml`;
    const res = await fetch(backendXmlUrl, { next: { revalidate: 60 } });
    if (res.ok) {
      const text = await res.text();
      if (text.includes('<urlset') || text.includes('<url>')) {
        return text;
      }
    }
  } catch (e) {
    console.warn('Could not fetch sitemap.xml from backend API, using local fallback...', e);
  }

  // 2. Local file fallback from public/sitemap.xml
  try {
    const filePath = path.join(process.cwd(), 'public', 'sitemap.xml');
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
  } catch (e) {
    console.warn('Could not read public/sitemap.xml:', e);
  }

  return '';
}

// Helper: Parse XML <url> tags and extract <loc> and <lastmod>
function parseSitemapXml(xmlContent: string): { loc: string; lastmod?: string }[] {
  const urls: { loc: string; lastmod?: string }[] = [];
  const urlBlockRegex = /<url>([\s\S]*?)<\/url>/gi;
  let match;

  while ((match = urlBlockRegex.exec(xmlContent)) !== null) {
    const block = match[1];
    const locMatch = /<loc>(.*?)<\/loc>/i.exec(block);
    const lastmodMatch = /<lastmod>(.*?)<\/lastmod>/i.exec(block);

    if (locMatch && locMatch[1]) {
      urls.push({
        loc: locMatch[1].trim(),
        lastmod: lastmodMatch && lastmodMatch[1] ? lastmodMatch[1].trim() : undefined,
      });
    }
  }

  return urls;
}

// Helper: Format URL into relative path and readable title
function formatUrlItem(rawUrl: string, lastmod?: string): SitemapItem {
  try {
    const urlObj = new URL(rawUrl);
    let href = urlObj.pathname + urlObj.search;
    if (!href.startsWith('/')) href = '/' + href;

    let title = href;
    if (href === '/' || href === '') {
      title = 'Home Page';
    } else {
      const parts = href.split('?')[0].split('/').filter(Boolean);
      const slug = parts[parts.length - 1] || href;
      title = slug
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }

    return { title, href, lastmod };
  } catch {
    const href = rawUrl.startsWith('/') ? rawUrl : '/' + rawUrl;
    return {
      title: rawUrl.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      href,
      lastmod,
    };
  }
}

// Helper: Group items into logical sections
function groupSitemapItems(items: SitemapItem[]): SitemapGroup[] {
  const groupMap: Record<string, { title: string; items: SitemapItem[] }> = {
    main: { title: 'Main Pages', items: [] },
    blogs: { title: 'Blog Articles & News', items: [] },
    destinations: { title: 'Our Destinations', items: [] },
    brands: { title: 'Car Rental Brands', items: [] },
    other: { title: 'Other Links & Portals', items: [] },
  };

  items.forEach((item) => {
    const path = item.href.toLowerCase();
    if (
      path === '/' ||
      path === '/about-us' ||
      path === '/why_autours' ||
      path === '/where-we-are' ||
      path === '/contact-us' ||
      path === '/v2'
    ) {
      groupMap.main.items.push(item);
    } else if (path.startsWith('/blogs')) {
      groupMap.blogs.items.push(item);
    } else if (path.startsWith('/countries')) {
      groupMap.destinations.items.push(item);
    } else if (path.startsWith('/car-rental-brands')) {
      groupMap.brands.items.push(linkCleanName(item, 'brand'));
    } else {
      groupMap.other.items.push(item);
    }
  });

  // Filter out empty groups
  return Object.keys(groupMap)
    .filter((key) => groupMap[key].items.length > 0)
    .map((key) => ({
      key,
      title: groupMap[key].title,
      items: groupMap[key].items,
    }));
}

function linkCleanName(item: SitemapItem, type: string): SitemapItem {
  if (type === 'brand' && item.href === '/car-rental-brands') {
    return { ...item, title: 'All Rental Brands Index' };
  }
  return item;
}

export default async function SitemapPage() {
  const xmlContent = await getSitemapXmlContent();
  const rawUrls = parseSitemapXml(xmlContent);

  // Convert raw URLs to formatted sitemap items
  const items = rawUrls.map((u) => formatUrlItem(u.loc, u.lastmod));
  
  // Group items by category
  const groups = groupSitemapItems(items);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="max-w-5xl mx-auto border-b border-gray-200 pb-6 mb-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
            Autours HTML Sitemap
          </h1>
          <p className="text-gray-600 text-sm font-medium">
            Dynamic sitemap parsed from <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">sitemap.xml</code>. Total links indexed: <span className="font-bold text-gray-900">{items.length}</span>. Click on any section below to expand or collapse.
          </p>
        </div>

        {/* Dynamic Accordion Group List */}
        {groups.length > 0 ? (
          <SitemapClient groups={groups} />
        ) : (
          <div className="max-w-5xl mx-auto text-center py-12 text-gray-500 font-bold">
            No links found in sitemap.xml
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
