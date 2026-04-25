'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileText, AlertCircle, CheckCircle2, Loader2, Check, Trash2, Image as ImageIcon, ChevronRight, ChevronLeft } from 'lucide-react';
import api from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImportTemplatesModal({ isOpen, onClose, onSuccess }) {
    const [step, setStep] = useState(1); // 1: Images, 2: CSV, 3: Preview
    const [file, setFile] = useState(null);
    const [parsing, setParsing] = useState(false);
    const [importing, setImporting] = useState(false);
    const [previewData, setPreviewData] = useState([]);
    const [importErrors, setImportErrors] = useState([]);
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
        if (imageFiles.length === 0) return true;
        
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

    const downloadTemplateWithImages = async () => {
        if (imageFiles.length === 0) {
            showError('يرجى اختيار صور أولاً');
            return;
        }

        const imagesReady = await uploadImages();
        if (!imagesReady) {
            showError('حدث خطأ أثناء رفع بعض الصور');
            return;
        }

        const uploadedImages = imageFiles.filter(f => f.status === 'success' && f.url);
        if (uploadedImages.length === 0) {
            showError('لم يتم رفع أي صور بنجاح');
            return;
        }

        const headers = 'العنوان,الوصف,رابط نوشن,الفئات (حتى 3 مفصولة بـ |),مدفوع (نعم/لا),السعر بالجنيه (0 إذا مجاني),رابط الصورة,المميزات (كل ميزة في سطر),الوسوم (مفصولة بفاصلة),لغة القالب (ar/en/ar-en),رابط فيديو توضيحي للقالب (اختياري)\n';
        const rows = uploadedImages.map(img => {
            const placeholderTitle = img.file.name.split('.')[0];
            return `"${placeholderTitle}","وصف القالب هنا...","https://username.notion.site/template-id","إنتاجية","نعم","50","${img.url}","ميزة 1\nميزة 2\nميزة 3","نوشن, تنظيم","ar",""`;
        }).join('\n');

        const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'templates_with_images.csv';
        link.click();
        showSuccess('تم تحميل الملف. قم بتعبئة البيانات ثم انتقل للخطوة التالية.');
    };

    // --- CSV Handlers ---
    const handleCSVChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile);
            setError(null);
            parseCSV(selectedFile);
        } else {
            setError('يرجى اختيار ملف CSV صالح');
            setFile(null);
        }
    };

    const parseCSV = (csvFile) => {
        setParsing(true);
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
                        // Order matters: check more specific patterns first
                        if (header.includes('فيديو') || header.includes('video') || header.includes('explanation')) key = 'explanationVideo';
                        else if (header.includes('صور إضافية') || header.includes('صور معاينة') || header.includes('previewimages')) key = 'previewImages';
                        else if (header.includes('صورة') || header.includes('image') || header.includes('preview')) key = 'previewImage';
                        else if (header.includes('عنوان') || header.includes('title')) key = 'title';
                        else if (header.includes('وصف') || header.includes('description')) key = 'description';
                        else if (header.includes('نوشن') || header.includes('notion')) key = 'notionLink';
                        else if (header.includes('رابط') || header.includes('link') || header.includes('url')) key = 'notionLink';
                        else if (header.includes('فئة') || header.includes('فئات') || header.includes('تصنيف') || header.includes('categories')) key = 'categories';
                        else if (header.includes('مدفوع') || header.includes('paid')) key = 'isPaid';
                        else if (header.includes('سعر') || header.includes('price')) key = 'price';
                        else if (header.includes('لغة') || header.includes('language')) key = 'language';
                        else if (header.includes('وسم') || header.includes('وسوم') || header.includes('tag')) key = 'tags';
                        else if (header.includes('ميزة') || header.includes('مميزات') || header.includes('feature')) key = 'features';

                        if (key) obj[key] = row[index];
                    });

                    // Auto-match images (fallback)
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
                setStep(3); // Go to preview
            } catch (err) {
                console.error('CSV Parsing error:', err);
                setError('حدث خطأ أثناء تحليل ملف CSV. تأكد من التنسيق الصحيح.');
            } finally {
                setParsing(false);
            }
        };
        reader.readAsText(csvFile);
    };

    const handleImport = async () => {
        if (previewData.length === 0) return;

        setImporting(true);
        try {
            // Validation: Ensure all notionLinks are notion.site
            const invalidLinks = previewData.filter(item => item.notionLink && !item.notionLink.includes('notion.site'));
            if (invalidLinks.length > 0) {
                showError(`يوجد ${invalidLinks.length} قوالب بروابط غير صحيحة. يجب استخدام روابط notion.site فقط.`);
                setImporting(false);
                return;
            }

            const formattedData = previewData.map(item => ({
                ...item,
                isPaid: item.isPaid?.toLowerCase() === 'true' || item.isPaid === '1' || item.isPaid === 'نعم' || item.isPaid?.toLowerCase() === 'paid',
                price: parseFloat(String(item.price).replace(/[^\d.]/g, '')) || 0,
                categories: item.categories ? (Array.isArray(item.categories) ? item.categories : item.categories.split('|').map(c => c.trim()).filter(Boolean)) : [],
                tags: item.tags ? (Array.isArray(item.tags) ? item.tags : item.tags.split(',').map(t => t.trim())) : [],
                features: item.features ? (Array.isArray(item.features) ? item.features : item.features.split('\n').map(f => f.trim())) : [],
                language: item.language || undefined,
                explanationVideo: item.explanationVideo || undefined,
                previewImages: item.previewImages ? (Array.isArray(item.previewImages) ? item.previewImages : item.previewImages.split(',').map(u => u.trim()).filter(Boolean)) : []
            }));

            const response = await api.post('/templates/bulk-import', { templates: formattedData });

            if (response.data.success) {
                const successList = response.data.results.success || [];

                // Auto-download links CSV if any templates were imported successfully
                if (successList.length > 0) {
                    const baseUrl = 'https://notionarabs.com';
                    const csvHeader = '\u0627\u0644\u0639\u0646\u0648\u0627\u0646,\u0631\u0627\u0628\u0637 \u0627\u0644\u0642\u0627\u0644\u0628 \u0641\u064a \u0627\u0644\u0645\u0646\u0635\u0629\n';
                    const csvRows = successList.map(t => {
                        const title = `"${(t.title || '').replace(/"/g, '""')}"`;
                        const link = t.slug ? `"${baseUrl}/templates/${t.slug}"` : '""';
                        return `${title},${link}`;
                    }).join('\n');
                    const blob = new Blob(['\uFEFF' + csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = `imported-templates-links-${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                }

                if (response.data.results.errors.length > 0) {
                    setImportErrors(response.data.results.errors);
                    showError(`\u062a\u0645 \u0627\u0633\u062a\u064a\u0631\u0627\u062f ${successList.length} \u0642\u0648\u0627\u0644\u0628\u060c \u0648\u0641\u0634\u0644 ${response.data.results.errors.length}`);
                } else {
                    showSuccess(response.data.message);
                    onSuccess();
                    onClose();
                }
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
                        className="relative bg-white dark:bg-dark-secondary rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]"
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
                                    <p className="text-xs font-bold text-gray-500 dark:text-dark-text-secondary">ارفع الصور أولاً لتوليد ملف CSV جاهز</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-primary rounded-xl transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Steps Indicator */}
                        <div className="px-6 py-4 bg-white dark:bg-dark-secondary border-b border-gray-50 dark:border-dark-card-border flex items-center justify-center gap-4">
                            {[
                                { id: 1, label: 'رفع الصور', icon: ImageIcon },
                                { id: 2, label: 'رفع CSV', icon: FileText },
                                { id: 3, label: 'المراجعة', icon: CheckCircle2 }
                            ].map((s, idx) => (
                                <div key={s.id} className="flex items-center gap-2">
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${step === s.id ? 'bg-primary-50 dark:bg-orange-500/10 text-primary-600 dark:text-orange-500' : step > s.id ? 'text-green-500' : 'text-gray-400'}`}>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${step === s.id ? 'bg-primary-600 text-white shadow-lg' : step > s.id ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-dark-tertiary'}`}>
                                            {step > s.id ? <Check className="w-3.5 h-3.5" /> : s.id}
                                        </div>
                                        <span className="text-xs font-black hidden sm:inline">{s.label}</span>
                                    </div>
                                    {idx < 2 && <div className={`w-8 h-0.5 rounded-full ${step > s.id ? 'bg-green-500' : 'bg-gray-100 dark:bg-dark-tertiary'}`} />}
                                </div>
                            ))}
                        </div>

                        <div className="p-6 overflow-y-auto min-h-[400px]">
                            {step === 1 && (
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                    <div className="bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-dark-text-primary mb-1">الخطوة 1: ارفع صور القوالب</h4>
                                            <p className="text-xs text-gray-500 dark:text-dark-text-secondary">بعد الرفع، يمكنك تحميل ملف CSV يحتوي على روابط الصور جاهزة.</p>
                                        </div>
                                        {imageFiles.length > 0 && (
                                            <button 
                                                onClick={downloadTemplateWithImages} 
                                                disabled={uploadingImages}
                                                className="px-4 py-2 bg-white dark:bg-dark-tertiary border border-primary-200 text-primary-600 rounded-xl text-xs font-black shadow-sm"
                                            >
                                                {uploadingImages ? 'جاري الرفع...' : 'تحميل CSV بالصور'}
                                            </button>
                                        )}
                                    </div>

                                    <div 
                                        onClick={() => imageInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-200 dark:border-dark-card-border rounded-2xl p-12 text-center hover:border-primary-500 transition-all cursor-pointer bg-gray-50/30 dark:bg-dark-primary/30 group"
                                    >
                                        <input type="file" multiple accept="image/*" className="hidden" ref={imageInputRef} onChange={handleImageSelect} />
                                        <div className="w-16 h-16 bg-white dark:bg-dark-secondary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                            <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-primary-500" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-700 dark:text-dark-text-primary">اضغط لاختيار الصور أو اسحبها هنا</p>
                                    </div>

                                    {imageFiles.length > 0 && (
                                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                            {imageFiles.map((f) => (
                                                <div key={f.id} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 dark:border-dark-card-border bg-white dark:bg-dark-tertiary group">
                                                    <img src={f.preview} alt="" className="w-full h-full object-cover" />
                                                    <button onClick={() => removeImage(f.id)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                    {f.status === 'success' && (
                                                        <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center text-white">
                                                            <Check className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                    {f.status === 'uploading' && (
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                    <div className="p-4 bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/20 rounded-2xl">
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-dark-text-primary mb-1">الخطوة 2: ارفع ملف الـ CSV المعبأ</h4>
                                        <p className="text-xs text-gray-500 dark:text-dark-text-secondary">ارفع الملف الذي قمت بتعبئته بالبيانات (والذي يحتوي على روابط الصور).</p>
                                    </div>

                                    <div 
                                        onClick={() => csvInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-200 dark:border-dark-card-border rounded-2xl p-16 text-center hover:border-primary-500 transition-all cursor-pointer bg-gray-50/30 dark:bg-dark-primary/30 group"
                                    >
                                        <input type="file" accept=".csv" className="hidden" ref={csvInputRef} onChange={handleCSVChange} />
                                        <div className="w-20 h-20 bg-white dark:bg-dark-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                            <FileText className="w-10 h-10 text-gray-400 group-hover:text-primary-500" />
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-2">اختر ملف CSV</h4>
                                        <p className="text-sm text-gray-500">سيتم تحليل الملف للمراجعة فوراً</p>
                                    </div>

                                    <div className="flex justify-center">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const headers = 'العنوان,الوصف,رابط نوشن,الفئات (حتى 3 مفصولة بـ |),مدفوع (نعم/لا),السعر بالجنيه (0 إذا مجاني),رابط الصورة,المميزات (كل ميزة في سطر),الوسوم (مفصولة بفاصلة),لغة القالب (ar/en/ar-en),رابط فيديو توضيحي للقالب (اختياري)\n';
                                                const sample = '"قالب مجاني مثال","وصف القالب...","https://username.notion.site/template-id","إنتاجية|الدراسة","لا","0","TemplateA.png","ميزة 1\nميزة 2\nميزة 3","نوشن, تنظيم","ar",""';
                                                const blob = new Blob(['\uFEFF' + headers + sample], { type: 'text/csv;charset=utf-8;' });
                                                const link = document.createElement('a');
                                                link.href = URL.createObjectURL(blob);
                                                link.download = 'templates_sample.csv';
                                                link.click();
                                            }}
                                            className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-2"
                                        >
                                            <FileText className="w-3.5 h-3.5" /> تحميل ملف تجريبي (Sample)
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h5 className="text-sm font-bold text-gray-700 dark:text-dark-text-primary flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            تم تحليل {previewData.length} قالب بنجاح
                                        </h5>
                                        <button onClick={() => setStep(2)} className="text-xs font-bold text-primary-600 hover:underline">تغيير الملف</button>
                                    </div>

                                    <div className="rounded-2xl border border-gray-100 dark:border-dark-card-border overflow-hidden">
                                        <table className="w-full text-right text-xs">
                                            <thead className="bg-gray-50 dark:bg-dark-tertiary">
                                                <tr>
                                                    <th className="px-4 py-3 font-bold text-gray-700 dark:text-dark-text-secondary">العنوان</th>
                                                    <th className="px-4 py-3 font-bold text-gray-700 dark:text-dark-text-secondary">السعر</th>
                                                    <th className="px-4 py-3 font-bold text-gray-700 dark:text-dark-text-secondary">الصورة</th>
                                                    <th className="px-4 py-3 font-bold text-gray-700 dark:text-dark-text-secondary">الفئة</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 dark:divide-dark-card-border/50">
                                                {previewData.slice(0, 10).map((item, idx) => (
                                                    <tr key={idx} className="dark:text-dark-text-primary hover:bg-gray-50/50 dark:hover:bg-dark-primary/30 transition-colors">
                                                        <td className="px-4 py-3 font-bold truncate max-w-[200px]">{item.title}</td>
                                                        <td className="px-4 py-3">{item.price || '0'} ج.م</td>
                                                        <td className="px-4 py-3">
                                                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-dark-tertiary overflow-hidden border border-gray-100 dark:border-dark-card-border">
                                                                {item.previewImage ? <img src={item.previewImage} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-300">بدون</div>}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 truncate max-w-[150px]">{item.categories}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            )}

                            {importErrors.length > 0 && (
                                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-500/20">
                                    <h4 className="text-sm font-black text-red-600 mb-2">أخطاء الاستيراد ({importErrors.length}):</h4>
                                    <div className="space-y-1 max-h-[150px] overflow-y-auto pr-2">
                                        {importErrors.map((err, idx) => (
                                            <div key={idx} className="text-[10px] text-red-500 flex items-center justify-between border-b border-red-100 dark:border-red-900/30 py-1">
                                                <span className="font-bold truncate max-w-[150px]">{err.title}</span>
                                                <span className="opacity-80">{err.error}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setImportErrors([]);
                                            onSuccess(); // Refresh what WAS successful
                                        }} 
                                        className="mt-3 text-[10px] font-black text-red-600 hover:underline"
                                    >
                                        إخفاء الأخطاء والمتابعة
                                    </button>
                                </div>
                            )}

                            {error && (
                                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl flex items-start gap-3 border border-red-100 dark:border-red-500/20">
                                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                    <p className="text-sm text-red-600 font-bold">{error}</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-gray-50/50 dark:bg-dark-tertiary border-t border-gray-100 dark:border-dark-card-border flex items-center justify-between">
                            <button
                                onClick={step === 1 ? onClose : () => setStep(step - 1)}
                                className="px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-primary rounded-xl transition-all"
                            >
                                {step === 1 ? 'إلغاء' : 'السابق'}
                            </button>

                            <div className="flex gap-3">
                                {step === 1 && (
                                    <button
                                        onClick={() => setStep(2)}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white text-sm font-black rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-200 dark:shadow-none transition-all"
                                    >
                                        التالي: رفع CSV <ChevronLeft className="w-4 h-4" />
                                    </button>
                                )}
                                {step === 2 && parsing && (
                                    <div className="flex items-center gap-2 px-6 py-2.5 text-primary-600 font-bold animate-pulse">
                                        <Loader2 className="w-4 h-4 animate-spin" /> جاري التحليل...
                                    </div>
                                )}
                                {step === 3 && (
                                    <button
                                        disabled={importing}
                                        onClick={handleImport}
                                        className="flex items-center gap-2 px-8 py-2.5 bg-green-600 text-white text-sm font-black rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 dark:shadow-none transition-all"
                                    >
                                        {importing ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري الاستيراد...</> : 'تأكيد الاستيراد النهائي'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
