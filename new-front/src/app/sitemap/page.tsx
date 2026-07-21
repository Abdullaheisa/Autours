import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import { SERVER_API_BASE } from '@/config/api';
import SitemapClient, { SitemapGroup, SitemapItem } from './components/SitemapClient';

// Ensure the page is never cached so edits to sitemap.xml appear instantly
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Site Map | Autours Car Rental',
  description: 'Autours Sitemap. Navigate easily through all car rental brands, destinations, airport locations, company resources, and support pages.',
  alternates: { canonical: '/sitemap' },
};

// Helper: Fetch or read raw sitemap.xml content (prioritize local file first)
async function getSitemapXmlContent(): Promise<string> {
  // 1. Read local public/sitemap.xml directly for instant local edit reflection
  try {
    const filePath = path.join(process.cwd(), 'public', 'sitemap.xml');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content && (content.includes('<urlset') || content.includes('<url>'))) {
        return content;
      }
    }
  } catch (e) {
    console.warn('Could not read local public/sitemap.xml:', e);
  }

  // 2. Fallback: Try fetching from backend / API URL
  try {
    const backendXmlUrl = `${SERVER_API_BASE.replace(/\/api\/?$/, '')}/sitemap.xml`;
    const res = await fetch(backendXmlUrl, { cache: 'no-store' });
    if (res.ok) {
      const text = await res.text();
      if (text.includes('<urlset') || text.includes('<url>')) {
        return text;
      }
    }
  } catch (e) {
    console.warn('Could not fetch sitemap.xml from backend API:', e);
  }

  return '';
}

// Helper: Parse XML <url> nodes
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

// Helper: Convert URL into relative path and readable title
function formatUrlItem(rawUrl: string, lastmod?: string): SitemapItem {
  try {
    const urlObj = new URL(rawUrl);
    let href = urlObj.pathname + urlObj.search;
    if (!href.startsWith('/')) href = '/' + href;

    let title = href;
    if (href === '/' || href === '') {
      title = 'Home Page';
    } else {
      const [pathname, search] = href.split('?');
      const parts = pathname.split('/').filter(Boolean);
      const slug = parts[parts.length - 1] || pathname;
      let cleanTitle = slug
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

      // Format query parameters nicely (e.g. ?category=6 -> Blogs (Category 6))
      if (search) {
        const params = new URLSearchParams(search);
        const searchPairs: string[] = [];
        params.forEach((val, key) => {
          searchPairs.push(`${key.replace(/[-_]/g, ' ')}: ${val}`);
        });
        if (searchPairs.length > 0) {
          cleanTitle += ` (${searchPairs.join(', ')})`;
        }
      }
      title = cleanTitle;
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

// Helper: Dynamically group ALL URLs strictly from sitemap.xml
function groupXmlUrls(items: SitemapItem[]): SitemapGroup[] {
  const groupMap: Record<string, { title: string; items: SitemapItem[] }> = {};

  items.forEach((item) => {
    const rawPath = item.href.split('?')[0];
    const segments = rawPath.split('/').filter(Boolean);
    const firstSegment = segments[0] ? segments[0].toLowerCase() : 'main';

    let groupKey = firstSegment;
    let groupTitle = '';

    if (
      groupKey === 'main' ||
      rawPath === '/' ||
      rawPath === '/v2' ||
      rawPath === '/about-us' ||
      rawPath === '/why_autours' ||
      rawPath === '/where-we-are' ||
      rawPath === '/contact-us'
    ) {
      groupKey = 'main';
      groupTitle = 'Main Pages';
    } else if (groupKey === 'blogs') {
      groupTitle = 'Blog Articles & Categories';
    } else if (groupKey === 'countries') {
      groupTitle = 'Our Destinations';
    } else if (groupKey === 'car-rental-brands') {
      groupTitle = 'Car Rental Brands';
    } else {
      // Dynamic fallback for any new section added to sitemap.xml!
      groupTitle =
        firstSegment
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase()) + ' Pages';
    }

    if (!groupMap[groupKey]) {
      groupMap[groupKey] = {
        title: groupTitle,
        items: [],
      };
    }

    // Keep unique URLs
    if (!groupMap[groupKey].items.some((i) => i.href === item.href)) {
      groupMap[groupKey].items.push(item);
    }
  });

  return Object.keys(groupMap).map((key) => ({
    key,
    title: groupMap[key].title,
    items: groupMap[key].items,
  }));
}

export default async function SitemapPage() {
  const xmlContent = await getSitemapXmlContent();
  const rawUrls = parseSitemapXml(xmlContent);

  // Convert raw XML URLs to formatted sitemap items
  const items = rawUrls.map((u) => formatUrlItem(u.loc, u.lastmod));

  // Dynamically group all items extracted from sitemap.xml
  const groups = groupXmlUrls(items);

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
            Dynamic sitemap generated 100% from <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs font-mono">sitemap.xml</code>. Total URLs indexed: <span className="font-bold text-gray-900">{items.length}</span>.
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
