'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export function Card({ children, className, hover = false, ...props }) {
  return (
    <motion.div
      className={clsx(
        'bg-white dark:bg-dark-secondary rounded-xl shadow-sm border border-gray-200 dark:border-dark-card-border',
        hover && 'hover:shadow-md hover:border-accent-300 dark:hover:border-accent-400 transition-all duration-300',
        className
      )}
      whileHover={hover ? { y: -2 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={clsx('p-6 pb-0', className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={clsx('p-6', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div className={clsx('p-6 pt-0', className)} {...props}>
      {children}
    </div>
  );
}
