'use client';

const EGYPTIAN_MOBILE = /^(010|011|012|015)\d{8}$/;

function validatePayoutDetails(method, details) {
    const errors = {};
    if (method === 'vodafone_cash') {
        const phone = (details.walletNumber || '').replace(/\s/g, '');
        if (!phone) {
            errors.walletNumber = 'رقم المحفظة مطلوب';
        } else if (!EGYPTIAN_MOBILE.test(phone)) {
            errors.walletNumber = 'رقم غير صحيح — يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015 ومكون من 11 رقمًا';
        }
    } else if (method === 'bank_transfer') {
        if (!details.bankName || details.bankName.trim().length < 2) errors.bankName = 'اسم البنك مطلوب';
        if (!details.accountName || details.accountName.trim().length < 3) errors.accountName = 'اسم صاحب الحساب مطلوب';
        if (!details.accountNumber || details.accountNumber.trim().length < 10) errors.accountNumber = 'رقم الحساب يجب أن يكون 10 أرقام على الأقل';
    }

    const threshold = parseFloat(details.autoPayoutThreshold);
    if (isNaN(threshold) || threshold < 100) {
        errors.autoPayoutThreshold = 'الحد الأدنى لتفعيل السحب التلقائي هو 100 ج.م';
    }
    return errors;
}

export { validatePayoutDetails };

