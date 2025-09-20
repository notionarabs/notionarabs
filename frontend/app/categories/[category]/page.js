'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function CategoryPage({ params }) {

  const category = params.category;
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">

      {/* Category Header */}
      <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h1 className="heading-1 mb-6">قوالب {categoryName}</h1>
            <p className="body-large text-accent-700 dark:text-dark-text-secondary max-w-3xl mx-auto">
              اكتشف أفضل القوالب في فئة {categoryName} واختر ما يناسب احتياجاتك
            </p>
          </div>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="section-padding bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center py-16">
            <h2 className="heading-2 mb-4">قوالب {categoryName}</h2>
            <p className="body-large text-accent-600 dark:text-dark-text-secondary mb-8">
              قوالب مخصصة لفئة {categoryName} مصممة بعناية لمساعدتك في تحقيق أهدافك
            </p>
            <Link href="/templates" className="btn-primary">
              تصفح جميع القوالب
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-accent-500 dark:bg-dark-secondary text-white dark:text-dark-text-primary transition-colors duration-300">
        <div className="container-custom section-padding">
          <div className="text-center">
            <p className="text-gray-400 dark:text-dark-text-tertiary text-sm">
              © {new Date().getFullYear()} عرب نوشن. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
