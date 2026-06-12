'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import PaymentErrorBoundary from '../../../components/PaymentErrorBoundary';

function PaymentCallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { ensureTokenInHeaders } = useAuth();

    useEffect(() => {
        const success = searchParams.get('success');
        const pending = searchParams.get('pending');
        const dbOrderId = searchParams.get('dbOrderId');
        const orderId = searchParams.get('order');
        const txnId = searchParams.get('id');
        const type = searchParams.get('type');

        const verifyAndRedirect = async () => {
            if (success === 'true' && pending === 'false') {
                let localPayment = null;
                if (typeof window !== 'undefined') {
                    try {
                        const stored = localStorage.getItem('pending_payment');
                        if (stored) {
                            localPayment = JSON.parse(stored);
                            localStorage.removeItem('pending_payment');
                        }
                    } catch (e) {
                        console.error('Error reading pending_payment from localStorage:', e);
                    }
                }

                const finalDbOrderId = dbOrderId || localPayment?.dbOrderId || '';
                const finalType = type || localPayment?.type || '';

                const successUrl = `/payment-success?id=${finalDbOrderId || orderId || txnId || ''}${finalType ? `&type=${finalType}` : ''}`;
                try {
                    ensureTokenInHeaders();
                    const params = Object.fromEntries(searchParams.entries());
                    if (finalDbOrderId) {
                        params.dbOrderId = finalDbOrderId;
                    }
                    await api.post('/payments/confirm-redirect', params);
                    router.replace(successUrl);
                } catch (err) {
                    console.error('Redirect confirmation call error:', err);
                    // 4xx means the server explicitly rejected (bad HMAC, cancelled) → failure
                    // 5xx or network error → still go to success since webhook provides backup
                    if (err.response?.status >= 400 && err.response?.status < 500) {
                        router.replace(`/templates?payment=failed`);
                    } else {
                        router.replace(successUrl);
                    }
                }
            } else {
                router.replace(`/templates?payment=failed`);
            }
        };

        verifyAndRedirect();
    }, [searchParams, router]);

    // Show spinner while redirecting
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <div className="w-14 h-14 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
            <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
                جاري التحقق من الدفع وتحديث مكتبتك...
            </p>
        </div>
    );
}

export default function PaymentCallbackPage() {
    return (
        <PaymentErrorBoundary supportLink>
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
                </div>
            }>
                <PaymentCallbackHandler />
            </Suspense>
        </PaymentErrorBoundary>
    );
}
