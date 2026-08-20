'use client';

import { useState } from 'react';
import Link from 'next/link';

export interface SitemapItem {
  title: string;
  href: string;
  lastmod?: string;
}

export interface SitemapGroup {
  key: string;
  title: string;
  items: SitemapItem[];
}

interface SitemapClientProps {
  groups: SitemapGroup[];
}

export default function SitemapClient({ groups }: SitemapClientProps) {
  // Open the first section by default
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    groups.forEach((g, idx) => {
      initial[g.key] = idx === 0;
    });
    return initial;
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {groups.map((group) => {
        const isOpen = !!openSections[group.key];
        return (
          <div
            key={group.key}
            className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm"
          >
            <button
              onClick={() => toggleSection(group.key)}
              className="w-full text-left px-6 py-5 flex items-center justify-between font-black text-gray-900 bg-white hover:bg-gray-50 transition-colors focus:outline-none"
            >
              <span className="text-lg">
                {group.title} ({group.items.length})
              </span>
              <span className="text-xl font-bold text-gray-400">
                {isOpen ? '−' : '+'}
              </span>
            </button>

            {isOpen && (
              <div className="px-6 py-6 bg-gray-50/50 border-t border-gray-150 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {group.items.map((item, idx) => (
                  <Link
                    key={`${item.href}-${idx}`}
                    href={item.href}
                    className="text-sm font-bold text-gray-700 hover:text-primary transition-colors py-1 truncate"
                    title={item.title}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
