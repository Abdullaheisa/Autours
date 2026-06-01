'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Facebook, Instagram, Linkedin, Mail 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { assets } from '@/config/assets';
import { countries } from '@/data/countries';

const XIcon = ({ size = 18 }: { size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const footerLinks = {
  Company: [
    { name: 'About us', href: '/about-us' },
    { name: 'Contact us', href: '/contact-us' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms & Condition', href: '/terms' },
    { name: 'Site Map', href: '/sitemap' },
  ],
  Support: [
    { name: 'Manage Booking', href: '/login' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Subscribe', href: '/subscribe' },
    { name: 'Why Autours?', href: '/why-autours' },
    { name: 'Our Blogs', href: '/blog' },
  ],
  Supplier: [
    { name: 'Be Supplier', href: '/be-supplier' },
    { name: 'Where we are?', href: '/where-we-are' },
    { name: 'Register', href: '/register' },
    { name: 'Our Fleet', href: '#fleet' },
  ]
};

export default function Footer() {
  const [showAll, setShowAll] = useState(false);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const displayedCountries = showAll ? countries : countries.slice(0, 5);

  return (
    <footer className="bg-primary pt-10 pb-6 text-black border-t border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 border-b border-black/10 pb-4"
        >
          <Link href="/" aria-label="Autours Home" className="inline-block group focus:outline-none focus:ring-2 focus:ring-black rounded-lg">
            <Image 
              src={assets.logoFooter} 
              alt="Autours Logo"
              width={240}
              height={96}
              sizes="(max-width: 768px) 160px, 240px"
              quality={60}
              loading="lazy"
              className="h-16 md:h-24 w-auto object-contain transition-transform group-hover:scale-105" 
            />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6 mb-8">
          {Object.entries(footerLinks).map(([category, links], idx) => (
            <motion.div 
              key={category}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="space-y-2"
            >
              <h2 className="text-base font-black text-black">
                {category}
              </h2>
              <ul className="space-y-0.5">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      onClick={(e) => scrollToSection(e, link.href)}
                      className="text-[15px] font-bold text-black/80 hover:text-black hover:underline underline-offset-2 transition-all focus:outline-none focus:ring-2 focus:ring-black rounded-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="space-y-2 min-h-[160px]" // Fix CLS by reserving space
          >
            <h2 className="text-base font-black text-black">
              Location
            </h2>
            <ul className="space-y-0.5">
              {displayedCountries.map((country) => (
                <li key={country.id}>
                  <Link 
                    href={`/countries/${country.id}`}
                    className="text-[15px] font-bold text-black/80 hover:text-black hover:underline underline-offset-2 transition-all focus:outline-none focus:ring-2 focus:ring-black rounded-sm"
                  >
                    {country.name} Car Rental
                  </Link>
                </li>
              ))}
            </ul>
            {countries.length > 5 && (
              <button 
                onClick={() => setShowAll(!showAll)}
                aria-expanded={showAll}
                className="text-[12px] font-black text-black/60 hover:text-black transition-colors mt-1 block focus:outline-none focus:underline min-h-[20px]"
              >
                {showAll ? '- Show Less' : `+ Show ${countries.length - 5} More`}
              </button>
            )}
          </motion.div>
        </div>

        <div className="border-t-2 border-black mb-4" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 w-full md:w-auto">
            <p className="text-[13px] font-bold text-black">
              Copyright © 2026.
            </p>
            <div className="flex gap-2">
              {[
                { name: 'Facebook', icon: <Facebook size={16} fill="currentColor" strokeWidth={0} aria-hidden="true" />, href: '#' },
                { name: 'Instagram', icon: <Instagram size={16} aria-hidden="true" />, href: '#' },
                { name: 'LinkedIn', icon: <Linkedin size={16} fill="currentColor" strokeWidth={0} aria-hidden="true" />, href: '#' },
                { name: 'X', icon: <XIcon size={14} />, href: '#' },
                { name: 'Email', icon: <Mail size={16} aria-hidden="true" />, href: 'mailto:info@autours.com' }
              ].map((social, i) => (
                <motion.a 
                  key={i} 
                  href={social.href}
                  aria-label={`Follow us on ${social.name}`} // 🚀 التأكيد على تواجد الـ Aria-label
                  whileHover={{ y: -2 }}
                  className="w-8 h-8 bg-black text-primary rounded flex items-center justify-center hover:bg-black/90 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <p className="text-[13px] font-black text-black">
              Payment Methods
            </p>
            <div className="flex items-center gap-2">
              <div className="h-8 w-12 rounded-sm flex items-center justify-center p-1 bg-white shadow-sm relative">
                <Image src={assets.payment.visa} alt="Visa Accepted" fill sizes="48px" quality={60} loading="lazy" className="object-contain p-1" />
              </div>
              <div className="h-8 w-12 rounded-sm flex items-center justify-center p-1 bg-white shadow-sm relative">
                <Image src={assets.payment.mastercard} alt="Mastercard Accepted" fill sizes="48px" quality={60} loading="lazy" className="object-contain p-1" />
              </div>
              <div className="h-8 w-12 rounded-sm flex items-center justify-center p-0.5 overflow-hidden bg-white shadow-sm relative">
                <Image src={assets.payment.knet} alt="KNET Accepted" fill sizes="48px" quality={60} loading="lazy" className="object-contain p-0.5" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}