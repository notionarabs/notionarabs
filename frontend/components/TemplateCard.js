'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, Download, Globe } from 'lucide-react';

export function cleanDescription(desc) {
  if (!desc) return '';
  return desc
    .replace(/<[^>]*>/g, '') // remove html tags
    .replace(/[#*`_~>\[\]\(\)]/g, '') // strip markdown markers
    .replace(/\s+/g, ' ')
    .trim();
}

export function resolveTemplateLanguage(language, title = '', description = '') {
  const lang = (language || '').toLowerCase().trim();

  if (lang === 'ar-en' || lang === 'en-ar' || lang === 'both' || lang === 'bilingual' || lang === 'dual') {
    return { label: 'عربي / English', code: 'both' };
  }
  if (lang === 'en' || lang === 'english') {
    return { label: 'English', code: 'en' };
  }
  if (lang === 'ar' || lang === 'arabic') {
    return { label: 'عربي', code: 'ar' };
  }
  if (lang === 'fr' || lang === 'french') {
    return { label: 'Français', code: 'fr' };
  }

  // Automatic content heuristic if language is missing or default
  const sample = `${title} ${description}`.trim();
  if (sample) {
    const arabicRegex = /[\u0600-\u06FF]/g;
    const latinRegex = /[a-zA-Z]/g;
    const arabicMatches = sample.match(arabicRegex) || [];
    const latinMatches = sample.match(latinRegex) || [];

    // If both scripts have meaningful presence
    if (arabicMatches.length >= 10 && latinMatches.length >= 10) {
      return { label: 'عربي / English', code: 'both' };
    }
    // If predominantly English
    if (latinMatches.length > arabicMatches.length * 2 && latinMatches.length >= 8) {
      return { label: 'English', code: 'en' };
    }
  }

  return { label: 'عربي', code: 'ar' };
}

export default function TemplateCard({ template, className = '' }) {
  if (!template) return null;

  const isPaid = template.isPaid && Number(template.price) > 0;
  const priceDisplay = isPaid ? `${template.price} ج.م` : 'مجاني';
  const categoryDisplay = template.categories?.[0] || template.category || 'عام';
  const ratingDisplay = (template.rating || 5).toFixed(1);
  const reviewsCount = template.reviewsCount || template.ratingsCount || 0;
  const downloadsCount = (template.downloads || 0).toLocaleString();
  const creatorName = template.creator?.name || 'نُخبة المبدعين';
  const creatorAvatar = template.creator?.profilePicture;
  const descriptionText = cleanDescription(template.description) || 'نظام نوشن متكامل ومصمم باحترافية لتعزيز الإنتاجية وتنظيم أعمالك بكفاءة عالية.';
  
  const { label: languageLabel } = resolveTemplateLanguage(template.language, template.title, template.description);

  return (
    <Link 
      href={`/templates/${template.slug || template._id || template.id}`} 
      className={`group relative block h-full ${className}`}
    >
      <div className="bg-white/50 dark:bg-white/5 backdrop-blur-[40px] rounded-[2rem] sm:rounded-[2.5rem] shadow-large group-hover:shadow-glow group-hover:-translate-y-2.5 transition-all duration-500 h-full flex flex-col border border-black/5 dark:border-white/5 overflow-hidden isolate relative text-right">
        {/* Subtle ambient hover gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        {/* Thumbnail Preview */}
        <div className="relative aspect-[16/10] m-2 sm:m-3 overflow-hidden rounded-2xl sm:rounded-[1.75rem] shadow-soft bg-black/5 dark:bg-white/5">
          <Image
            src={template.previewImage || '/placeholder-template.jpg'}
            alt={template.title || 'قالب نوشن'}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
          />

          {/* Price Badge */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20">
            <div className={`px-3.5 py-1.5 backdrop-blur-xl rounded-xl text-white font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-lg ${
              isPaid ? 'bg-primary/90' : 'bg-black/60 dark:bg-black/80'
            }`}>
              {priceDisplay}
            </div>
          </div>

          {/* Language Badge */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
            <div className="px-2.5 py-1 bg-black/50 dark:bg-black/70 backdrop-blur-md rounded-lg text-white/95 text-[10px] font-black tracking-wide border border-white/10 shadow-md">
              {languageLabel}
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col relative z-20">
          {/* Category & Rating Row */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-black text-primary uppercase tracking-wider truncate max-w-[120px]">
              {categoryDisplay}
            </span>

            <div className="flex items-center gap-1.5 shrink-0">
              <Star size={13} className="text-yellow-500 fill-yellow-500" />
              <span className="text-xs sm:text-sm font-black text-accent-900 dark:text-white">
                {ratingDisplay}
              </span>
              {reviewsCount > 0 && (
                <span className="text-[11px] font-medium text-accent-900/40 dark:text-white/30">
                  ({reviewsCount})
                </span>
              )}
            </div>
          </div>

          {/* Title (2 lines clamp + auto direction) */}
          <h3 
            dir="auto"
            className="text-base sm:text-lg font-black text-accent-900 dark:text-white mb-2 group-hover:text-primary transition-colors tracking-tight leading-snug line-clamp-2 min-h-[2.75rem]"
          >
            {template.title}
          </h3>

          {/* Description Snippet (2 lines clamp + auto direction) */}
          <p 
            dir="auto"
            className="text-xs sm:text-sm text-accent-700/70 dark:text-white/50 mb-4 line-clamp-2 leading-relaxed font-normal"
          >
            {descriptionText}
          </p>

          {/* Optional Tag Highlights */}
          {Array.isArray(template.tags) && template.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {template.tags.slice(0, 2).map((tag, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-accent-900/5 dark:bg-white/5 text-[10px] text-accent-900/60 dark:text-white/40 font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Card Footer: Creator & Downloads */}
          <div className="flex items-center justify-between pt-3.5 border-t border-accent-900/5 dark:border-white/5 mt-auto">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full overflow-hidden bg-primary/10 relative shrink-0 shadow-soft">
                {creatorAvatar ? (
                  <Image src={creatorAvatar} alt={creatorName} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-primary">
                    {creatorName.charAt(0)}
                  </div>
                )}
              </div>
              <span className="text-xs font-black text-accent-900/70 dark:text-white/70 group-hover:text-primary transition-colors truncate">
                {creatorName}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-accent-900/40 dark:text-white/30 font-black text-xs uppercase tracking-wider shrink-0">
              <Download size={13} />
              <span>{downloadsCount}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
