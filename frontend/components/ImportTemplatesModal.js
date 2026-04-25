'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImportTemplatesModal({ isOpen, onClose, onSuccess }) {
    const [file, setFile] = useState(null);
    const [parsing, setParsing] = useState(false);
    const [importing, setImporting] = useState(false);
    const [previewData, setPreviewData] = useState([]);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
    const { showSuccess, showError } = useToast();

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile);
            parseCSV(selectedFile);
        } else {
            setError('يرجى اختيار ملف CSV صالح');
            setFile(null);
        }
    };

    const parseCSV = (file) => {
        setParsing(true);
        setError(null);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target.result;

                // Robust CSV parser that handles newlines inside quotes
                const rows = [];
                let currentRow = [];
                let currentField = '';
                let inQuotes = false;

                for (let i = 0; i < text.length; i++) {
                    const char = text[i];
                    const nextChar = text[i + 1];

                    if (char === '"') {
                        if (inQuotes && nextChar === '"') {
                            currentField += '"';
                            i++; // skip next quote
                        } else {
                            inQuotes = !inQuotes;
                        }
                    } else if (char === ',' && !inQuotes) {
                        currentRow.push(currentField.trim());
                        currentField = '';
                    } else if ((char === '\n' || char === '\r') && !inQuotes) {
                        if (char === '\r' && nextChar === '\n') i++; // handle CRLF
                        currentRow.push(currentField.trim());
                        if (currentRow.some(field => field !== '')) {
                            rows.push(currentRow);
                        }
                        currentRow = [];
                        currentField = '';
                    } else {
                        currentField += char;
                    }
                }

                // Push last field/row
                if (currentField || currentRow.length > 0) {
                    currentRow.push(currentField.trim());
                    rows.push(currentRow);
                }

                if (rows.length < 2) {
                    throw new Error('الملف فارغ أو لا يحتوي على بيانات');
                }

                const rawHeaders = rows[0].map(h => h.toLowerCase());
                const data = rows.slice(1).map(row => {
                    const obj = {};
                    rawHeaders.forEach((header, index) => {
                        let key = null;
                        if (header.includes('title') || header.includes('عنوان')) key = 'title';
                        else if (header.includes('description') || header.includes('وصف')) key = 'description';
                        else if (header.includes('notion') || header.includes('رابط') || header.includes('نوشن')) key = 'notionLink';
                        else if (header.includes('category') || header.includes('categories') || header.includes('فئة') || header.includes('تصنيف')) key = 'categories';
                        else if (header.includes('paid') || header.includes('مدفوع')) key = 'isPaid';
                        else if (header.includes('price') || header.includes('سعر')) key = 'price';
                        else if (header.includes('purchase') || header.includes('شراء')) key = 'purchaseLink';
                        else if (header.includes('image') || header.includes('صورة') || header.includes('preview')) key = 'previewImage';
                        else if (header.includes('tag') || header.includes('وسم')) key = 'tags';
                        else if (header.includes('feature') || header.includes('ميزة')) key = 'features';

                        if (key) obj[key] = row[index];
                    });
                    return obj;
                });

                setPreviewData(data.filter(item => item.title)); // Ensure at least title exists
            } catch (err) {
                console.error('CSV Parsing error:', err);
                setError('حدث خطأ أثناء تحليل ملف CSV. تأكد من التنسيق الصحيح.');
            } finally {
                setParsing(false);
            }
        };
        reader.readAsText(file);
    };

    const handleImport = async () => {
        if (previewData.length === 0) return;

        setImporting(true);
        try {
            const formattedData = previewData.map(item => ({
                ...item,
                isPaid: item.isPaid?.toLowerCase() === 'true' || item.isPaid === '1' || item.isPaid === 'نعم' || item.isPaid?.toLowerCase() === 'paid',
                price: parseFloat(String(item.price).replace(/[^\d.]/g, '')) || 0,
                categories: item.categories ? (Array.isArray(item.categories) ? item.categories : item.categories.split(',').map(c => c.trim())) : [],
                tags: item.tags ? (Array.isArray(item.tags) ? item.tags : item.tags.split(',').map(t => t.trim())) : [],
                features: item.features ? (Array.isArray(item.features) ? item.features : item.features.split('\n').map(f => f.trim())) : []
            }));

            const response = await api.post('/templates/bulk-import', { templates: formattedData });

            if (response.data.success) {
                showSuccess(response.data.message);
                onSuccess();
                onClose();
            }
        } catch (err) {
            console.error('Import error:', err);
            showError(err.response?.data?.message || 'حدث خطأ أثناء الاستيراد');
        } finally {
            setImporting(false);
        }
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
                        className="relative bg-white dark:bg-dark-secondary rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-card-border flex items-center justify-between bg-gray-50/50 dark:bg-dark-tertiary">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-orange-900/20 flex items-center justify-center text-primary-600 dark:text-orange-500">
                                    <Upload className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-dark-text-primary">استيراد قوالب (CSV)</h3>
                                    <p className="text-xs font-bold text-gray-500 dark:text-dark-text-secondary">استخدم ملف CSV متوافق لرفع قوالبك دفعة واحدة</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-primary rounded-xl transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            {/* Help Section */}
                            <div className="mb-8 p-4 bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3 text-right w-full sm:w-auto">
                                    <div className="w-10 h-10 bg-white dark:bg-dark-secondary rounded-xl flex items-center justify-center text-primary-600 shadow-sm flex-shrink-0">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-dark-text-primary">تنسيق الملف (CSV)</h4>
                                        <p className="text-[10px] text-gray-500 dark:text-dark-text-secondary leading-relaxed">تأكد من استخدام نفس عناوين الأعمدة في الملف النموذجي ليتم التعرف على البيانات بشكل صحيح.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const headers = 'Title (العنوان),Description,Notion Link,Categories,Is Paid (مدفوع),Price (السعر),Preview Image (رابط الصورة),Features (المميزات),Tags (وسوم)\n';
                                        const sample = '"قالب إدارة المهام الاحترافي","وصف القالب هنا...","https://notion.so/my-template","إدارة مشاريع، إنتاجية","TRUE","50","https://image-link.com/preview.png","الميزة الأولى\nالميزة الثانية\nالميزة الثالثة","نوشن، إنتاجية"';
                                        const blob = new Blob(['\uFEFF' + headers + sample], { type: 'text/csv;charset=utf-8;' });
                                        const link = document.createElement('a');
                                        link.href = URL.createObjectURL(blob);
                                        link.setAttribute('download', 'notion_arabs_sample_template.csv');
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-secondary border border-primary-200 dark:border-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl text-xs font-black hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all shadow-sm w-full sm:w-auto justify-center"
                                >
                                    تحميل الملف النموذجي (CSV)
                                </button>
                            </div>

                            {!file ? (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-200 dark:border-dark-card-border rounded-2xl p-10 text-center hover:border-primary-500 dark:hover:border-primary-500 transition-all cursor-pointer group bg-gray-50/30 dark:bg-dark-primary/30"
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept=".csv"
                                        className="hidden"
                                    />
                                    <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-dark-tertiary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        <FileText className="w-8 h-8 text-gray-400 group-hover:text-primary-500" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-2">اختر ملف CSV</h4>
                                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary max-w-sm mx-auto">
                                        الأعمدة المطلوبة: Title, Description, Notion Link, Categories, Is Paid, Price, Preview Image, Features
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-primary-50 dark:bg-orange-900/10 rounded-2xl border border-primary-100 dark:border-orange-500/20">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-primary-600" />
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-dark-text-primary">{file.name}</p>
                                                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => { setFile(null); setPreviewData([]); setError(null); }}
                                            className="text-xs font-bold text-red-600 hover:underline"
                                        >
                                            تغيير الملف
                                        </button>
                                    </div>

                                    {error && (
                                        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl flex items-start gap-3 border border-red-100 dark:border-red-500/20">
                                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-red-600 font-bold">{error}</p>
                                        </div>
                                    )}

                                    {previewData.length > 0 && (
                                        <div>
                                            <h5 className="text-sm font-bold text-gray-700 dark:text-dark-text-primary mb-3 flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                تم العثور على {previewData.length} قالب
                                            </h5>
                                            <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-100 dark:border-dark-card-border">
                                                <table className="w-full text-right text-sm">
                                                    <thead className="bg-gray-50 dark:bg-dark-tertiary sticky top-0">
                                                        <tr>
                                                            <th className="px-4 py-2 font-bold text-gray-700 dark:text-dark-text-secondary">العنوان</th>
                                                            <th className="px-4 py-2 font-bold text-gray-700 dark:text-dark-text-secondary">السعر</th>
                                                            <th className="px-4 py-2 font-bold text-gray-700 dark:text-dark-text-secondary">الصورة</th>
                                                            <th className="px-4 py-2 font-bold text-gray-700 dark:text-dark-text-secondary">الفئة</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50 dark:divide-dark-card-border/50">
                                                        {previewData.slice(0, 5).map((item, idx) => (
                                                            <tr key={idx} className="dark:text-dark-text-primary">
                                                                <td className="px-4 py-2 truncate max-w-[150px]">{item.title}</td>
                                                                <td className="px-4 py-2">{item.price || '0'}</td>
                                                                <td className="px-4 py-2">
                                                                    {item.previewImage ? (
                                                                        <div className="w-8 h-8 rounded bg-gray-100 dark:bg-dark-tertiary flex items-center justify-center overflow-hidden">
                                                                            <img src={item.previewImage} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-gray-400">---</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-2 truncate max-w-[100px]">{item.categories}</td>
                                                            </tr>
                                                        ))}
                                                        {previewData.length > 5 && (
                                                            <tr>
                                                                <td colSpan="3" className="px-4 py-2 text-center text-xs text-gray-400">
                                                                    ... و {previewData.length - 5} قالب إضافي
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
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
                                disabled={!file || previewData.length === 0 || importing || parsing}
                                onClick={handleImport}
                                className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {importing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        جاري الاستيراد...
                                    </>
                                ) : (
                                    'ابدأ الاستيراد'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
