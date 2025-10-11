'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  ...props
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div
        className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-sm">فشل تحميل الصورة</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <motion.div
          className="absolute inset-0 bg-gray-200 dark:bg-gray-700"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        />
      )}

      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        quality={quality}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL || `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3C/svg%3E`}
        onLoad={handleLoad}
        onError={handleError}
        className="transition-opacity duration-300"
        style={{
          opacity: isLoading ? 0 : 1,
        }}
        {...props}
      />
    </div>
  );
}

// Template preview image component with specific optimizations
export function TemplatePreviewImage({ src, alt, className = '' }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={300}
      height={200}
      className={`rounded-lg object-cover ${className}`}
      quality={80}
      priority={false}
    />
  );
}

// Avatar image component
export function AvatarImage({ src, alt, size = 40, className = '' }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      quality={90}
    />
  );
}
