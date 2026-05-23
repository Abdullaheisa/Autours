'use client';

import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Twitter, Mail, MapPin, Phone } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { assets } from '@/config/assets';
import { footerLinks } from '@/config/navigation';

export default function LandingFooter() {
  return (
    <footer className="bg-primary pt-24 pb-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand */}
          <div className="space-y-8">
            <Link href="/" className="flex flex-col items-start group">
              <img 
                src={assets.logo} 
                alt={siteConfig.name} 
                className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto object-contain transition-all" 
              />
            </Link>
            
            <div className="flex flex-col gap-5 text-sm font-bold text-black/80">
               <div className="flex items-center gap-4 group cursor-pointer">
                 <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <Mail size={18} />
                 </div>
                 <span>{siteConfig.contact.email}</span>
               </div>
               <div className="flex items-center gap-4 group cursor-pointer">
                 <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <Phone size={18} />
                 </div>
                 <span>{siteConfig.contact.phone}</span>
               </div>
               <div className="flex items-center gap-4 group cursor-pointer">
                 <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <MapPin size={18} />
                 </div>
                 <span>{siteConfig.contact.address}</span>
               </div>
            </div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-black text-black uppercase tracking-[0.3em] mb-10 border-b border-black/10 pb-4 italic">Company</h4>
              <ul className="space-y-4">
                {footerLinks.company.map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} className="text-sm font-bold text-black/60 hover:text-black hover:translate-x-2 inline-block transition-all">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-black text-black uppercase tracking-[0.3em] mb-10 border-b border-black/10 pb-4 italic">Support</h4>
              <ul className="space-y-4">
                {footerLinks.support.map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} className="text-sm font-bold text-black/60 hover:text-black hover:translate-x-2 inline-block transition-all">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter / Social */}
          <div className="space-y-8">
            <h4 className="text-sm font-black text-black uppercase tracking-[0.3em] mb-10 border-b border-black/10 pb-4 italic">Stay Connected</h4>
            <p className="text-xs font-bold text-black/60 leading-relaxed uppercase tracking-widest">
              Follow us on social media for exclusive offers and updates.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Linkedin, Twitter].map((Icon, i) => (
                <Link key={i} href="#" className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center hover:bg-white hover:text-black hover:scale-110 transition-all shadow-xl shadow-black/10">
                  <Icon size={20} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-12 border-t border-black/10 flex flex-col md:flex-row justify-between items-center gap-10">
          <p className="text-[10px] font-black text-black/40 uppercase tracking-widest">
            {siteConfig.footer.copyright}
          </p>
          
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">Secure Payments:</span>
            <div className="flex gap-3">
              <div className="h-10 px-4 bg-white/50 rounded-xl flex items-center justify-center border border-black/5 hover:bg-white transition-colors cursor-help">
                <span className="text-[10px] font-black italic tracking-tighter">VISA</span>
              </div>
              <div className="h-10 px-4 bg-white/50 rounded-xl flex items-center justify-center border border-black/5 hover:bg-white transition-colors cursor-help">
                <span className="text-[10px] font-black italic tracking-tighter">MASTERCARD</span>
              </div>
              <div className="h-10 px-4 bg-white/50 rounded-xl flex items-center justify-center border border-black/5 hover:bg-white transition-colors cursor-help">
                <span className="text-[10px] font-black italic tracking-tighter text-blue-600">KNET</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
