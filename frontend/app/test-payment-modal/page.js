'use client';

import { useState } from 'react';
import PaymentModal from '../../components/PaymentModal';

export default function TestPaymentModalPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const testTemplate = {
    _id: 'test-template-1',
    title: 'قالب اختبار',
    price: 33
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8" dir="rtl">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">اختبار نموذج الدفع</h1>

        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold">{testTemplate.title}</h3>
            <p className="text-gray-600">السعر: {testTemplate.price} ريال</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors"
          >
            شراء الآن - {testTemplate.price} ريال
          </button>
        </div>

        <PaymentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          template={testTemplate}
          onSuccess={() => {
            setIsModalOpen(false);
            alert('تم الشراء بنجاح!');
          }}
        />
      </div>
    </div>
  );
}
