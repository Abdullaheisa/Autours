'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  X,
  Send,
  RotateCcw,
  Bot,
  User,
  Mic,
  MicOff,
  PhoneCall,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  History,
  Plus,
  Trash2,
} from 'lucide-react';
import { RootState } from '@/store';
import ChatCarCard from './ChatCarCard';
import InChatBookingForm from './InChatBookingForm';
import InChatSearchWidget from './InChatSearchWidget';
import { Vehicle } from '@/types';
import { processChatWithGemini } from '@/services/aiAssistantService';

interface ActionButton {
  label: string;
  url?: string;
  actionType?: 'link' | 'prompt' | 'whatsapp' | 'call';
  promptText?: string;
}

interface ConfirmedBookingVoucher {
  orderNumber: string;
  vehicleName: string;
  dateFrom: string;
  dateTo: string;
  timeFrom: string;
  timeTo: string;
  pickupLoc: string;
  customerName: string;
  phone: string;
  email: string;
  totalPrice: number;
  currency: string;
  days: number;
  supplierCompany?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  vehicles?: Vehicle[];
  searchCriteria?: any;
  actionButtons?: ActionButton[];
  voucher?: ConfirmedBookingVoucher;
  showSearchWidget?: boolean;
  searchWidgetData?: {
    defaultLocation?: string;
    dateFrom?: string;
    dateTo?: string;
    startTime?: string;
    endTime?: string;
  };
}



function FormattedText({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="space-y-1 text-[13px] leading-relaxed text-gray-800">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-0.5" />;

        const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-');
        const clean = isBullet ? trimmed.replace(/^[•\-]\s*/, '') : trimmed;

        const parts = clean.split(/(\*\*.*?\*\*)/g);
        const rendered = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="text-amber-700 font-bold">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <span key={pIdx}>{part}</span>;
        });

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pr-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
              <span>{rendered}</span>
            </div>
          );
        }

        return <p key={idx}>{rendered}</p>;
      })}
    </div>
  );
}

const INITIAL_MSG: ChatMessage = {
  id: 'init',
  role: 'assistant',
  content: `Please choose your preferred language / يرجى اختيار لغة المحادثة:`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  actionButtons: [
    { label: '🇸🇦 العربية', promptText: 'المتابعة باللغة العربية' },
    { label: '🇬🇧 English', promptText: 'Continue in English' },
  ],
};

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  searchCriteria?: any;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'autours_ai_chat_history_v3';
const SESSIONS_STORAGE_KEY = 'autours_ai_chat_sessions_v2';
const ACTIVE_SESSION_STORAGE_KEY = 'autours_ai_active_session_id_v2';

function generateSessionTitle(msgs: ChatMessage[]): string {
  const firstUser = msgs.find((m) => m.role === 'user');
  if (!firstUser) return 'محادثة جديدة / New Chat';

  const clean = firstUser.content.trim();
  const searchMatch = clean.match(/(?:Available cars at|سيارات في|أريد سيارات في|ابحث عن سيارات في)\s+([^-\n,]+)/i);
  if (searchMatch) {
    return `🚗 ${searchMatch[1].trim()}`;
  }
  if (clean.includes('المتابعة باللغة العربية') || clean.includes('عربي')) {
    const secondUser = msgs.filter((m) => m.role === 'user')[1];
    if (secondUser) {
      return secondUser.content.slice(0, 30).trim() + (secondUser.content.length > 30 ? '...' : '');
    }
    return 'محادثة بالعربية';
  }
  if (clean.includes('Continue in English') || clean.includes('English')) {
    const secondUser = msgs.filter((m) => m.role === 'user')[1];
    if (secondUser) {
      return secondUser.content.slice(0, 30).trim() + (secondUser.content.length > 30 ? '...' : '');
    }
    return 'English Chat';
  }

  return clean.slice(0, 30).trim() + (clean.length > 30 ? '...' : '');
}

