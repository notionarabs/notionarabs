'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
    useEffect(() => {
        console.error('Global error:', error);
    }, [error]);

    return (
        <html lang="ar" dir="rtl">
            <body style={{ margin: 0, fontFamily: 'Tajawal, Arial, sans-serif', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem' }}>
                <div style={{ textAlign: 'center', maxWidth: '480px', width: '100%' }}>
                    <div style={{ fontSize: '5rem', fontWeight: 900, color: '#f5631e', marginBottom: '1rem', lineHeight: 1 }}>
                        ⚠️
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1a1d21', marginBottom: '0.75rem' }}>
                        حدث خطأ في التطبيق
                    </h1>
                    <p style={{ color: '#6e7681', fontSize: '1rem', marginBottom: '2rem', lineHeight: 1.7 }}>
                        واجهنا مشكلة غير متوقعة. يرجى تحديث الصفحة أو العودة لاحقاً.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={reset}
                            style={{ padding: '0.875rem 2rem', background: '#f5631e', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                            إعادة المحاولة
                        </button>
                        <button
                            onClick={() => { window.location.href = '/'; }}
                            style={{ padding: '0.875rem 2rem', background: '#f3f4f6', color: '#1a1d21', border: 'none', borderRadius: '14px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                            الرئيسية
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
