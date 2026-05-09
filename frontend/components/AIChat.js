"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, X, Send, Bot, User, Sparkles, Loader2, Minus, ChevronLeft, Lightbulb, Mic, Star, Download } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

// Function to parse the assistant message content and split it into markdown and custom interactive cards
function parseMessageContent(content) {
  if (!content) return [];
  
  const regex = /:::template-recommend(\{.*?\}):::/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const textPart = content.substring(lastIndex, match.index);
    if (textPart) {
      parts.push({ type: 'text', content: textPart });
    }
    
    try {
      const templateData = JSON.parse(match[1]);
      parts.push({ type: 'template', data: templateData });
    } catch (e) {
      parts.push({ type: 'text', content: match[0] });
    }
    
    lastIndex = regex.lastIndex;
  }
  
  let remainingText = content.substring(lastIndex);
  
  // Clean up any incomplete trailing tag starting with :::template-recommend
  const incompleteTagIndex = remainingText.indexOf(':::template-recommend');
  if (incompleteTagIndex !== -1) {
    const cleanText = remainingText.substring(0, incompleteTagIndex);
    if (cleanText) {
      parts.push({ type: 'text', content: cleanText });
    }
  } else if (remainingText) {
    parts.push({ type: 'text', content: remainingText });
  }
  
  return parts;
}

