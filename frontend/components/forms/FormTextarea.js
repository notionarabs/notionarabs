'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export const FormTextarea = forwardRef(({
  label,
  error,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-accent-700 dark:text-dark-text-primary"
        >
          {label}
        </label>
      )}
      
      <motion.textarea
        ref={ref}
        id={inputId}
        className={clsx(
          'w-full px-4 py-3 bg-white dark:bg-dark-tertiary border border-gray-200 dark:border-dark-input-border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 text-accent-700 dark:text-dark-text-primary placeholder-accent-400 dark:placeholder-accent-500 resize-vertical min-h-[100px]',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        whileFocus={{ scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        {...props}
      />
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
});

FormTextarea.displayName = 'FormTextarea';
