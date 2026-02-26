'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function PaymentCallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const success = searchParams.get('success');
        const pending = searchParams.get('pending');
        const orderId = searchParams.get('order');
        const txnId = searchParams.get('id');

        if (success === 'true' && pending === 'false') {
            // Payment successful → redirect to success page
            router.replace(`/payment-success?id=${orderId || txnId || ''}`);
        } else {
            // Payment failed or pending → redirect to store with error
            router.replace(`/store?payment=failed`);
        }
    }, [searchParams, router]);

    // Show spinner while redirecting
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <div className="w-14 h-14 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
            <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
                جاري التحقق من الدفع...
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
