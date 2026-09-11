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
    { id: 'booking', label: 'حجز سيارة 🚗', icon: Car },
    { id: 'manage', label: 'الحجوزات والإلغاء 📋', icon: FileText },
    { id: 'insurance', label: 'التأمين والأوراق 🛡️', icon: ShieldCheck },
    { id: 'support', label: 'الدعم والموردين 🤝', icon: Headphones },
  ];

  const promptGroups: Record<TabType, { icon: any; text: string; label: string }[]> = {
    booking: [
      {
        icon: Plane,
        text: 'عربيات مطار دبي من بكرة لمدة 3 أيام',
        label: 'مطار دبي (3 أيام)',
      },
      {
        icon: Flame,
        text: 'أرخص عربية اقتصادية متاحة الأسبوع ده',
        label: 'أرخص سيارة اقتصادية',
      },
      {
        icon: Car,
        text: 'محتاج سيارة عائلية 7 راكب SUV في القاهرة',
        label: 'سيارة عائلية SUV',
      },
      {
        icon: Sparkles,
        text: 'عربيات فخمة VIP في الرياض',
        label: 'سيارات VIP فاخرة',
      },
    ],
    manage: [
      {
        icon: FileText,
        text: 'عايز استعلم عن تفاصيل حجزي وفاتورتي',
        label: 'استعلام عن حجز',
      },
      {
        icon: ShieldCheck,
        text: 'كيف ألغي حجزي مجاناً في Autours؟',
        label: 'شروط الإلغاء المجاني',
      },
      {
        icon: UserCheck,
        text: 'أين أجد قائمة حجوزاتي السابقة؟',
        label: 'سجل الحجوزات',
      },
    ],
    insurance: [
      {
        icon: ShieldCheck,
        text: 'إيه نظام التأمين والوديعة في Autours؟',
        label: 'التأمين والوديعة',
      },
      {
        icon: HelpCircle,
        text: 'ما هي الأوراق ورخصة القيادة المطلوبة للاستلام؟',
        label: 'الأوراق المطلوبة',
      },
      {
        icon: Flame,
        text: 'هل يتوفر خيار الدفع عند الاستلام كاش أو فيزا؟',
        label: 'الدفع عند الاستلام',
      },
    ],
    support: [
      {
        icon: Briefcase,
        text: 'كيف أسجل شركتي كمورد سيارات شريك في Autours؟',
        label: 'تسجيل مورد جديد',
      },
      {
        icon: Headphones,
        text: 'أريد التواصل المباشر مع خدمة العملاء عبر واتساب',
        label: 'محادثة الدعم الفني',
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
              className="bg-[#151922] hover:bg-[#1f2533] text-neutral-200 hover:text-[#f9d602] border border-neutral-800/90 hover:border-[#f9d602]/60 text-xs px-3 py-1.5 rounded-xl transition-all duration-200 flex items-center gap-1.5 shadow-sm active:scale-95 text-right"
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
