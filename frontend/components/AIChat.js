"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { MessageCircle, X, Send, Bot, User, Sparkles, Loader2, Minus, ChevronLeft, Lightbulb, Mic } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

export default function AIChat() {
  const pathname = usePathname();
  
  // Hide AI Chat on dashboard and profile pages as requested
  const hiddenRoutes = ['/profile', '/user-settings', '/admin'];
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
  const messagesEndRef = useRef(null);

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
                        <div className="prose-headings:text-inherit prose-p:text-inherit prose-li:text-inherit">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
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
                  placeholder="كيف يمكنني مساعدتك اليوم؟..."
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 pr-5 pl-16 text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-zinc-800 dark:text-zinc-200 shadow-inner placeholder:text-zinc-400"
                />
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
