'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Facebook, Instagram, Linkedin, Mail 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { assets } from '@/config/assets';
import { countries } from '@/data/countries';
import { siteConfig } from '@/config/site';

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
    { name: 'Why Autours?', href: '/why_autours' },
    { name: 'Our Blogs', href: '/blogs' },
    { name: 'Car Rental Brands', href: '/car-rental-brands' },
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
  const [emailHref, setEmailHref] = useState('javascript:void(0)');

  useEffect(() => {
    setEmailHref('mailto:' + siteConfig.contact.email);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Order of countries in footer: UAE, Turkey, Morocco, Jordan, Oman
  const footerCountryIds = ['uae', 'turkey', 'morocco', 'jordan', 'oman'];
  const displayedCountries = footerCountryIds
    .map(id => countries.find(c => c.id === id))
    .filter(Boolean);

  return (
    <>
      {/* Dark Slate Divider Bar */}
      <div className="w-full h-[3px] sm:h-[6px] md:h-[10px] bg-[#0f172a]" />

      <footer className="bg-primary pt-10 pb-6 text-black border-t border-black/5">
      <div className="max-w-7xl xl:max-w-[90rem] 2xl:max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-6 border-b border-black/10 pb-4"
        >
          <Link href="/" aria-label="Autours Home" className="inline-block group focus:outline-none rounded-lg">
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
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="space-y-2"
            >
              <h2 className="text-sm sm:text-base lg:text-[17px] xl:text-[18px] 2xl:text-lg font-black text-black">
                {category}
              </h2>
              <ul className="space-y-0.5">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      onClick={(e) => scrollToSection(e, link.href)}
                      className="text-[13px] sm:text-[14px] lg:text-[15px] xl:text-[16px] 2xl:text-[17px] font-bold text-black/80 hover:text-black hover:underline underline-offset-2 transition-all focus:outline-none rounded-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="space-y-2 min-h-[160px]" // Fix CLS by reserving space
          >
            <h2 className="text-sm sm:text-base lg:text-[17px] xl:text-[18px] 2xl:text-lg font-black text-black">
              Location
            </h2>
            <ul className="space-y-0.5">
              {displayedCountries.map((country) => (
                <li key={country?.id}>
                  <Link 
                    href={`/countries/${country?.id}`}
                    className="text-[13px] sm:text-[14px] lg:text-[15px] xl:text-[16px] 2xl:text-[17px] font-bold text-black/80 hover:text-black hover:underline underline-offset-2 transition-all focus:outline-none rounded-sm"
                  >
                    {country?.name} Car Rental
                  </Link>
                </li>
              ))}
            </ul>
            <Link 
              href="/where-we-are"
              className="text-[11px] sm:text-[12px] font-black text-black/60 hover:text-black hover:underline transition-colors mt-2 block focus:outline-none min-h-[20px]"
            >
              + View All Locations
            </Link>
          </motion.div>
        </div>

        <div className="border-t-2 border-black mb-4" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
          
          {/* Mobile Layout (Shown only on mobile) */}
          <div className="flex md:hidden flex-col items-center gap-5 w-full">
            {/* Social Icons */}
            <div className="flex flex-row justify-center gap-3">
              {[
                { name: 'Facebook', icon: <Facebook size={18} fill="currentColor" strokeWidth={0} aria-hidden="true" />, href: siteConfig.socials.facebook },
                { name: 'Instagram', icon: <Instagram size={18} aria-hidden="true" />, href: siteConfig.socials.instagram },
                { name: 'LinkedIn', icon: <Linkedin size={18} fill="currentColor" strokeWidth={0} aria-hidden="true" />, href: siteConfig.socials.linkedin },
                { name: 'X', icon: <XIcon size={16} />, href: siteConfig.socials.x },
                { name: 'Email', icon: <Mail size={18} aria-hidden="true" />, href: emailHref }
              ].map((social, i) => (
                <motion.a 
                  key={i} 
                  href={social.href}
                  target={social.name === 'Email' ? undefined : '_blank'}
                  rel={social.name === 'Email' ? undefined : 'noopener noreferrer'}
                  aria-label={`Follow us on ${social.name}`}
                  whileHover={{ y: -2 }}
                  className="w-9 h-9 bg-black text-primary rounded-xl flex items-center justify-center hover:bg-black/90 transition-all shadow-sm focus:outline-none"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>

            {/* Payment Methods */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-[11px] font-black text-black uppercase tracking-wider">
                Payment Methods
              </p>
              <div className="flex items-center gap-2">
                <div className="h-6 w-9 rounded-sm flex items-center justify-center p-0.5 bg-white shadow-sm relative border border-black/5">
                  <Image src={assets.payment.visa} alt="Visa Accepted" fill sizes="44px" quality={60} loading="lazy" className="object-contain p-0.5" />
                </div>
                <div className="h-6 w-9 rounded-sm flex items-center justify-center p-0.5 bg-white shadow-sm relative border border-black/5">
                  <Image src={assets.payment.mastercard} alt="Mastercard Accepted" fill sizes="44px" quality={60} loading="lazy" className="object-contain p-0.5" />
                </div>
                <div className="h-6 w-6 rounded-sm flex items-center justify-center bg-white shadow-sm relative border border-black/5 overflow-hidden">
                  <Image src={assets.payment.knet} alt="KNET Accepted" fill sizes="44px" quality={60} loading="lazy" className="object-contain p-0" />
                </div>
              </div>
            </div>

            {/* Copyright */}
            <p className="text-xs font-bold text-black/60 text-center">
              Copyright © 2026.
            </p>
          </div>

          {/* Desktop Layout (Shown only on md screens and up) */}
          <div className="hidden md:flex flex-row justify-between items-center w-full">
            {/* Left: Copyright & Socials */}
            <div className="flex flex-row items-center gap-6">
              <p className="text-[13px] xl:text-[14px] 2xl:text-[15px] font-bold text-black whitespace-nowrap">
                Copyright © 2026.
              </p>
              <div className="flex gap-2">
                {[
                  { name: 'Facebook', icon: <Facebook size={16} fill="currentColor" strokeWidth={0} aria-hidden="true" />, href: siteConfig.socials.facebook },
                  { name: 'Instagram', icon: <Instagram size={16} aria-hidden="true" />, href: siteConfig.socials.instagram },
                  { name: 'LinkedIn', icon: <Linkedin size={16} fill="currentColor" strokeWidth={0} aria-hidden="true" />, href: siteConfig.socials.linkedin },
                  { name: 'X', icon: <XIcon size={14} />, href: siteConfig.socials.x },
                  { name: 'Email', icon: <Mail size={16} aria-hidden="true" />, href: emailHref }
                ].map((social, i) => (
                  <motion.a 
                    key={i} 
                    href={social.href}
                    target={social.name === 'Email' ? undefined : '_blank'}
                    rel={social.name === 'Email' ? undefined : 'noopener noreferrer'}
                    aria-label={`Follow us on ${social.name}`}
                    whileHover={{ y: -2 }}
                    className="w-8 h-8 bg-black text-primary rounded flex items-center justify-center hover:bg-black/90 transition-all shadow-sm focus:outline-none"
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Right: Payment Methods */}
            <div className="flex items-center gap-4 justify-end">
              <p className="text-[13px] xl:text-[14px] 2xl:text-[15px] font-black text-black">
                Payment Methods
              </p>
              <div className="flex items-center gap-2">
                <div className="h-7 sm:h-8 w-11 sm:w-12 rounded-sm flex items-center justify-center p-1 bg-white shadow-sm relative border border-black/5">
                  <Image src={assets.payment.visa} alt="Visa Accepted" fill sizes="48px" className="object-contain p-1" />
                </div>
                <div className="h-7 sm:h-8 w-11 sm:w-12 rounded-sm flex items-center justify-center p-1 bg-white shadow-sm relative border border-black/5">
                  <Image src={assets.payment.mastercard} alt="Mastercard Accepted" fill sizes="48px" className="object-contain p-1" />
                </div>
                <div className="h-7 sm:h-8 w-7 sm:w-8 rounded-sm flex items-center justify-center bg-white shadow-sm relative border border-black/5 overflow-hidden">
                  <Image src={assets.payment.knet} alt="KNET Accepted" fill sizes="48px" className="object-contain p-0" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>
    </>
  );
}