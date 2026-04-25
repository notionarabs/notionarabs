'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileText, AlertCircle, CheckCircle2, Loader2, Check, Trash2, Image as ImageIcon, ChevronRight, ChevronLeft } from 'lucide-react';
import api from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImportTemplatesModal({ isOpen, onClose, onSuccess }) {
    const [step, setStep] = useState(1); // 1: Upload (Images + CSV), 2: Preview
    const [file, setFile] = useState(null);
    const [parsing, setParsing] = useState(false);
    const [importing, setImporting] = useState(false);
    const [previewData, setPreviewData] = useState([]);
    const [error, setError] = useState(null);
    const imageInputRef = useRef(null);
    const csvInputRef = useRef(null);
    const { showSuccess, showError } = useToast();

    // Image Upload State
    const [imageFiles, setImageFiles] = useState([]);
    const [uploadingImages, setUploadingImages] = useState(false);

    if (!isOpen) return null;

    // --- Image Upload Handlers ---
    const handleImageSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const validFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
        
        if (validFiles.length < selectedFiles.length) {
            showError('بعض الملفات المختارة ليست صوراً صالحة');
        }

        setImageFiles(prev => [...prev, ...validFiles.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            preview: URL.createObjectURL(file),
            status: 'idle'
        }))]);
    };

    const removeImage = (id) => {
        setImageFiles(prev => prev.filter(f => f.id !== id));
    };

    const uploadImages = async () => {
        if (imageFiles.length === 0) return true; // Nothing to upload, move on
        
        setUploadingImages(true);
        let allSuccess = true;

        for (let i = 0; i < imageFiles.length; i++) {
            const fileItem = imageFiles[i];
            if (fileItem.status === 'success') continue;
            
            setImageFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'uploading' } : f));

            try {
                const formData = new FormData();
                formData.append('image', fileItem.file);

                const response = await api.post('/upload/image', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (response.data.success) {
                    const url = response.data.data.imageUrl;
                    setImageFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'success', url } : f));
                }
            } catch (err) {
                console.error(`Error uploading ${fileItem.file.name}:`, err);
                setImageFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'error' } : f));
                allSuccess = false;
            }
        }

        setUploadingImages(false);
        return allSuccess;
    };

    // --- CSV Handlers ---
    const handleCSVChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile);
            setError(null);
        } else {
            setError('يرجى اختيار ملف CSV صالح');
            setFile(null);
        }
    };

    const parseAndMatch = async () => {
        if (!file) {
            setError('يرجى اختيار ملف CSV أولاً');
            return;
        }

        setParsing(true);
        
        // Step 1: Upload images first if any are idle
        const imagesReady = await uploadImages();
        if (!imagesReady) {
            setError('حدث خطأ أثناء رفع بعض الصور. يرجى المحاولة مرة أخرى.');
            setParsing(false);
            return;
        }

        // Step 2: Parse CSV
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target.result;
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
                            i++;
                        } else {
                            inQuotes = !inQuotes;
                        }
                    } else if (char === ',' && !inQuotes) {
                        currentRow.push(currentField.trim());
                        currentField = '';
                    } else if ((char === '\n' || char === '\r') && !inQuotes) {
                        if (char === '\r' && nextChar === '\n') i++;
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

                if (currentField || currentRow.length > 0) {
                    currentRow.push(currentField.trim());
                    rows.push(currentRow);
                }

                if (rows.length < 2) throw new Error('الملف فارغ أو لا يحتوي على بيانات');

                const rawHeaders = rows[0].map(h => h.toLowerCase());
                const currentImages = imageFiles.filter(img => img.status === 'success');

                const data = rows.slice(1).map(row => {
                    const obj = {};
                    rawHeaders.forEach((header, index) => {
                        let key = null;
                        if (header.includes('image') || header.includes('صورة') || header.includes('preview')) key = 'previewImage';
                        else if (header.includes('title') || header.includes('عنوان')) key = 'title';
                        else if (header.includes('description') || header.includes('وصف')) key = 'description';
                        else if (header.includes('notion') || header.includes('نوشن') || header.includes('رابط')) key = 'notionLink';
                        else if (header.includes('category') || header.includes('categories') || header.includes('فئة') || header.includes('تصنيف')) key = 'categories';
                        else if (header.includes('paid') || header.includes('مدفوع')) key = 'isPaid';
                        else if (header.includes('price') || header.includes('سعر')) key = 'price';
                        else if (header.includes('purchase') || header.includes('شراء')) key = 'purchaseLink';
                        else if (header.includes('tag') || header.includes('وسم')) key = 'tags';
                        else if (header.includes('feature') || header.includes('ميزة')) key = 'features';

                        if (key) obj[key] = row[index];
                    });

                    // Auto-match images
                    const currentImgValue = obj.previewImage || '';
                    if (!currentImgValue.startsWith('http')) {
                        const matchedImage = currentImages.find(img => 
                            img.file.name === currentImgValue || 
                            img.file.name.split('.')[0] === currentImgValue ||
                            img.file.name.split('.')[0] === obj.title ||
                            img.file.name === obj.title
                        );
                        if (matchedImage) obj.previewImage = matchedImage.url;
                    }
                    return obj;
                });

                setPreviewData(data.filter(item => item.title));
                setStep(2);
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
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className="relative bg-white dark:bg-dark-secondary rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-card-border flex items-center justify-between bg-gray-50/50 dark:bg-dark-tertiary">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-orange-900/20 flex items-center justify-center text-primary-600 dark:text-orange-500">
                                    <Upload className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-dark-text-primary">استيراد قوالب ذكي</h3>
                                    <p className="text-xs font-bold text-gray-500 dark:text-dark-text-secondary">ارفع الصور وملف الـ CSV معاً ليتم الربط والرفع تلقائياً</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-primary rounded-xl transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Steps */}
                        <div className="px-6 py-4 bg-white dark:bg-dark-secondary border-b border-gray-50 dark:border-dark-card-border flex items-center justify-center gap-8">
                            {[
                                { id: 1, label: 'رفع البيانات', icon: Upload },
                                { id: 2, label: 'مراجعة وتأكيد', icon: CheckCircle2 }
                            ].map((s, idx) => (
                                <div key={s.id} className="flex items-center gap-3">
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${step === s.id ? 'bg-primary-50 dark:bg-orange-500/10 text-primary-600 dark:text-orange-500' : step > s.id ? 'text-green-500' : 'text-gray-400'}`}>
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${step === s.id ? 'bg-primary-600 text-white shadow-lg' : step > s.id ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-dark-tertiary'}`}>
                                            {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                                        </div>
                                        <span className="text-sm font-black">{s.label}</span>
                                    </div>
                                    {idx === 0 && <div className={`w-16 h-0.5 rounded-full ${step > s.id ? 'bg-green-500' : 'bg-gray-100 dark:bg-dark-tertiary'}`} />}
                                </div>
                            ))}
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            {step === 1 && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* CSV Upload Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-sm font-black text-gray-900 dark:text-dark-text-primary flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-primary-600" />
                                                1. ملف البيانات (CSV)
                                            </h4>
                                            <button
                                                onClick={() => {
                                                    const headers = 'Title,Description,Notion Link,Categories,Is Paid,Price,Preview Image,Features,Tags\n';
                                                    const sample = '"قالب إدارة المهام","وصف القالب...","https://notion.so/xxx","إنتاجية","TRUE","50","TemplateA.png","ميزة 1\nميزة 2","نوشن"';
                                                    const blob = new Blob(['\uFEFF' + headers + sample], { type: 'text/csv;charset=utf-8;' });
                                                    const link = document.createElement('a');
                                                    link.href = URL.createObjectURL(blob);
                                                    link.download = 'template_sample.csv';
                                                    link.click();
                                                }}
                                                className="text-[10px] font-black text-primary-600 hover:underline"
                                            >
                                                تحميل النموذج
                                            </button>
                                        </div>

                                        {!file ? (
                                            <div 
                                                onClick={() => csvInputRef.current?.click()}
                                                className="border-2 border-dashed border-gray-200 dark:border-dark-card-border rounded-2xl p-10 text-center hover:border-primary-500 transition-all cursor-pointer bg-gray-50/30 dark:bg-dark-primary/30 group aspect-video flex flex-col items-center justify-center"
                                            >
                                                <input type="file" accept=".csv" className="hidden" ref={csvInputRef} onChange={handleCSVChange} />
                                                <div className="w-16 h-16 bg-white dark:bg-dark-secondary rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                                    <FileText className="w-8 h-8 text-gray-400 group-hover:text-primary-500" />
                                                </div>
                                                <p className="text-sm font-bold text-gray-700 dark:text-dark-text-primary">اختر ملف CSV</p>
                                                <p className="text-[10px] text-gray-400 mt-2">الملف الذي يحتوي على معلومات القوالب</p>
                                            </div>
                                        ) : (
                                            <div className="p-6 bg-primary-50 dark:bg-orange-900/10 rounded-2xl border border-primary-100 dark:border-orange-500/20 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white dark:bg-dark-secondary rounded-xl flex items-center justify-center text-primary-600 shadow-sm">
                                                        <FileText className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-gray-900 dark:text-dark-text-primary">{file.name}</p>
                                                        <p className="text-[10px] text-gray-500">جاهز للتحليل</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => setFile(null)} className="text-[10px] font-bold text-red-600 hover:underline">تغيير</button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Images Upload Section */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-black text-gray-900 dark:text-dark-text-primary flex items-center gap-2 mb-2">
                                            <ImageIcon className="w-4 h-4 text-primary-600" />
                                            2. الصور الملحقة (اختياري)
                                        </h4>
                                        
                                        <div 
                                            onClick={() => imageInputRef.current?.click()}
                                            className="border-2 border-dashed border-gray-200 dark:border-dark-card-border rounded-2xl p-6 text-center hover:border-primary-500 transition-all cursor-pointer bg-gray-50/30 dark:bg-dark-primary/30 group"
                                        >
                                            <input type="file" multiple accept="image/*" className="hidden" ref={imageInputRef} onChange={handleImageSelect} />
                                            <div className="flex items-center justify-center gap-3">
                                                <div className="w-10 h-10 bg-white dark:bg-dark-secondary rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                    <ImageIcon className="w-5 h-5 text-gray-400 group-hover:text-primary-500" />
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-gray-700 dark:text-dark-text-primary">ارفع الصور هنا</p>
                                                    <p className="text-[10px] text-gray-400">سيتم ربطها تلقائياً بالاسم</p>
                                                </div>
                                            </div>
                                        </div>

                                        {imageFiles.length > 0 && (
                                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[200px] overflow-y-auto p-2 border border-gray-100 dark:border-dark-card-border rounded-xl">
                                                {imageFiles.map((f) => (
                                                    <div key={f.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-50 dark:border-dark-card-border bg-white dark:bg-dark-tertiary group">
                                                        <img src={f.preview} alt="" className="w-full h-full object-cover" />
                                                        <button onClick={() => removeImage(f.id)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                        {f.status === 'success' && <div className="absolute inset-0 bg-green-500/40 flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {error && (
                                        <div className="lg:col-span-2 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl flex items-start gap-3 border border-red-100 dark:border-red-500/20">
                                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                            <p className="text-sm text-red-600 font-bold">{error}</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 rounded-xl">
                                        <h5 className="text-sm font-bold text-green-700 dark:text-green-400 flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" />
                                            تم تحليل {previewData.length} قالب بنجاح مع ربط الصور
                                        </h5>
                                        <button onClick={() => setStep(1)} className="text-[10px] font-black text-primary-600 hover:underline">العودة لتعديل الملفات</button>
                                    </div>

                                    <div className="rounded-2xl border border-gray-100 dark:border-dark-card-border overflow-hidden">
                                        <table className="w-full text-right text-xs">
                                            <thead className="bg-gray-50 dark:bg-dark-tertiary">
                                                <tr>
                                                    <th className="px-4 py-3 font-black text-gray-700 dark:text-dark-text-secondary">العنوان</th>
                                                    <th className="px-4 py-3 font-black text-gray-700 dark:text-dark-text-secondary">السعر</th>
                                                    <th className="px-4 py-3 font-black text-gray-700 dark:text-dark-text-secondary">الصورة</th>
                                                    <th className="px-4 py-3 font-black text-gray-700 dark:text-dark-text-secondary">الفئة</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 dark:divide-dark-card-border/50">
                                                {previewData.slice(0, 10).map((item, idx) => (
                                                    <tr key={idx} className="dark:text-dark-text-primary hover:bg-gray-50/50 dark:hover:bg-dark-primary/30 transition-colors">
                                                        <td className="px-4 py-3 font-bold truncate max-w-[200px]">{item.title}</td>
                                                        <td className="px-4 py-3 font-black text-primary-600">{item.price || '0'} $</td>
                                                        <td className="px-4 py-3">
                                                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-dark-tertiary overflow-hidden border border-gray-100 dark:border-dark-card-border">
                                                                {item.previewImage ? (
                                                                    <img src={item.previewImage} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400 italic">بدون</div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 truncate max-w-[150px]">{item.categories}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {previewData.length > 10 && (
                                            <div className="p-3 bg-gray-50 dark:bg-dark-tertiary text-center text-[10px] text-gray-500 font-bold">
                                                ... بالإضافة إلى {previewData.length - 10} قالب آخر
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-gray-50/50 dark:bg-dark-tertiary border-t border-gray-100 dark:border-dark-card-border flex items-center justify-between">
                            <button
                                onClick={step === 1 ? onClose : () => setStep(1)}
                                className="px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-primary rounded-xl transition-all"
                            >
                                {step === 1 ? 'إلغاء' : 'السابق'}
                            </button>

                            <button
                                disabled={parsing || importing || (step === 1 && !file)}
                                onClick={step === 1 ? parseAndMatch : handleImport}
                                className={`flex items-center gap-2 px-8 py-2.5 text-sm font-black rounded-xl transition-all shadow-lg ${step === 2 ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-200 dark:shadow-none' : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-200 dark:shadow-none'} disabled:opacity-50`}
                            >
                                {parsing || importing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {parsing ? 'جاري التحليل والربط...' : 'جاري الاستيراد...'}
                                    </>
                                ) : (
                                    step === 1 ? <>{'تحليل ومراجعة البيانات'} <ChevronLeft className="w-4 h-4" /></> : 'تأكيد الاستيراد النهائي'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
