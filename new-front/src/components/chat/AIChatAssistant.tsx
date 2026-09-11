'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  X,
  Send,
  Sparkles,
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
} from 'lucide-react';
import { RootState } from '@/store';
import ChatCarCard from './ChatCarCard';
import InChatBookingForm from './InChatBookingForm';
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
}

const QUICK_SUGGESTIONS = [
  { label: '✈️ Dubai Airport (3 Days)', text: 'Cars available at Dubai Airport tomorrow for 3 days' },
  { label: '⚡ Cheapest Economy Car', text: 'Cheapest economy car available this week' },
  { label: '👨‍👩‍👧 7-Seater Family SUV', text: '7-seater family SUV with automatic transmission' },
  { label: '🛡️ Cancellation & Policy', text: 'What are the free cancellation and insurance policies?' },
  { label: '🤝 Register as Supplier', text: 'How can I register my car rental company with Autours?' },
];

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
  content: `Welcome to **Autours**! 🚗✨\nI'm your AI assistant. I can help you search and book cars, manage your reservation, or answer any questions.`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  actionButtons: [
    { label: '🚗 Find Cars in Dubai', url: '/search?location=Dubai', actionType: 'link' },
    { label: '💬 WhatsApp Support', url: 'https://wa.me/96560480382', actionType: 'whatsapp' },
  ],
};

const STORAGE_KEY = 'autours_ai_chat_history_v1';

export default function AIChatAssistant() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MSG]);
  const [isListening, setIsListening] = useState(false);
  const [activeBookingVehicle, setActiveBookingVehicle] = useState<Vehicle | null>(null);
  const [currentSearchCriteria, setCurrentSearchCriteria] = useState<any>(null);

  const currencyCode = useSelector((state: RootState) => state.currency.code) || 'AED';
  const reduxSearchParams = useSelector((state: RootState) => state.search.searchParams);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const isLoadedRef = useRef(false);

  // 💾 1. استعادة الرسائل المحفوظة ومعايير البحث من LocalStorage عند تحميل الصفحة لأول مرة
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        }
        const savedCriteria = localStorage.getItem('autours_ai_search_criteria_v1');
        if (savedCriteria) {
          setCurrentSearchCriteria(JSON.parse(savedCriteria));
        }
      } catch (e) {
        console.warn('Could not restore chat history:', e);
      } finally {
        isLoadedRef.current = true;
      }
    }
  }, []);

  // 💾 2. حفظ الرسائل في LocalStorage فقط بعد اكتمال الاستعادة
  useEffect(() => {
    if (!isLoadedRef.current) return;
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (e) {
        console.warn('Could not save chat history:', e);
      }
    }
  }, [messages]);

  // 💾 3. حفظ معايير البحث الحالية
  useEffect(() => {
    if (!isLoadedRef.current) return;
    if (typeof window !== 'undefined') {
      try {
        if (currentSearchCriteria) {
          localStorage.setItem('autours_ai_search_criteria_v1', JSON.stringify(currentSearchCriteria));
        } else {
          localStorage.removeItem('autours_ai_search_criteria_v1');
        }
      } catch (e) {
        console.warn('Could not save search criteria:', e);
      }
    }
  }, [currentSearchCriteria]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, isOpen, activeBookingVehicle]);

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
    setMessages((prev) => [
      ...prev,
      {
        id: `voucher-${Date.now()}`,
        role: 'assistant',
        content: `🎉 **مبروك يا فندم! تم تأكيد حجزك بنجاح**\nتم تسجيل الحجز في النظام وإرسال تفاصيل الحجز إلى بريدك الإلكتروني. إليك ملخص قسيمة الحجز:`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        voucher,
        actionButtons: [
          { label: '💬 تواصل واتساب مع الدعم', url: 'https://wa.me/96560480382', actionType: 'whatsapp' },
          { label: '👤 صفحة حجوزاتي', url: '/profile', actionType: 'link' },
        ],
      },
    ]);
  };

  const handleResetChat = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('autours_ai_search_criteria_v1');
    }
    setMessages([INITIAL_MSG]);
    setCurrentSearchCriteria(null);
    setActiveBookingVehicle(null);
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
            className="fixed bottom-5 right-5 z-[9999] group flex items-center justify-center w-14 h-14 rounded-full bg-[#f9d602] hover:bg-[#ffe54c] text-neutral-950 shadow-[0_10px_28px_rgba(249,214,2,0.5),0_3px_12px_rgba(0,0,0,0.15)] hover:scale-105 active:scale-95 transition-transform duration-150 cursor-pointer"
            title="Autours AI Assistant"
          >
            <span className="absolute -inset-1 rounded-full bg-[#f9d602]/35 animate-ping pointer-events-none" />
            <MessageCircle className="w-7 h-7 text-neutral-950 fill-neutral-950 group-hover:scale-110 transition-transform" />
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#00c982] rounded-full ring-2 ring-white shadow-xs" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Sleek Modern Light Chat Window ────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window-modal"
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed bottom-5 right-5 z-[9999] w-[94vw] sm:w-[420px] h-[600px] max-h-[88vh] bg-white border border-gray-300/80 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.22),0_6px_20px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden text-gray-900"
            style={{ overscrollBehavior: 'contain' }}
            onWheel={(e) => e.stopPropagation()}
          >
            {/* ── Header (Website Brand Yellow Matching Screenshot) ──────────── */}
            <div className="bg-[#f9d602] border-b border-amber-300/90 px-4 py-3 flex items-center justify-between shrink-0 select-none text-neutral-950 shadow-xs">
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

              <div className="flex items-center gap-1 text-neutral-900">
                <button
                  onClick={handleResetChat}
                  title="New Chat"
                  className="p-1.5 hover:bg-black/10 rounded-lg transition-colors font-bold"
                >
                  <RotateCcw className="w-4 h-4 text-neutral-900 stroke-[2.2]" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close"
                  className="p-1.5 hover:bg-black/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-900 stroke-[2.2]" />
                </button>
              </div>
            </div>

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

                      {/* Action Buttons */}
                      {msg.actionButtons && msg.actionButtons.length > 0 && (
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

            {/* ── Quick Chips (Light Suggestion Pills) ────────────────────────── */}
            <div className="px-3 py-2 border-t border-gray-200 bg-white flex items-center gap-1.5 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden shrink-0 shadow-xs">
              {QUICK_SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s.text)}
                  className="bg-gray-50 hover:bg-amber-50 hover:border-amber-400 hover:text-amber-950 text-gray-700 border border-gray-200/90 text-[11px] px-2.5 py-1 rounded-lg whitespace-nowrap transition-all shrink-0 active:scale-95 font-bold shadow-2xs"
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* ── Input Bar (Light Theme) ────────────────────────────────────── */}
            <div className="p-2.5 bg-white border-t border-gray-200 shrink-0">
              <div className="flex items-center gap-1.5 bg-[#f8f9fa] border border-gray-300 focus-within:border-amber-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-400/25 rounded-xl px-2.5 py-1.5 transition-all shadow-2xs">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={isListening ? 'Listening now...' : 'Ask anything or request a car...'}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-gray-900 text-xs sm:text-[13px] placeholder-gray-400 focus:outline-none py-0.5"
                />

                <button
                  type="button"
                  onClick={toggleVoice}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-gray-700'
                  }`}
                  title="Voice input"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className="w-8 h-8 rounded-xl bg-[#f9d602] hover:bg-[#ffe54c] disabled:opacity-30 text-neutral-950 font-bold flex items-center justify-center transition-all shrink-0 active:scale-90 shadow-[0_2px_8px_rgba(249,214,2,0.4)]"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



