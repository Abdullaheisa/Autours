'use client';

import { useState } from 'react';
import {
  Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';

// Data - move to contactData.ts
const contactInfoData = [
  {
    icon: Mail,
    label: 'Email Us',
    labelAr: 'راسلنا',
    value: 'info@autours.net',
    href: 'mailto:info@autours.net',
  },
  {
    icon: Phone,
    label: 'Call Us',
    labelAr: 'اتصل بنا',
    value: '361-688-5824',
    href: 'tel:+13616885824',
  },
  {
    icon: MapPin,
    label: 'Our Location',
    labelAr: 'موقعنا',
    value: '4826 White Avenue, Corpus Christi, Texas',
    href: 'https://maps.google.com/?q=4826+White+Avenue,+Corpus+Christi,+Texas',
  },
];

const socialLinksData = [
  {
    name: 'X (Twitter)',
    icon: Twitter,
    url: 'https://x.com/Autours_',
    color: '#000000',
  },
  {
    name: 'LinkedIn',
    icon: Linkedin,
    url: 'https://www.linkedin.com/company/autours/',
    color: '#0A66C2',
  },
  {
    name: 'Facebook',
    icon: Facebook,
    url: 'https://web.facebook.com/people/Autours/61560740824598/',
    color: '#1877F2',
  },
  {
    name: 'Instagram',
    icon: Instagram,
    url: 'https://www.instagram.com/autours_/',
    color: '#E4405F',
  },
];

export default function Contact() {
  const [hoveredSocial, setHoveredSocial] = useState<number | null>(null);

  return (
    <section id="contact" className="relative overflow-hidden bg-white w-full">
      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">

          {/* Left: Contact Info */}
          <div className="relative z-10 space-y-6 lg:max-w-lg py-4">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl md:text-4xl font-black text-gray-900 mb-1 uppercase tracking-tight">
                Contact Us
              </h3>
              <div className="w-20 h-1.5 bg-primary rounded-full" />
            </motion.div>

            <div className="space-y-3">
              {contactInfoData.map((item, i) => (
                <motion.a
                  key={i}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  whileHover={{ x: 8 }}
                  className="group flex items-center gap-5 py-1.5"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:rotate-6 transition-all duration-300">
                    <item.icon
                      size={24}
                      className="text-primary group-hover:text-gray-900 transition-colors duration-300"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="flex-1 min-w-0 border-b border-gray-50 pb-1 group-hover:border-primary/10 transition-colors">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-0.5">
                      {item.label}
                    </p>
                    <p className="text-lg md:text-xl font-black text-gray-900 group-hover:text-primary transition-colors truncate">
                      {item.value}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-gray-100 flex items-center justify-center group-hover:border-primary group-hover:bg-primary transition-all shrink-0">
                    <ArrowUpRight
                      size={14}
                      className="text-gray-200 group-hover:text-gray-900 transition-colors"
                    />
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="pt-6"
            >
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.25em] mb-4">
                Connect With Us
              </p>
              <div className="flex gap-3">
                {socialLinksData.map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.08, type: "spring" }}
                    whileHover={{ y: -4, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onHoverStart={() => setHoveredSocial(i)}
                    onHoverEnd={() => setHoveredSocial(null)}
                    className="relative w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center transition-all duration-300 shadow-sm"
                    style={{
                      backgroundColor: hoveredSocial === i ? social.color : '#f9fafb'
                    }}
                  >
                    <social.icon
                      size={20}
                      className="transition-colors duration-300"
                      style={{
                        color: hoveredSocial === i ? '#ffffff' : '#9ca3af'
                      }}
                      strokeWidth={1.5}
                    />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Image: Hidden on mobile/tablet, aligned on desktop */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="hidden lg:flex relative right-[-33px] w-full items-center justify-center lg:justify-end"
          >
            <img
              src="/img/contactus.png"
              alt="Contact Autours"
              className="w-full h-full max-h-[450px] object-contain object-right select-none"
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}