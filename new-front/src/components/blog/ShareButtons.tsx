'use client';

import { useState } from 'react';
import { 
  Share2, Facebook, Twitter, 
  Linkedin, CheckCircle2 
} from 'lucide-react';

interface ShareButtonsProps {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareLinks = [
    { 
      name: 'Facebook', 
      icon: Facebook, 
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: 'hover:text-[#1877F2] hover:bg-[#1877F2]/10'
    },
    { 
      name: 'Twitter', 
      icon: Twitter, 
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      color: 'hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10'
    },
    { 
      name: 'LinkedIn', 
      icon: Linkedin, 
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: 'hover:text-[#0A66C2] hover:bg-[#0A66C2]/10'
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-b border-gray-100 mb-10">
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Share this:</span>
        <div className="flex gap-2">
          {shareLinks.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 transition-all duration-300 ${social.color}`}
              title={`Share on ${social.name}`}
            >
              <social.icon size={18} />
            </a>
          ))}
        </div>
      </div>

      <button 
        onClick={handleCopyLink}
        className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-[0.2em] group"
      >
        {copied ? (
          <>
            <CheckCircle2 size={16} className="text-green-500" />
            <span className="text-green-600">Copied!</span>
          </>
        ) : (
          <>
            <Share2 size={16} className="group-hover:rotate-12 transition-transform" />
            Copy Link
          </>
        )}
      </button>
    </div>
  );
}
