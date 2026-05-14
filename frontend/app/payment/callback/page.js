'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';

function PaymentCallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { ensureTokenInHeaders } = useAuth();

    useEffect(() => {
        const success = searchParams.get('success');
        const pending = searchParams.get('pending');
        const orderId = searchParams.get('order');
        const txnId = searchParams.get('id');

        const verifyAndRedirect = async () => {
            if (success === 'true' && pending === 'false') {
                try {
                    ensureTokenInHeaders();
                    await api.post('/payments/confirm-redirect', { orderId, txnId });
                } catch (err) {
                    console.error('Redirect confirmation call error:', err);
                }
                router.replace(`/payment-success?id=${orderId || txnId || ''}`);
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
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-14 h-14 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
            </div>
        }>
            <PaymentCallbackHandler />
        </Suspense>
    );
}
