'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Crown } from 'lucide-react';
import Link from 'next/link';

export default function CreatorTelegramPopup({ isOpen, onClose, onDismiss }) {
    const [isRTL, setIsRTL] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const htmlDir = document.documentElement.getAttribute('dir');
            setIsRTL(htmlDir === 'rtl');
        }
    }, []);

    const handleClose = () => {
        onClose();
    };

    const handleDismiss = () => {
        if (onDismiss) onDismiss();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: 50, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 50, opacity: 0, scale: 0.95 }}
                    transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 300
                    }}
                    className={`fixed bottom-4 sm:bottom-6 z-[70] w-[calc(100%-2rem)] sm:w-full sm:max-w-[380px] ${isRTL ? 'left-4 sm:left-6' : 'right-4 sm:right-6'
                        }`}
                    dir={isRTL ? 'rtl' : 'ltr'}
                >
                    <div className="relative overflow-hidden bg-white dark:bg-dark-secondary rounded-2xl shadow-2xl border border-primary-100 dark:border-primary-900/30">
                        {/* Premium Gradient Background Element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent-500/10 rounded-full blur-2xl -ml-12 -mb-12" />

                        {/* Header */}
                        <div className="relative p-5 sm:p-6 pb-0">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                                        <Crown className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900 dark:text-dark-text-primary leading-tight">
                                            قناة المبدعين
                                        </h3>
                                        <p className="text-xs font-bold text-primary-600 dark:text-primary-400 mt-0.5">
                                            مجتمع حصري
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-1.5 rounded-lg bg-gray-100 dark:bg-dark-tertiary text-gray-500 hover:bg-gray-200 dark:hover:bg-dark-quaternary transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="relative p-5 sm:p-6">
                            <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-6 leading-relaxed">
                                تحديثات، نصائح، وفرص تعاون حصرية لمبدعي عرب نوشن.
                            </p>

                            <div className="space-y-3">
                                <Link
                                    href="https://t.me/+jNEkx52yB4Q0MmU0"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={handleClose}
                                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary-600/20"
                                >
                                    <Send className="w-4 h-4" />
                                    <span>انضم للقناة الآن</span>
                                </Link>

                                <button
                                    onClick={handleDismiss}
                                    className="w-full py-2 text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-dark-text-primary transition-colors text-center"
                                >
                                    عدم الإظهار مرة أخرى
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
