'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const Toast = ({
  message,
  type = 'info',
  duration = 5000,
  onClose
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration;

    const timer = setTimeout(() => {
      onClose && onClose();
    }, duration);

    const progressInterval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const percent = (remaining / duration) * 100;
      setProgress(percent);
      
      if (percent <= 0) clearInterval(progressInterval);
    }, 10);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [duration, onClose]);

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
          borderColor: 'border-green-500/30',
          bgColor: 'bg-green-500/10',
          progressBarColor: 'bg-green-500',
          textColor: 'text-green-800 dark:text-green-200'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          borderColor: 'border-red-500/30',
          bgColor: 'bg-red-500/10',
          progressBarColor: 'bg-red-500',
          textColor: 'text-red-800 dark:text-red-200'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
          borderColor: 'border-orange-500/30',
          bgColor: 'bg-orange-500/10',
          progressBarColor: 'bg-orange-500',
          textColor: 'text-orange-800 dark:text-orange-200'
        };
      default:
        return {
          icon: <Info className="w-5 h-5 text-blue-500" />,
          borderColor: 'border-blue-500/30',
          bgColor: 'bg-blue-500/10',
          progressBarColor: 'bg-blue-500',
          textColor: 'text-blue-800 dark:text-blue-200'
        };
    }
  };

  const config = getTypeConfig();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.9, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)', transition: { duration: 0.2 } }}
      className="relative group pointer-events-auto"
      dir="rtl"
    >
      <div className={`
        max-w-md w-full overflow-hidden
        backdrop-blur-xl bg-white/10 dark:bg-black/60 
        ${config.borderColor} border rounded-2xl shadow-2xl
        p-4 transition-all duration-300
        hover:shadow-orange-500/10 hover:border-orange-500/20
      `}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5 animate-pulse-subtle">
            {config.icon}
          </div>
          <div className="flex-1">
            <p className={`text-[15px] font-medium leading-relaxed ${config.textColor}`}>
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/5"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/5">
          <motion.div
            className={`h-full ${config.progressBarColor} shadow-[0_0_10px_rgba(249,115,22,0.3)]`}
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Toast;