export default function PaymentSettingsSection({ profileSettings, handleInputChange }) {
    const payoutMethod = profileSettings.payoutMethod || 'vodafone_cash';
    const payoutDetails = profileSettings.payoutDetails || {};
    const errors = validatePayoutDetails(payoutMethod, payoutDetails);

    const handleDetailChange = (field, value) => {
        handleInputChange('payoutDetails', {
            ...payoutDetails,
            [field]: value
        });
    };

    return (
        <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl overflow-hidden shadow-sm relative">
            <div className="p-6 border-b border-gray-100 dark:border-dark-card-border bg-gray-50/50 dark:bg-dark-tertiary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">إعدادات الدفع والسحب</h2>
                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">حدد الطريقة التي تود استلام أرباحك بها</p>
                </div>
            </div>

            <div className="p-6 space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-dark-text-secondary mb-3">طريقة السحب المفضلة</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            onClick={() => handleInputChange('payoutMethod', 'vodafone_cash')}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${payoutMethod === 'vodafone_cash' ? 'border-primary-500 bg-primary-50/30 dark:bg-orange-500/10 dark:border-orange-500' : 'border-gray-100 dark:border-dark-card-border hover:border-gray-200 dark:hover:border-gray-700'}`}
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${payoutMethod === 'vodafone_cash' ? 'bg-primary-100 text-primary-600 dark:bg-orange-500/20 dark:text-orange-400' : 'bg-gray-100 text-gray-400 dark:bg-dark-tertiary'}`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-900 dark:text-dark-text-primary text-sm">فودافون كاش / محفظة إلكترونية</p>
                                <p className="text-xs text-gray-500 dark:text-dark-text-secondary">تحويل سريع ومباشر</p>
                            </div>
                        </button>

                        <button
                            onClick={() => handleInputChange('payoutMethod', 'bank_transfer')}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${payoutMethod === 'bank_transfer' ? 'border-primary-500 bg-primary-50/30 dark:bg-orange-500/10 dark:border-orange-500' : 'border-gray-100 dark:border-dark-card-border hover:border-gray-200 dark:hover:border-gray-700'}`}
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${payoutMethod === 'bank_transfer' ? 'bg-primary-100 text-primary-600 dark:bg-orange-500/20 dark:text-orange-400' : 'bg-gray-100 text-gray-400 dark:bg-dark-tertiary'}`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-900 dark:text-dark-text-primary text-sm">تحويل بنكي</p>
                                <p className="text-xs text-gray-500 dark:text-dark-text-secondary">للمبالغ الكبيرة (3-5 أيام)</p>
                            </div>
                        </button>
                    </div>
                </div>

                {payoutMethod === 'vodafone_cash' ? (
                    <div className="animate-fadeIn">
                        <label className="block text-sm font-bold text-gray-700 dark:text-dark-text-secondary mb-2">رقم المحفظة الإلكترونية</label>
                        <input
                            type="text"
                            value={payoutDetails.walletNumber || ''}
                            onChange={(e) => handleDetailChange('walletNumber', e.target.value)}
                            placeholder="01xxxxxxxxx"
                            maxLength={11}
                            className={`w-full px-4 py-3 bg-gray-50 dark:bg-dark-tertiary border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-dark-text-primary ${errors.walletNumber ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-dark-card-border'}`}
                        />
                        {errors.walletNumber ? (
                            <p className="text-xs text-red-500 mt-2">{errors.walletNumber}</p>
                        ) : (
                            <p className="text-xs text-gray-400 mt-2">يرجى التأكد من أن الرقم يدعم استقبال الأموال عبر المحافظ الإلكترونية</p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-dark-text-secondary mb-2">اسم البنك</label>
                                <input
                                    type="text"
                                    value={payoutDetails.bankName || ''}
                                    onChange={(e) => handleDetailChange('bankName', e.target.value)}
                                    placeholder="مثلاً: بنك مصر"
                                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-dark-tertiary border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-dark-text-primary ${errors.bankName ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-dark-card-border'}`}
                                />
                                {errors.bankName && <p className="text-xs text-red-500 mt-1">{errors.bankName}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-dark-text-secondary mb-2">اسم صاحب الحساب</label>
                                <input
                                    type="text"
                                    value={payoutDetails.accountName || ''}
                                    onChange={(e) => handleDetailChange('accountName', e.target.value)}
                                    placeholder="الاسم الكامل كما في البنك"
                                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-dark-tertiary border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-dark-text-primary ${errors.accountName ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-dark-card-border'}`}
                                />
                                {errors.accountName && <p className="text-xs text-red-500 mt-1">{errors.accountName}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-dark-text-secondary mb-2">رقم الحساب أو IBAN</label>
                            <input
                                type="text"
                                value={payoutDetails.accountNumber || ''}
                                onChange={(e) => handleDetailChange('accountNumber', e.target.value)}
                                placeholder="EG00xxxxxxxxxxxxxxxxxxxx"
                                className={`w-full px-4 py-3 bg-gray-50 dark:bg-dark-tertiary border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-dark-text-primary ${errors.accountNumber ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-dark-card-border'}`}
                            />
                            {errors.accountNumber && <p className="text-xs text-red-500 mt-1">{errors.accountNumber}</p>}
                        </div>
                    </div>
                )}

                {/* Automatic Payout Settings */}
                <div className="border-t border-gray-100 dark:border-dark-card-border pt-6 mt-6">
                    <h3 className="text-md font-bold text-gray-900 dark:text-dark-text-primary mb-3">إعدادات السحب التلقائي</h3>
                    
                    <div className="p-4 bg-gray-50 dark:bg-dark-tertiary/20 rounded-xl mb-6">
                        <p className="font-bold text-sm text-gray-900 dark:text-dark-text-primary">نظام السحب التلقائي للأرباح</p>
                        <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-1">
                            يتم الآن سحب الأرباح وتجهيز الطلب تلقائياً فور وصول رصيدك للحد المحدد أدناه. تم إلغاء السحوبات اليدوية لتبسيط العمليات.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-dark-text-secondary">حد السحب التلقائي (ج.م)</label>
                        <input
                            type="number"
                            value={payoutDetails.autoPayoutThreshold !== undefined ? payoutDetails.autoPayoutThreshold : 500}
                            onChange={(e) => handleDetailChange('autoPayoutThreshold', parseInt(e.target.value, 10) || '')}
                            min={100}
                            placeholder="500"
                            className={`w-full sm:w-1/2 px-4 py-3 bg-gray-50 dark:bg-dark-tertiary border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-dark-text-primary text-sm ${errors.autoPayoutThreshold ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-dark-card-border'}`}
                        />
                        {errors.autoPayoutThreshold ? (
                            <p className="text-xs text-red-500 mt-1">{errors.autoPayoutThreshold}</p>
                        ) : (
                            <p className="text-xs text-gray-400">الحد الأدنى لتفعيل السحب التلقائي هو 100 ج.م</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
