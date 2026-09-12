'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Car,
  Plane,
  ShieldCheck,
  Flame,
  FileText,
  UserCheck,
  HelpCircle,
  Briefcase,
  Headphones,
} from 'lucide-react';

interface QuickPromptChipsProps {
  onSelectPrompt: (promptText: string) => void;
}

type TabType = 'booking' | 'manage' | 'insurance' | 'support';

export default function QuickPromptChips({ onSelectPrompt }: QuickPromptChipsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('booking');

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'booking', label: 'Book a Car 🚗', icon: Car },
    { id: 'manage', label: 'Bookings & Cancellation 📋', icon: FileText },
    { id: 'insurance', label: 'Insurance & Docs 🛡️', icon: ShieldCheck },
    { id: 'support', label: 'Support & Suppliers 🤝', icon: Headphones },
  ];

  const promptGroups: Record<TabType, { icon: any; text: string; label: string }[]> = {
    booking: [
      {
        icon: Plane,
        text: 'Cars at Dubai Airport tomorrow for 3 days',
        label: 'Dubai Airport (3 days)',
      },
      {
        icon: Flame,
        text: 'Cheapest economy car available this week',
        label: 'Cheapest Economy Car',
      },
      {
        icon: Car,
        text: 'I need a 7-seat family SUV in Cairo',
        label: 'Family SUV (7 seats)',
      },
      {
        icon: Sparkles,
        text: 'Luxury VIP cars available in Riyadh',
        label: 'Luxury VIP Cars',
      },
    ],
    manage: [
      {
        icon: FileText,
        text: 'I want to check my booking details and invoice',
        label: 'Check My Booking',
      },
      {
        icon: ShieldCheck,
        text: 'How can I cancel my booking for free on Autours?',
        label: 'Free Cancellation Terms',
      },
      {
        icon: UserCheck,
        text: 'Where can I find my previous bookings history?',
        label: 'Booking History',
      },
    ],
    insurance: [
      {
        icon: ShieldCheck,
        text: 'What is the insurance and deposit policy on Autours?',
        label: 'Insurance & Deposit',
      },
      {
        icon: HelpCircle,
        text: 'What documents and driving license are required for pickup?',
        label: 'Required Documents',
      },
      {
        icon: Flame,
        text: 'Is cash or card payment available upon pickup?',
        label: 'Payment at Pickup',
      },
    ],
    support: [
      {
        icon: Briefcase,
        text: 'How can I register my company as a car rental supplier on Autours?',
        label: 'Register as Supplier',
      },
      {
        icon: Headphones,
        text: 'I want to contact customer support via WhatsApp',
        label: 'WhatsApp Support',
      },
    ],
  };

  return (
    <div className="flex flex-col gap-2 py-2 select-none">
      {/* Category Tabs - No Scrollbar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 shrink-0 ${
                isActive
                  ? 'bg-[#f9d602] text-neutral-950 font-bold shadow-md shadow-[#f9d602]/20 scale-[1.02]'
                  : 'bg-neutral-900/90 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Prompt Chips - Modern Clean Grid */}
      <div className="flex flex-wrap gap-1.5">
        {promptGroups[activeTab].map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.text)}
              className="bg-[#151922] hover:bg-[#1f2533] text-neutral-200 hover:text-[#f9d602] border border-neutral-800/90 hover:border-[#f9d602]/60 text-xs px-3 py-1.5 rounded-xl transition-all duration-200 flex items-center gap-1.5 shadow-sm active:scale-95 text-left"
            >
              <Icon className="w-3.5 h-3.5 text-[#f9d602] shrink-0" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
