'use client';

import React from 'react';
import Link from 'next/link';

export default class PaymentErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error('PaymentErrorBoundary caught:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-primary p-8" dir="rtl">
                    <div className="max-w-md w-full text-center bg-gray-50 dark:bg-dark-secondary rounded-[2.5rem] border border-gray-100 dark:border-dark-card-border p-12 shadow-lg">
                        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">حدث خطأ غير متوقع</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
                            نأسف على الإزعاج. يرجى تحديث الصفحة أو العودة للمتجر.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
                                className="px-6 py-3 bg-primary text-white font-bold rounded-2xl hover:opacity-90 transition-opacity"
                            >
                                تحديث الصفحة
                            </button>
                            <Link
                                href="/templates"
                                className="px-6 py-3 bg-gray-100 dark:bg-dark-tertiary text-gray-700 dark:text-gray-200 font-bold rounded-2xl hover:opacity-90 transition-opacity"
                            >
                                العودة للمتجر
                            </Link>
                        </div>
                        {this.props.supportLink && (
                            <p className="mt-6 text-xs text-gray-400">
                                تحتاج مساعدة؟{' '}
                                <Link href="/contact" className="text-primary font-bold hover:underline">
                                    تواصل مع الدعم
                                </Link>
                            </p>
                        )}
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
