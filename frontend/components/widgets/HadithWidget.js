'use client';

import { useState, useEffect } from 'react';
import { BookOpen, RefreshCw, Settings, Quote } from 'lucide-react';

export default function HadithWidget({
    theme = 'dark',
    font = 'tajawal',
    showTranslation = true,
    id = 'hadith'
}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editUrl, setEditUrl] = useState('#');

    useEffect(() => {
        setEditUrl(`${window.location.origin}/widgets/${id}?theme=${theme}&font=${font}&showTranslation=${showTranslation}`);
    }, [id, theme, font, showTranslation]);

    const fetchHadith = async () => {
        try {
            setLoading(true);
            const collections = ['bukhari', 'muslim', 'abudawud', 'tirmidhi', 'nasai', 'ibnmajah'];
            const randomCollection = collections[Math.floor(Math.random() * collections.length)];

            const res = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-${randomCollection}.json`);
            const result = await res.json();

            const totalHadiths = result.hadiths.length;
            const randomIndex = Math.floor(Math.random() * totalHadiths);
            const hadith = result.hadiths[randomIndex];

            let translation = "";
            if (showTranslation) {
                const resEn = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-${randomCollection}.json`);
                const resultEn = await resEn.json();
                translation = resultEn.hadiths[randomIndex]?.text || "";
            }

            setData({
                arabic: hadith.text,
                translation: translation,
                source: result.metadata.name,
                reference: `Hadith No. ${hadith.hadithnumber}`,
            });
        } catch (err) {
            console.error('Failed to fetch Hadith:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHadith();
    }, []);

    const fontClasses = {
        tajawal: 'font-tajawal',
        cairo: 'font-cairo',
        amiri: 'font-amiri',
        almarai: 'font-almarai',
        changa: 'font-changa'
    };

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
    );

    return (
        <div className={`w-full max-w-2xl p-8 rounded-[2.5rem] transition-all duration-500 relative group overflow-hidden ${theme === 'dark'
            ? 'bg-[#191919] text-white border border-[#2f2f2f]'
            : 'bg-white text-accent-900 border border-gray-100 shadow-xl'
            }`} dir="rtl">

            {/* Edit Button */}
            <a
                href={editUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-4 left-4 p-2 rounded-full bg-gray-500/10 hover:bg-primary-500 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 z-50 text-gray-400"
                title="تعديل الأداة"
            >
                <Settings className="w-4 h-4" />
            </a>

            <div className="flex flex-col items-center text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-500/10 text-primary-600 rounded-full text-xs font-bold mb-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>حديث اليوم الشريف</span>
                </div>

                <Quote className="w-8 h-8 text-primary-500/20 absolute right-8 top-20 pointer-events-none" />

                <div className="relative px-4">
                    <h2 className={`text-xl md:text-2xl font-bold leading-[1.8] md:leading-[2] mb-6 ${fontClasses[font]}`}>
                        {data?.arabic}
                    </h2>
                </div>

                {showTranslation && data?.translation && (
                    <div className="w-full pt-6 border-t border-gray-100 dark:border-dark-card-border">
                        <p className="text-sm md:text-base text-gray-500 dark:text-dark-text-secondary italic leading-relaxed" dir="ltr">
                            &ldquo;{data?.translation}&rdquo;
                        </p>
                    </div>
                )}

                <div className="flex items-center justify-between w-full pt-6 border-t border-gray-100 dark:border-dark-card-border mt-4">
                    <div className="flex gap-4">
                        <button
                            onClick={fetchHadith}
                            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-colors"
                            title="تحديث"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="text-right">
                        <div className="text-sm font-black text-primary-600">
                            {data?.source}
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                            {data?.reference}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