export default function AIChatAssistant() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MSG]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [showHistoryDrawer, setShowHistoryDrawer] = useState<boolean>(false);
  const [isListening, setIsListening] = useState(false);
  const [activeBookingVehicle, setActiveBookingVehicle] = useState<Vehicle | null>(null);
  const [currentSearchCriteria, setCurrentSearchCriteria] = useState<any>(null);
  const [userMemory, setUserMemory] = useState<any>(null);

  const currencyCode = useSelector((state: RootState) => state.currency.code) || 'AED';
  const reduxSearchParams = useSelector((state: RootState) => state.search.searchParams);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const isLoadedRef = useRef(false);

  // 💾 1. استعادة جلسات المحادثة والذاكرة التراكمية من LocalStorage عند تحميل الصفحة
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
        const savedActiveId = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
        let parsedSessions: ChatSession[] = [];
        if (savedSessions) {
          try {
            parsedSessions = JSON.parse(savedSessions);
          } catch {
            parsedSessions = [];
          }
        }

        // Migrate from legacy single-session storage if exists
        if (!Array.isArray(parsedSessions) || parsedSessions.length === 0) {
          const legacySaved = localStorage.getItem(STORAGE_KEY);
          let legacyMessages: ChatMessage[] | null = null;
          if (legacySaved) {
            try {
              legacyMessages = JSON.parse(legacySaved);
            } catch {}
          }
          const initialId = `session-${Date.now()}`;
          const newInitialSession: ChatSession = {
            id: initialId,
            title: legacyMessages && legacyMessages.length > 1 ? generateSessionTitle(legacyMessages) : 'محادثة جديدة / New Chat',
            messages: Array.isArray(legacyMessages) && legacyMessages.length > 0 ? legacyMessages : [INITIAL_MSG],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          parsedSessions = [newInitialSession];
        }

        setSessions(parsedSessions);

        const targetSession =
          parsedSessions.find((s) => s.id === savedActiveId) || parsedSessions[0];

        setActiveSessionId(targetSession.id);
        setMessages(targetSession.messages || [INITIAL_MSG]);
        if (targetSession.searchCriteria) {
          setCurrentSearchCriteria(targetSession.searchCriteria);
        }

        const savedMemory = localStorage.getItem('autours_ai_user_memory_v1');
        if (savedMemory) {
          setUserMemory(JSON.parse(savedMemory));
        }
      } catch (e) {
        console.warn('Could not restore chat history/sessions:', e);
      } finally {
        isLoadedRef.current = true;
      }
    }
  }, []);

  // 💾 2. حفظ الجلسة النشطة وجميع الجلسات في LocalStorage
  useEffect(() => {
    if (!isLoadedRef.current || !activeSessionId) return;
    if (typeof window !== 'undefined') {
      setSessions((prevSessions) => {
        const updated = prevSessions.map((s) => {
          if (s.id === activeSessionId) {
            const hasUserMsg = messages.some((m) => m.role === 'user');
            const autoTitle =
              s.title === 'محادثة جديدة / New Chat' || s.title === 'New Chat' || s.title.startsWith('محادثة')
                ? (hasUserMsg ? generateSessionTitle(messages) : s.title)
                : s.title;

            return {
              ...s,
              title: autoTitle,
              messages,
              searchCriteria: currentSearchCriteria,
              updatedAt: new Date().toISOString(),
            };
          }
          return s;
        });

        try {
          localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
          localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, activeSessionId);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        } catch (e) {
          console.warn('Could not save chat sessions:', e);
        }

        return updated;
      });
    }
  }, [messages, activeSessionId, currentSearchCriteria]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper to detect touch / mobile screen
  const isTouchDevice = () => {
    if (typeof window === 'undefined') return false;
    return (
      window.innerWidth < 768 ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches
    );
  };

  // 📜 Scroll to bottom smoothly when messages change or booking form opens
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, activeBookingVehicle]);

  // ⌨️ Auto-focus input ONLY on desktop when the user manually opens the chat dialog
  // On mobile devices, NEVER auto-focus to prevent virtual keyboard from popping up and covering the chat!
  useEffect(() => {
    if (isOpen && !isTouchDevice()) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Voice setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SR) {
        const rec = new SR();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'ar-SA';
        rec.onresult = (e: any) => {
          const transcript = e.results[0][0].transcript;
          if (transcript) setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsListening(false);
        };
        rec.onerror = () => setIsListening(false);
        rec.onend = () => setIsListening(false);
        recognitionRef.current = rec;
      }
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };



  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const payload = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('token') || sessionStorage.getItem('token')
          : null;

      let data: any = null;

      try {
        const res = await fetch('/api/assistant/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            messages: payload,
            currency: currencyCode,
            currentSearchParams: reduxSearchParams,
            customerToken: token,
            currentUser:
              isAuthenticated && user
                ? {
                    name: user.name,
                    email: user.email,
                    phone: user.phone_num,
                    role: user.role,
                    country: user.country,
                  }
                : null,
            userMemory,
          }),
        });

        if (res.ok) {
          data = await res.json();
        }
      } catch (serverErr) {
        console.warn('Server chat API error, switching to direct AI engine:', serverErr);
      }

      // If server API route is unavailable or failed, run Direct Client-Side AI Engine!
      if (!data || !data.reply || data.reply.includes('أنا تحت أمرك فوراً')) {
        data = await processChatWithGemini({
          messages: payload,
          currency: currencyCode,
          userMemory,
          currentUser:
            isAuthenticated && user
              ? {
                  name: user.name,
                  email: user.email,
                  phone: user.phone_num,
                  role: user.role,
                  country: user.country,
                }
              : null,
        });
      }

      if (data.searchCriteria) {
        setCurrentSearchCriteria(data.searchCriteria);
      }

      if (data.userMemory) {
        setUserMemory(data.userMemory);
        try {
          localStorage.setItem('autours_ai_user_memory_v1', JSON.stringify(data.userMemory));
        } catch (e) {
          console.warn('Could not persist learned user memory:', e);
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: data.reply || 'تم استلام طلبك.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          vehicles: data.vehicles || [],
          searchCriteria: data.searchCriteria,
          actionButtons: data.actionButtons || [],
          showSearchWidget: data.showSearchWidget,
          searchWidgetData: data.searchWidgetData,
        },
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'عذراً، حدث خطأ مؤقت. يرجى المحاولة مرة أخرى.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWidgetSearch = (searchData: {
    location: string | number;
    locationName: string;
    country?: string;
    dateFrom: string;
    dateTo: string;
    startTime: string;
    endTime: string;
  }) => {
    // Determine language preference from past conversation
    const isArabic = messages.some(
      (m) =>
        m.content.includes('المتابعة باللغة العربية') ||
        (m.role === 'assistant' && /[\u0600-\u06FF]/.test(m.content) && !m.content.includes('Please choose'))
    );
    const searchText = isArabic
      ? `أريد سيارات في ${searchData.locationName} من ${searchData.dateFrom} إلى ${searchData.dateTo}`
      : `Available cars at ${searchData.locationName} from ${searchData.dateFrom} to ${searchData.dateTo}`;
    
    handleSendMessage(searchText);
  };

  const handleActionClick = (btn: ActionButton) => {
    if (btn.actionType === 'whatsapp' || (btn.url && btn.url.startsWith('http'))) {
      window.open(btn.url, '_blank');
    } else if (btn.url) {
      setIsOpen(false);
      router.push(btn.url);
    } else if (btn.promptText) {
      handleSendMessage(btn.promptText);
    }
  };

  const handleStartBooking = (vehicle: Vehicle) => {
    setActiveBookingVehicle(vehicle);
  };

  const handleBookingCompleted = (voucher: ConfirmedBookingVoucher) => {
    setActiveBookingVehicle(null);
    const isArabic = messages.some(
      (m) =>
        m.content.includes('المتابعة باللغة العربية') ||
        (m.role === 'assistant' && /[\u0600-\u06FF]/.test(m.content) && !m.content.includes('Please choose'))
    );
    setMessages((prev) => [
      ...prev,
      {
        id: `voucher-${Date.now()}`,
        role: 'assistant',
        content: isArabic
          ? `🎉 **مبروك يا فندم! تم تأكيد حجزك بنجاح**\nتم تسجيل الحجز في النظام وإرسال تفاصيل الحجز إلى بريدك الإلكتروني. إليك ملخص قسيمة الحجز:`
          : `🎉 **Congratulations! Your booking is confirmed**\nYour booking has been registered in the system and confirmation details have been sent to your email. Here is your voucher summary:`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        voucher,
        actionButtons: [
          { label: isArabic ? '💬 تواصل واتساب مع الدعم' : '💬 WhatsApp Support', url: 'https://wa.me/96560480382', actionType: 'whatsapp' },
          { label: isArabic ? '👤 صفحة حجوزاتي' : '👤 My Bookings', url: '/profile', actionType: 'link' },
        ],
      },
    ]);
  };

  const handleStartNewChat = () => {
    const currentSession = sessions.find((s) => s.id === activeSessionId);
    if (
      currentSession &&
      currentSession.messages.length === 1 &&
      currentSession.messages[0].id === 'init'
    ) {
      setShowHistoryDrawer(false);
      return;
    }

    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: 'محادثة جديدة / New Chat',
      messages: [INITIAL_MSG],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    setActiveSessionId(newId);
    setMessages([INITIAL_MSG]);
    setCurrentSearchCriteria(null);
    setActiveBookingVehicle(null);
    setShowHistoryDrawer(false);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updatedSessions));
        localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, newId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify([INITIAL_MSG]));
        localStorage.removeItem('autours_ai_search_criteria_v1');
      } catch (e) {
        console.warn('Failed to save new session:', e);
      }
    }
  };

  const handleSelectSession = (session: ChatSession) => {
    setActiveSessionId(session.id);
    setMessages(session.messages || [INITIAL_MSG]);
    setCurrentSearchCriteria(session.searchCriteria || null);
    setActiveBookingVehicle(null);
    setShowHistoryDrawer(false);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, session.id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session.messages || [INITIAL_MSG]));
        if (session.searchCriteria) {
          localStorage.setItem('autours_ai_search_criteria_v1', JSON.stringify(session.searchCriteria));
        } else {
          localStorage.removeItem('autours_ai_search_criteria_v1');
        }
      } catch (e) {
        console.warn('Failed to persist active session switch:', e);
      }
    }
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = sessions.filter((s) => s.id !== sessionId);

    if (remaining.length === 0) {
      const newId = `session-${Date.now()}`;
      const newSession: ChatSession = {
        id: newId,
        title: 'محادثة جديدة / New Chat',
        messages: [INITIAL_MSG],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSessions([newSession]);
      setActiveSessionId(newId);
      setMessages([INITIAL_MSG]);
      setCurrentSearchCriteria(null);
      if (typeof window !== 'undefined') {
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify([newSession]));
        localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, newId);
      }
      return;
    }

    setSessions(remaining);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(remaining));
    }

    if (sessionId === activeSessionId) {
      const nextSession = remaining[0];
      setActiveSessionId(nextSession.id);
      setMessages(nextSession.messages || [INITIAL_MSG]);
      setCurrentSearchCriteria(nextSession.searchCriteria || null);
      if (typeof window !== 'undefined') {
        localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, nextSession.id);
      }
    }
  };

  const handleClearAllHistory = () => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: 'محادثة جديدة / New Chat',
      messages: [INITIAL_MSG],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSessions([newSession]);
    setActiveSessionId(newId);
    setMessages([INITIAL_MSG]);
    setCurrentSearchCriteria(null);
    setActiveBookingVehicle(null);
    setShowHistoryDrawer(false);

    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify([newSession]));
      localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, newId);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('autours_ai_search_criteria_v1');
    }
  };

  return (
    <div className="font-sans" dir="ltr">
      {/* ── Compact Floating Button (Smooth Zero-Jump Transition) ────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="chat-launcher-btn"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-5 right-4 sm:right-5 sm:bottom-5 z-[9999] group flex items-center justify-center w-14 h-14 rounded-full bg-[#f9d602] hover:bg-[#ffe54c] text-neutral-950 shadow-[0_10px_28px_rgba(249,214,2,0.5),0_3px_12px_rgba(0,0,0,0.15)] hover:scale-105 active:scale-95 transition-transform duration-150 cursor-pointer touch-manipulation"
            style={{ bottom: 'max(1.25rem, calc(0.75rem + env(safe-area-inset-bottom, 0px)))' }}
            title="Autours AI Assistant"
          >
            <span className="absolute -inset-1 rounded-full bg-[#f9d602]/35 animate-ping pointer-events-none" />
            <MessageCircle className="w-7 h-7 text-neutral-950 fill-neutral-950 group-hover:scale-110 transition-transform" />
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#00c982] rounded-full ring-2 ring-white shadow-xs" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Sleek Modern Light Chat Window (Full Screen on Mobile, Floating on Desktop) ──────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window-modal"
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed inset-0 sm:inset-auto sm:bottom-5 sm:right-5 z-[9999] w-full sm:w-[425px] h-[100dvh] sm:h-[620px] sm:max-h-[88vh] bg-white sm:border sm:border-gray-300/80 sm:rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.25),0_6px_20px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden text-gray-900"
            style={{ overscrollBehavior: 'contain' }}
            onWheel={(e) => e.stopPropagation()}
          >
            {/* ── Header (Website Brand Yellow Matching Screenshot) ──────────── */}
            <div
              className="bg-[#f9d602] border-b border-amber-300/90 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between shrink-0 select-none text-neutral-950 shadow-xs"
              style={{ paddingTop: 'max(0.65rem, env(safe-area-inset-top, 0px))' }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-neutral-950 text-[#f9d602] flex items-center justify-center font-bold shadow-sm shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-black text-neutral-950 text-xs sm:text-[14.5px] leading-snug tracking-tight">
                      Autours AI Assistant
                    </h3>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00c982] inline-block ring-2 ring-white/90 shrink-0" />
                  </div>
                  <p className="text-[10.5px] text-neutral-800 font-bold leading-tight">
                    Instant Booking & 24/7 AI Support
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-neutral-900">
                {/* Chat History Button with Counter */}
                <button
                  onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
                  title="سجل المحادثات / Chat History"
                  className={`px-2 py-1 rounded-lg transition-colors font-bold flex items-center gap-1.5 cursor-pointer text-xs ${
                    showHistoryDrawer ? 'bg-black/20 text-neutral-950' : 'hover:bg-black/10 text-neutral-900'
                  }`}
                >
                  <History className="w-3.5 h-3.5 stroke-[2.4]" />
                  <span className="hidden sm:inline text-[11px] font-black">السجل</span>
                  {sessions.length > 1 && (
                    <span className="text-[9.5px] bg-neutral-950 text-[#f9d602] font-black px-1.5 py-0.5 rounded-full leading-none">
                      {sessions.length}
                    </span>
                  )}
                </button>

                {/* + New Chat Button */}
                <button
                  onClick={handleStartNewChat}
                  title="محادثة جديدة / New Chat"
                  className="p-1.5 hover:bg-black/10 rounded-lg transition-colors font-bold cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-4 h-4 text-neutral-900 stroke-[2.6]" />
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close"
                  className="p-1.5 hover:bg-black/10 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-neutral-900 stroke-[2.2]" />
                </button>
              </div>
            </div>

            {/* ── Slide-in Chat History Drawer ───────────────────────────────── */}
            <AnimatePresence>
              {showHistoryDrawer && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-x-0 top-[57px] bottom-0 z-50 bg-white flex flex-col overflow-hidden"
                >
                  {/* Drawer Header */}
                  <div className="p-3 border-b border-gray-200 bg-amber-50/80 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-400 text-neutral-950 flex items-center justify-center font-bold">
                        <History className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="text-xs font-black text-gray-950">سجل المحادثات (Chat History)</h4>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleStartNewChat}
                        className="flex items-center gap-1 bg-[#f9d602] hover:bg-amber-400 text-neutral-950 font-black text-[11px] px-2.5 py-1 rounded-lg transition-all shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>شات جديد</span>
                      </button>
                      <button
                        onClick={() => setShowHistoryDrawer(false)}
                        className="p-1 hover:bg-gray-200 text-gray-500 rounded-lg transition-colors cursor-pointer"
                        title="إغلاق السجل"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Sessions List */}
                  <div className="flex-1 overflow-y-auto p-2.5 space-y-2 bg-[#f8f9fa] scrollbar-thin">
                    {sessions.map((s) => {
                      const isActive = s.id === activeSessionId;
                      const userMsgsCount = (s.messages || []).filter((m) => m.role === 'user').length;
                      const lastMsg = s.messages && s.messages.length > 0 ? s.messages[s.messages.length - 1].content : '';
                      const formattedDate = new Date(s.updatedAt || s.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return (
                        <div
                          key={s.id}
                          onClick={() => handleSelectSession(s)}
                          className={`group relative p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                            isActive
                              ? 'bg-amber-50/95 border-amber-400 shadow-xs ring-1 ring-amber-400/40'
                              : 'bg-white border-gray-200 hover:border-amber-300 hover:shadow-xs'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="font-extrabold text-xs text-gray-900 truncate block">
                                {s.title || 'محادثة جديدة'}
                              </span>
                              {isActive && (
                                <span className="bg-amber-400 text-neutral-950 text-[9.5px] font-black px-1.5 py-0.5 rounded-md shrink-0">
                                  الحالي
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 truncate mb-1">
                              {lastMsg.slice(0, 45) || 'بدء المحادثة...'}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                              <span>{formattedDate}</span>
                              <span>•</span>
                              <span>{userMsgsCount} رسائل</span>
                            </div>
                          </div>

                          {/* Delete Session button */}
                          {sessions.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteSession(s.id, e)}
                              title="حذف هذه المحادثة من السجل"
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Drawer Footer */}
                  {sessions.length > 1 && (
                    <div className="p-2.5 bg-white border-t border-gray-200 flex items-center justify-between shrink-0">
                      <span className="text-[11px] text-gray-500 font-medium">
                        إجمالي المحادثات: <strong>{sessions.length}</strong>
                      </span>
                      <button
                        onClick={handleClearAllHistory}
                        className="text-[11px] text-red-600 hover:text-red-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>مسح السجل بالكامل</span>
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Messages List (Contrasting Crisp Feed) ─────────────────────── */}
            <div
              className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-[#f0f2f5] scrollbar-thin scrollbar-thumb-gray-300"
              style={{ overscrollBehavior: 'contain' }}
            >
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold shadow-xs ${
                        isUser
                          ? 'bg-gray-200 text-gray-700'
                          : 'bg-[#f9d602] text-neutral-950'
                      }`}
                    >
                      {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div className="flex flex-col gap-1.5 max-w-[88%]">
                      <div
                        className={`p-3 rounded-2xl leading-relaxed text-xs sm:text-[13px] ${
                          isUser
                            ? 'bg-[#f9d602] text-neutral-950 font-bold rounded-tr-none shadow-[0_3px_12px_rgba(249,214,2,0.35)]'
                            : 'bg-white border border-gray-200/90 text-gray-800 rounded-tl-none shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
                        }`}
                      >
                        {isUser ? msg.content : <FormattedText content={msg.content} />}
                      </div>

                      {/* Confirmed Voucher Card */}
                      {msg.voucher && (
                        <div className="bg-gradient-to-b from-emerald-50 to-white border-2 border-emerald-500/80 rounded-2xl p-3.5 text-gray-900 shadow-md flex flex-col gap-2 mt-1">
                          <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                            <span className="flex items-center gap-1 text-emerald-700 font-black text-xs">
                              <CheckCircle2 className="w-4 h-4" />
                              Booking Confirmed Successfully
                            </span>
                            <span className="bg-emerald-100 text-emerald-800 font-mono text-[11px] px-2 py-0.5 rounded font-bold border border-emerald-200">
                              #{msg.voucher.orderNumber}
                            </span>
                          </div>

                          <div className="text-xs space-y-1.5 text-gray-700 pt-1">
                            <div>
                              🚗 Vehicle: <strong className="text-gray-950">{msg.voucher.vehicleName}</strong>
                            </div>
                            <div>
                              📅 Period:{' '}
                              <strong className="text-gray-950">
                                {msg.voucher.dateFrom} to {msg.voucher.dateTo} ({msg.voucher.days} days)
                              </strong>
                            </div>
                            <div>
                              💰 Total Price:{' '}
                              <strong className="text-amber-700 text-sm font-sans font-black">
                                {Math.round(msg.voucher.totalPrice)} {msg.voucher.currency}
                              </strong>{' '}
                              (Pay upon arrival)
                            </div>
                            <div>
                              👤 Renter: <span className="text-gray-950 font-bold">{msg.voucher.customerName}</span> (
                              {msg.voucher.phone})
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons (Never render when search widget is active or vehicles are shown) */}
                      {msg.actionButtons && msg.actionButtons.length > 0 && !msg.showSearchWidget && (!msg.vehicles || msg.vehicles.length === 0) && (
                        <div className="flex flex-wrap gap-1.5 mt-0.5">
                          {msg.actionButtons.map((btn, bIdx) => (
                            <button
                              key={bIdx}
                              onClick={() => handleActionClick(btn)}
                              className="bg-white hover:bg-amber-50 hover:border-amber-400 text-gray-900 border border-gray-200 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(249,214,2,0.25)]"
                            >
                              {btn.actionType === 'whatsapp' ? (
                                <PhoneCall className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <ExternalLink className="w-3 h-3 text-amber-500" />
                              )}
                              <span>{btn.label}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* In-Chat Interactive Search & Date Picker Widget (100% in English like HeroSearch) */}
                      {msg.showSearchWidget && (
                        <div className="mt-2 w-full">
                          <InChatSearchWidget
                            initialLocation={msg.searchWidgetData?.defaultLocation}
                            initialDateFrom={msg.searchWidgetData?.dateFrom}
                            initialDateTo={msg.searchWidgetData?.dateTo}
                            initialStartTime={msg.searchWidgetData?.startTime}
                            initialEndTime={msg.searchWidgetData?.endTime}
                            isEnglish={true}
                            onSearch={handleWidgetSearch}
                          />
                        </div>
                      )}

                      {/* Car Cards */}
                      {msg.vehicles && msg.vehicles.length > 0 && (
                        <div className="flex flex-col gap-2.5 mt-2">
                          {msg.vehicles.map((v) => (
                            <ChatCarCard
                              key={v.id}
                              vehicle={v}
                              searchCriteria={msg.searchCriteria || currentSearchCriteria}
                              onStartBooking={(vehicle) => handleStartBooking(vehicle)}
                            />
                          ))}
                        </div>
                      )}

                      <span
                        className={`text-[9.5px] text-gray-400 px-1 font-medium ${
                          isUser ? 'text-right' : 'text-left'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* In-Chat Booking Wizard active step */}
              {activeBookingVehicle && (
                <div className="pt-1">
                  <InChatBookingForm
                    vehicle={activeBookingVehicle}
                    initialSearchCriteria={currentSearchCriteria}
                    onCancel={() => setActiveBookingVehicle(null)}
                    onBookingComplete={handleBookingCompleted}
                  />
                </div>
              )}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex gap-2 items-start">
                  <div className="w-7 h-7 rounded-full bg-[#f9d602] text-neutral-950 flex items-center justify-center shrink-0 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-gray-200/90 p-2.5 rounded-xl rounded-tl-none flex items-center gap-2 text-xs text-gray-600 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] text-gray-600 font-semibold mr-1">AI is searching & typing...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>



            {/* ── Input Bar (Light Theme) ────────────────────────────────────── */}
            <div
              className="p-2 sm:p-2.5 bg-white border-t border-gray-200 shrink-0"
              style={{ paddingBottom: 'max(0.65rem, env(safe-area-inset-bottom, 0px))' }}
            >
              <div className="flex items-center gap-1.5 bg-[#f8f9fa] border border-gray-300 focus-within:border-amber-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-400/25 rounded-xl px-2.5 py-1.5 transition-all shadow-2xs">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={isListening ? 'Listening...' : 'Type your message or request here...'}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-gray-900 text-base sm:text-[13px] placeholder-gray-400 focus:outline-none py-1 sm:py-0.5"
                />

                <button
                  type="button"
                  onClick={toggleVoice}
                  className={`p-1.5 rounded-lg transition-colors touch-manipulation ${
                    isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-gray-700'
                  }`}
                  title="Voice input"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className="w-9 h-9 sm:w-8 sm:h-8 rounded-xl bg-[#f9d602] hover:bg-[#ffe54c] disabled:opacity-30 text-neutral-950 font-bold flex items-center justify-center transition-all shrink-0 active:scale-90 shadow-[0_2px_8px_rgba(249,214,2,0.4)] touch-manipulation cursor-pointer"
                >
                  <Send className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



