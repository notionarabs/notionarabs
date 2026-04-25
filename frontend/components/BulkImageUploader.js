'use client';

import { useState, useRef } from 'react';
import { Upload, Copy, Check, Trash2, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import { useToast } from '../contexts/ToastContext';

export default function BulkImageUploader() {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [results, setResults] = useState([]);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef(null);
    const { showSuccess, showError } = useToast();
    const [copiedIndex, setCopiedIndex] = useState(null);

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const validFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
        
        if (validFiles.length < selectedFiles.length) {
            showError('بعض الملفات المختارة ليست صوراً صالحة');
        }

        setFiles(prev => [...prev, ...validFiles.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            preview: URL.createObjectURL(file),
            status: 'idle' // idle, uploading, success, error
        }))]);
    };

    const removeFile = (id) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const uploadImages = async () => {
        if (files.length === 0) return;
        
        setUploading(true);
        setResults([]);
        setProgress(0);

        const newResults = [];
        let completed = 0;

        for (let i = 0; i < files.length; i++) {
            const fileItem = files[i];
            
            // Update status to uploading
            setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'uploading' } : f));

            try {
                const formData = new FormData();
                formData.append('image', fileItem.file);

                const response = await api.post('/upload/image', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (response.data.success) {
                    const url = response.data.data.imageUrl;
                    newResults.push({
                        name: fileItem.file.name,
                        url: url
                    });
                    
                    setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'success', url } : f));
                }
            } catch (err) {
                console.error(`Error uploading ${fileItem.file.name}:`, err);
                setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'error' } : f));
            }

            completed++;
            setProgress(Math.round((completed / files.length) * 100));
        }

        setResults(newResults);
        setUploading(false);
        showSuccess('تم الانتهاء من رفع الصور');
    };

    const copyToClipboard = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
        showSuccess('تم نسخ الرابط');
    };

    const copyAllLinks = () => {
        const links = results.map(r => r.url).join('\n');
        navigator.clipboard.writeText(links);
        showSuccess('تم نسخ جميع الروابط');
    };

    return (
        <div className="space-y-8" dir="rtl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-dark-text-primary mb-2">رفع صور بالجملة</h2>
                    <p className="text-sm text-gray-600 dark:text-dark-text-secondary">ارفع صورك هنا واحصل على روابط مباشرة لاستخدامها في ملف الـ CSV.</p>
                </div>
                
                {results.length > 0 && (
                    <button 
                        onClick={copyAllLinks}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Copy size={18} />
                        <span>نسخ جميع الروابط</span>
                    </button>
                )}
            </div>

            {/* Dropzone */}
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-4 border-dashed border-gray-200 dark:border-dark-card-border rounded-[2rem] p-12 text-center hover:border-primary-400 dark:hover:border-orange-500 transition-all cursor-pointer bg-white dark:bg-dark-secondary group"
            >
                <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                />
                <div className="w-20 h-20 bg-primary-50 dark:bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Upload size={40} className="text-primary-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">اضغط هنا أو اسحب الصور لرفعها</h3>
                <p className="text-gray-500 dark:text-dark-text-tertiary">PNG, JPG, WebP حتى 5 ميجابايت (سيتم تحويلها تلقائياً إلى WebP للمتجر)</p>
            </div>

            {/* Selected Files Grid */}
            {files.length > 0 && (
                <div className="bg-white dark:bg-dark-secondary rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-dark-card-border">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="font-bold text-gray-900 dark:text-dark-text-primary flex items-center gap-2">
                            <ImageIcon size={20} className="text-primary-600" />
                            الملفات المختارة ({files.length})
                        </h4>
                        <button 
                            disabled={uploading}
                            onClick={uploadImages}
                            className="btn-primary flex items-center gap-2"
                        >
                            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                            <span>بدء الرفع ({files.filter(f => f.status === 'idle').length})</span>
                        </button>
                    </div>

                    {uploading && (
                        <div className="mb-6">
                            <div className="flex justify-between text-xs font-bold mb-2">
                                <span className="text-primary-600">{progress}%</span>
                                <span className="text-gray-500">جاري الرفع...</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 dark:bg-dark-tertiary rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary-600 transition-all duration-300" 
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {files.map((fileItem, index) => (
                            <div 
                                key={fileItem.id}
                                className="relative group rounded-2xl overflow-hidden aspect-square border border-gray-100 dark:border-dark-card-border bg-gray-50 dark:bg-dark-tertiary"
                            >
                                <img 
                                    src={fileItem.preview} 
                                    alt="" 
                                    className={`w-full h-full object-cover transition-opacity ${fileItem.status === 'uploading' ? 'opacity-50' : 'opacity-100'}`}
                                />
                                
                                {/* Overlay status */}
                                {fileItem.status === 'uploading' && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                        <Loader2 className="text-white animate-spin" size={32} />
                                    </div>
                                )}
                                
                                {fileItem.status === 'success' && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
                                        <div className="bg-green-500 text-white rounded-full p-1 shadow-lg">
                                            <Check size={20} />
                                        </div>
                                    </div>
                                )}

                                {fileItem.status === 'error' && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
                                        <div className="bg-red-50 text-red-500 rounded-full p-1 shadow-lg">
                                            <AlertCircle size={20} />
                                        </div>
                                    </div>
                                )}

                                {/* Delete button (only if not uploading) */}
                                {!uploading && fileItem.status !== 'success' && (
                                    <button 
                                        onClick={() => removeFile(fileItem.id)}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}

                                {/* Copy Link button (if success) */}
                                {fileItem.status === 'success' && (
                                    <button 
                                        onClick={() => copyToClipboard(fileItem.url, index)}
                                        className="absolute bottom-2 left-2 right-2 bg-white/90 dark:bg-black/80 backdrop-blur-md text-gray-900 dark:text-white py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        {copiedIndex === index ? <Check size={12} /> : <Copy size={12} />}
                                        {copiedIndex === index ? 'تم النسخ' : 'نسخ الرابط'}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/10 dark:to-accent-900/10 border border-primary-100 dark:border-primary-900/30 rounded-[2.5rem] p-8 sm:p-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-primary-500/5 rounded-full -translate-x-16 -translate-y-16" />
                <div className="relative z-10">
                    <h4 className="text-xl font-black text-gray-900 dark:text-dark-text-primary mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-orange-500/20 rounded-xl flex items-center justify-center text-primary-600 dark:text-orange-400">
                            <AlertCircle size={24} />
                        </div>
                        كيف تستخدم هذه الصور في ملف الـ CSV؟
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-3">
                            <div className="text-lg font-bold text-primary-600 dark:text-orange-400 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-orange-500/20 flex items-center justify-center text-sm">1</span>
                                رفع الصور
                            </div>
                            <p className="text-sm text-gray-600 dark:text-dark-text-secondary leading-relaxed">
                                قم بسحب وإفلات جميع صور القوالب التي تريد إضافتها في المربع أعلاه واضغط على <strong>"بدء الرفع"</strong>.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="text-lg font-bold text-primary-600 dark:text-orange-400 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-orange-500/20 flex items-center justify-center text-sm">2</span>
                                نسخ الروابط
                            </div>
                            <p className="text-sm text-gray-600 dark:text-dark-text-secondary leading-relaxed">
                                بعد انتهاء الرفع، ستظهر لك الصور وبجانبها زر <strong>"نسخ الرابط"</strong>. قم بنسخ الرابط المباشر لكل صورة.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="text-lg font-bold text-primary-600 dark:text-orange-400 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-orange-500/20 flex items-center justify-center text-sm">3</span>
                                اللصق في CSV
                            </div>
                            <p className="text-sm text-gray-600 dark:text-dark-text-secondary leading-relaxed">
                                افتح ملف الـ CSV الخاص بك، وابحث عن عمود <strong>"صورة القالب"</strong>، وقم بلصق الرابط الذي نسخته أمام اسم القالب الصحيح.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
                        <p className="text-xs text-gray-500 dark:text-dark-text-tertiary flex items-center gap-2 italic">
                            <Check className="text-green-500" size={14} />
                            نصيحة: يمكنك استخدام زر "نسخ جميع الروابط" في الأعلى إذا كنت تريد نسخ كل الروابط دفعة واحدة!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
