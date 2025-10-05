'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from './Card';
import StarRating from '../StarRating';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  hover: { y: -5, scale: 1.02 },
};

const imageVariants = {
  hover: { scale: 1.05 },
};

export function AnimatedTemplateCard({ template, index }) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      transition={{ 
        delay: index * 0.1,
        type: 'spring',
        stiffness: 400,
        damping: 17
      }}
    >
      <Link href={`/templates/${template._id || template.id}`}>
        <Card hover className="h-full cursor-pointer">
          <div className="relative overflow-hidden rounded-t-xl">
            <motion.div variants={imageVariants}>
              <Image
                src={template.previewImage || '/placeholder-template.jpg'}
                alt={template.title}
                width={300}
                height={200}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
            </motion.div>
            
            <motion.div
              className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300"
              whileHover={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
            />
          </div>
          
          <div className="p-4">
            <motion.h3 
              className="font-semibold text-accent-900 dark:text-dark-text-primary mb-2 line-clamp-2"
              layoutId={`template-title-${template._id || template.id}`}
            >
              {template.title}
            </motion.h3>
            
            <p className="text-sm text-accent-600 dark:text-dark-text-secondary mb-3 line-clamp-2">
              {template.description}
            </p>
            
            <div className="flex items-center justify-between">
              <StarRating 
                rating={template.rating || 0} 
                size="small" 
                showNumber={true} 
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                مجاني
              </span>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