function TemplateRecommendCard({ data }) {
  if (!data) return null;

  const { id, title, slug, category, price, rating, downloads, previewImage } = data;
  const href = `/templates/${slug || id}`;
  
  return (
    <div className="w-full bg-zinc-900/90 dark:bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 rounded-3xl overflow-hidden my-4 hover:border-primary/40 hover:shadow-lg transition-all duration-300 flex flex-col group text-right" dir="rtl">
      {/* Aspect 16:9 Image Container */}
      <div className="relative w-full aspect-[16/9] bg-zinc-800 overflow-hidden border-b border-zinc-800">
        <Image 
          src={previewImage || '/placeholder-template.jpg'} 
          alt={title || 'قالب نوشن'} 
          fill
          sizes="(max-width: 640px) 100vw, 360px"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Category Badge on Top-Right */}
        <span className="absolute top-2.5 right-2.5 text-[9px] font-black tracking-wider text-white px-2.5 py-1 bg-primary/90 backdrop-blur-md rounded-lg shadow-sm">
          {category || 'عام'}
        </span>
        {/* Price Badge on Top-Left */}
        <span className="absolute top-2.5 left-2.5 text-[10px] font-black tracking-wider text-white px-2.5 py-1 bg-zinc-950/80 backdrop-blur-md rounded-lg shadow-sm border border-white/5">
          {price || 'مجاني'}
        </span>
      </div>
      
      {/* Details Container */}
      <div className="p-4 flex flex-col gap-3">
        <h4 className="text-sm font-black text-white line-clamp-2 leading-snug">
          {title}
        </h4>
        
        <div className="flex items-center justify-between pt-2.5 border-t border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-400">
              <Star size={11} className="text-yellow-500 fill-yellow-500" />
              <span>{(Number(rating) || 5.0).toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-400">
              <Download size={11} />
              <span>{(Number(downloads) || 100).toLocaleString()}</span>
            </div>
          </div>
          <Link 
            href={href}
            className="text-[11px] font-black text-primary flex items-center gap-0.5 hover:underline group/btn"
          >
            <span>عرض القالب</span>
            <ChevronLeft size={13} className="group-hover/btn:-translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AIChat() {
  const pathname = usePathname();
  
  // Hide AI Chat on pages where it adds no value
  const hiddenRoutes = [
    '/profile',
    '/user-settings',
    '/admin',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/auth',
    '/widgets/arabic-clock/embed',
    '/widgets/arabic-header/embed',
    '/widgets/athkar/embed',
    '/widgets/countdown/embed',
    '/widgets/cultural-timer/embed',
    '/widgets/habit-tracker/embed',
    '/widgets/hadith/embed',
    '/widgets/pomodoro/embed',
    '/widgets/prayer/embed',
    '/widgets/quran/embed',
    '/widgets/small-deeds/embed',
    '/widgets/weather/embed',
    '/widgets/zakat-calculator/embed',
  ];
  if (hiddenRoutes.some(route => pathname?.startsWith(route))) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  
  // Dynamic Quick Actions based on page
  const getQuickActions = () => {
    if (pathname.includes('/templates')) {
      return [
        { label: 'أفضل القوالب المجانية 🎁', query: 'ما هي أفضل القوالب المجانية المتوفرة حالياً؟' },
        { label: 'قوالب لإدارة المشاريع 💼', query: 'أريد قوالب احترافية لإدارة المشاريع' },
        { label: 'كيف أحمل القالب؟ 📥', query: 'ما هي خطوات تحميل واستخدام القوالب؟' }
      ];
    }
    if (pathname.includes('/blog')) {
      return [
        { label: 'أحدث المقالات ✍️', query: 'ما هي آخر المواضيع المنشورة في المدونة؟' },
        { label: 'نصائح للإنتاجية 💡', query: 'أعطني نصائح سريعة لزيادة الإنتاجية باستخدام نوشن' }
      ];
    }
    return [
      { label: 'من هم المؤسسون؟ 👑', query: 'من قام بتأسيس منصة عرب نوشن؟' },
      { label: 'كيف أبدأ؟ ✨', query: 'أنا جديد هنا، كيف يمكنني الاستفادة من المنصة؟' },
      { label: 'انضم كمبدع ✍️', query: 'كيف يمكنني الانضمام لفريق المبدعين؟' }
    ];
  };

  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: pathname.includes('/templates') 
        ? 'مرحباً بك في **متجر القوالب**! 🛍️ هل تبحث عن نظام معين لتنظيم حياتك أو عملك؟'
        : 'مرحباً بك في مجتمع **عرب نوشن**! 👋 أنا مساعدك الذكي، كيف يمكنني دعم إبداعك اليوم؟',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechStatus, setSpeechStatus] = useState(''); // 'listening', 'no-speech', 'audio-capture', 'not-allowed', 'network', 'error'
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const getPlaceholderText = () => {
    if (isListening) return "جاري الاستماع لصوتك، تحدث الآن... 🎙️";
    if (speechStatus === 'no-speech') return "⚠️ لم يتم كشف أي صوت، يرجى المحاولة مجدداً...";
    if (speechStatus === 'audio-capture') return "⚠️ خطأ: تأكد من توصيل الميكروفون وتشغيله...";
    if (speechStatus === 'not-allowed') return "⚠️ تم حظر الميكروفون، يرجى السماح به من المتصفح...";
    if (speechStatus === 'network') return "⚠️ خطأ في الاتصال: تأكد من اتصالك بالإنترنت...";
    if (speechStatus === 'error') return "⚠️ حدث خطأ في النظام الصوتي، حاول مجدداً...";
    return "كيف يمكنني مساعدتك اليوم؟...";
  };

  const toggleListening = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('عذراً، ميزة الإدخال الصوتي غير مدعومة على متصفحك الحالي. يرجى تجربة Google Chrome أو Safari لترجمة صوتك مباشرة.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setSpeechStatus('');
      return;
    }

    try {
      setSpeechStatus('listening');
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'ar-EG';

      rec.onstart = () => {
        setIsListening(true);
        setSpeechStatus('listening');
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(prev => (prev ? prev + ' ' : '') + transcript);
          setSpeechStatus('');
        }
      };

      rec.onerror = (e) => {
        console.warn('Speech recognition error details:', e.error);
        setSpeechStatus(e.error || 'error');
        setIsListening(false);
        // Reset status to normal placeholder after 4 seconds
        setTimeout(() => {
          setSpeechStatus('');
        }, 4000);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.warn('Speech recognition failed to start:', err);
      setSpeechStatus('error');
      setIsListening(false);
    }
  };

  // Auto-notification after 5 seconds
  useEffect(() => {
    // Check if user has already seen or dismissed the notification
    const hasSeenNotification = localStorage.getItem('hasSeenAIChatNotification');
    if (hasSeenNotification) return;

    const timer = setTimeout(() => {
      if (!isOpen) {
        setShowNotification(true);
        // Mark as seen so it doesn't show again on refresh
        localStorage.setItem('hasSeenAIChatNotification', 'true');
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (query = null) => {
    const textToSend = query || input;
    if (!textToSend.trim()) return;

    const userMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!query) setInput('');
    setIsTyping(true);

    // Create a placeholder for the assistant message
    const assistantMessageId = Date.now();
    setMessages(prev => [...prev, {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          context: pathname // Tell the AI where the user is
        })
      });

      if (!response.ok) throw new Error("Failed to connect");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices?.[0]?.delta?.content || "";
              
              if (content && isTyping) setIsTyping(false); // Hide dots as soon as text starts
              
              fullContent += content;

              // Update the specific assistant message
              setMessages(prev => prev.map(msg => 
                msg.id === assistantMessageId ? { ...msg, content: fullContent } : msg
              ));
            } catch (e) { /* ignore parse errors for partial chunks */ }
          }
        }
      }
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: 'عذراً، يبدو أنني أواجه ضغطاً في الطلبات. يرجى المحاولة مرة أخرى لاحقاً.', isError: true } 
          : msg
      ));
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999]" dir="rtl">
      {/* Auto-Notification Bubble */}
      <AnimatePresence>
        {showNotification && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => { setIsOpen(true); setShowNotification(false); }}
            className="absolute bottom-20 right-0 bg-white dark:bg-zinc-900 border border-primary/20 shadow-xl p-4 rounded-2xl cursor-pointer whitespace-nowrap hidden sm:block overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-1 h-full bg-primary" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Bot size={18} />
              </div>
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">تحتاج مساعدة في اختيار قوالبك؟ ✨</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-[calc(100vw-2rem)] sm:w-[420px] h-[calc(100vh-120px)] max-h-[650px] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-3xl flex flex-col overflow-hidden origin-bottom-right"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-zinc-50/80 to-white/80 dark:from-zinc-900/80 dark:to-zinc-950/80 flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-16 translate-x-16" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 rotate-3">
                  <Bot size={26} />
                </div>
                <div>
                  <h3 className="font-black text-zinc-900 dark:text-zinc-100 text-lg tracking-tight">مساعد عرب نوشن</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest">مباشر الآن</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-all text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 relative z-10"
              >
                <Minus size={22} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
              {messages.map((msg, index) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.role === 'user' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={index}
                  className={cn(
                    "flex gap-4 max-w-[90%]",
                    msg.role === 'user' ? "mr-auto flex-row-reverse text-left" : "ml-auto"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm",
                    msg.role === 'user' ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400" : "bg-primary/10 text-primary"
                  )}>
                    {msg.role === 'user' ? <User size={18} /> : <Sparkles size={18} />}
                  </div>
                  <div className={cn("flex flex-col gap-2", msg.role === 'user' ? "items-start" : "items-start")}>
                    <div className={cn(
                      "p-4 rounded-[1.5rem] text-[15px] leading-relaxed shadow-sm prose prose-sm dark:prose-invert max-w-full break-words overflow-hidden",
                      msg.role === 'user' 
                        ? "bg-primary text-white rounded-tr-none prose-p:text-white prose-strong:text-white prose-li:text-white font-medium" 
                        : "bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none"
                    )}>
                      {msg.role === 'assistant' ? (
                        <div className="prose-headings:text-inherit prose-p:text-inherit prose-li:text-inherit w-full">
                          {parseMessageContent(msg.content).map((part, pIdx) => {
                            if (part.type === 'template') {
                              return <TemplateRecommendCard key={pIdx} data={part.data} />;
                            }
                            return (
                              <ReactMarkdown key={pIdx}>
                                {part.content}
                              </ReactMarkdown>
                            );
                          })}
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider px-2">
                      {msg.timestamp}
                    </span>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex gap-4 ml-auto">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Sparkles size={18} />
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-4 rounded-[1.5rem] rounded-tl-none shadow-md">
                    <div className="flex gap-2">
                      <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-duration:0.8s]" />
                      <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]" />
                      <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Actions & Input */}
            <div className="p-6 bg-zinc-50/50 dark:bg-zinc-950/50 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
              {/* Quick Actions */}
              {!isTyping && messages.length < 3 && (
                <div className="flex flex-wrap gap-2">
                  {getQuickActions().map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(action.query)}
                      className="text-xs font-bold py-2.5 px-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-primary hover:text-primary transition-all shadow-sm"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="relative flex items-center group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={getPlaceholderText()}
                  readOnly={isListening}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 pr-5 pl-24 text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-zinc-800 dark:text-zinc-200 shadow-inner placeholder:text-zinc-400"
                />
                
                {/* Voice Typing Trigger */}
                <button
                  type="button"
                  onClick={toggleListening}
                  style={{ left: '54px' }}
                  className={cn(
                    "absolute p-2.5 rounded-xl transition-all flex items-center justify-center",
                    isListening
                      ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30"
                      : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  )}
                  title="تحدث بالصوت للكتابة"
                >
                  <Mic size={20} className={cn(isListening && "scale-110")} />
                </button>

                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="absolute left-2.5 p-2.5 bg-primary text-white rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-primary/20"
                >
                  {isTyping ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
              </div>
              <div className="flex items-center justify-center gap-2">
                <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">
                  مدعوم بواسطة ذكاء Notion Arabs
                </p>
                <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800/50" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: isOpen ? 90 : 0 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => { 
          setIsOpen(!isOpen); 
          setShowNotification(false);
          localStorage.setItem('hasSeenAIChatNotification', 'true');
        }}
        className={cn(
          "w-16 h-16 sm:w-18 sm:h-18 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-500 relative overflow-hidden group",
          isOpen 
            ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full" 
            : "bg-primary text-white"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? <X size={32} strokeWidth={2.5} /> : <MessageCircle size={32} strokeWidth={2.5} />}
        
      </motion.button>
    </div>
  );
}
