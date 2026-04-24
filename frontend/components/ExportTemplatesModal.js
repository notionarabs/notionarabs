'use client';

import { useState } from 'react';
import { Download, X, FileText, CheckCircle2 } from 'lucide-react';
import Cookies from 'js-cookie';
import api from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExportTemplatesModal({ isOpen, onClose, user }) {
    const [exportStatus, setExportStatus] = useState('all');
    
    if (!isOpen) return null;

    const handleExport = () => {
        const token = Cookies.get('authToken') || '';
        const base = api.defaults.baseURL?.replace(/\/$/, '') || '';
        const endpoint = `/templates/export-public?token=${token}${exportStatus !== 'all' ? `&status=${exportStatus}` : ''}`;
        const href = `${base}${endpoint}`;
        
        const filename = `${(user?.username || (user?.email ? user.email.split('@')[0] : 'templates'))}-templates-${exportStatus}-${new Date().toISOString().split('T')[0]}.csv`;

        const a = document.createElement('a');
        a.href = href;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir="rtl">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className="relative bg-white dark:bg-dark-secondary rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-card-border flex items-center justify-between bg-gray-50/50 dark:bg-dark-tertiary">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-orange-900/20 flex items-center justify-center text-primary-600 dark:text-orange-500">
                                    <Download className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-dark-text-primary">تصدير القوالب</h3>
                                    <p className="text-xs font-bold text-gray-500 dark:text-dark-text-secondary">اختر البيانات التي ترغب في تصديرها</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-primary rounded-xl transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="space-y-6">
                                {/* Options Group */}
                                <div className="space-y-3">
                                    <label className="text-sm font-black text-gray-700 dark:text-dark-text-primary">تصفية القوالب:</label>
                                    
                                    <div className="grid grid-cols-1 gap-2">
                                        {[
                                            { id: 'all', label: 'جميع القوالب', description: 'تصدير كامل سجل القوالب الخاصة بك' },
                                            { id: 'approved', label: 'الموافق عليها فقط', description: 'تصدير القوالب المنشورة حالياً' },
                                            { id: 'pending', label: 'قيد المراجعة فقط', description: 'تصدير القوالب التي لم يتم مراجعتها بعد' },
                                            { id: 'rejected', label: 'المرفوضة فقط', description: 'تصدير القوالب التي تم رفضها' }
                                        ].map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => setExportStatus(option.id)}
                                                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-right ${
                                                    exportStatus === option.id 
                                                    ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10' 
                                                    : 'border-gray-100 dark:border-dark-card-border hover:border-gray-200 dark:hover:border-dark-tertiary'
                                                }`}
                                            >
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                                    exportStatus === option.id ? 'border-primary-500 bg-primary-500' : 'border-gray-300 dark:border-dark-tertiary'
                                                }`}>
                                                    {exportStatus === option.id && <CheckCircle2 className="w-4 h-4 text-white" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-sm font-bold ${exportStatus === option.id ? 'text-primary-700 dark:text-primary-400' : 'text-gray-900 dark:text-dark-text-primary'}`}>
                                                        {option.label}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 dark:text-dark-text-secondary">{option.description}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 dark:bg-dark-tertiary/50 rounded-2xl border border-gray-100 dark:border-dark-card-border">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-gray-400" />
                                        <div className="text-[10px] text-gray-500 dark:text-dark-text-secondary leading-relaxed">
                                            سيتم تصدير البيانات بصيغة <span className="font-bold text-gray-700 dark:text-dark-text-primary">CSV</span> متوافقة مع Excel وجداول بيانات Google.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50/50 dark:bg-dark-tertiary border-t border-gray-100 dark:border-dark-card-border flex items-center justify-end gap-3">
                            <button 
                                onClick={onClose}
                                className="px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-primary rounded-xl transition-all"
                            >
                                إلغاء
                            </button>
                            <button 
                                onClick={handleExport}
                                className="btn-primary flex items-center gap-2 px-8 py-2.5 text-sm font-bold shadow-glow-primary active:scale-95 transition-all"
                            >
                                <Download className="w-4 h-4" />
                                تصدير الآن
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
