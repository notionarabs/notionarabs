'use client';

import { useState, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '../../../contexts/ToastContext';
import LoadingIndicator from '../../../components/LoadingIndicator';
import api, { emailApi } from '../../../lib/api';

export default function EmailImportPage() {
  const { user, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState([]);
  const [validEmails, setValidEmails] = useState([]);
  const [invalidEmails, setInvalidEmails] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [processingStatus, setProcessingStatus] = useState('idle'); // idle, processing, completed, error
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmails, setSendingEmails] = useState(false);
  const fileInputRef = useRef(null);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    setProcessingStatus('processing');
    setLoading(true);

    // Check file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls|txt)$/i)) {
      showError('نوع الملف غير مدعوم. يرجى رفع ملف CSV أو Excel');
      setLoading(false);
      setProcessingStatus('error');
      return;
    }

    // Process file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const emailList = parseFileContent(content, file.type);
        processEmails(emailList);
      } catch (error) {
        console.error('Error processing file:', error);
        showError('حدث خطأ أثناء معالجة الملف');
        setLoading(false);
        setProcessingStatus('error');
      }
    };

    reader.readAsText(file);
  };

  // Parse different file formats
  const parseFileContent = (content, fileType) => {
    const emails = [];

    if (fileType === 'text/csv' || fileType.includes('csv')) {
      // Parse CSV
      const lines = content.split('\n');
      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine) {
          // Split by comma and get first column (assuming email is in first column)
          const columns = trimmedLine.split(',');
          const email = columns[0].replace(/"/g, '').trim();
          if (email) emails.push(email);
        }
      });
    } else {
      // Parse plain text (one email per line)
      const lines = content.split('\n');
      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine) emails.push(trimmedLine);
      });
    }

    return emails;
  };

  // Process and validate emails
  const processEmails = (emailList) => {
    const valid = [];
    const invalid = [];

    emailList.forEach(email => {
      if (emailRegex.test(email.toLowerCase())) {
        valid.push(email.toLowerCase());
      } else {
        invalid.push(email);
      }
    });

    // Remove duplicates
    const uniqueValidEmails = [...new Set(valid)];
    const uniqueInvalidEmails = [...new Set(invalid)];

    setEmails(emailList);
    setValidEmails(uniqueValidEmails);
    setInvalidEmails(uniqueInvalidEmails);
    setLoading(false);
    setProcessingStatus('completed');

    showSuccess(`تم معالجة ${emailList.length} بريد إلكتروني. ${uniqueValidEmails.length} صحيح و ${uniqueInvalidEmails.length} غير صحيح`);
  };

  // Clear all data
  const handleClear = () => {
    setEmails([]);
    setValidEmails([]);
    setInvalidEmails([]);
    setUploadedFile(null);
    setProcessingStatus('idle');
    setShowEmailComposer(false);
    setEmailSubject('');
    setEmailMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle email sending
  const handleSendEmails = async () => {
    if (validEmails.length === 0) {
      showError('لا توجد بريد إلكتروني صحيح للإرسال');
      return;
    }

    if (!emailSubject.trim() || !emailMessage.trim()) {
      showError('يرجى ملء عنوان الرسالة والمحتوى');
      return;
    }

    setSendingEmails(true);

    try {
      // Show progress message for large batches
      if (validEmails.length > 50) {
        showSuccess(`جاري إرسال ${validEmails.length} بريد إلكتروني... قد يستغرق هذا بعض الوقت`);
      }

      // Make the actual API call to send emails using the emailApi instance with extended timeout
      const response = await emailApi.post('/admin/send-bulk-emails', {
        emails: validEmails,
        subject: emailSubject,
        message: emailMessage,
      });

      if (response.data.success) {
        // Show success message with development mode indicator
        let message = response.data.devMode
          ? `${response.data.message}\n\n💡 هذا وضع التطوير - لم يتم إرسال رسائل حقيقية`
          : response.data.message;

        // Add failed emails information if any
        if (response.data.stats.failed > 0 && response.data.failedEmails) {
          message += `\n\n❌ فشل في إرسال ${response.data.stats.failed} بريد إلكتروني:`;
          response.data.failedEmails.forEach(failed => {
            message += `\n• ${failed.email}: ${failed.error}`;
          });
        }

        showSuccess(message);
        setShowEmailComposer(false);
        setEmailSubject('');
        setEmailMessage('');
      } else {
        throw new Error(response.data.message || 'فشل في إرسال الرسائل');
      }
    } catch (error) {
      console.error('Error sending emails:', error);
      showError(error.response?.data?.message || error.message || 'حدث خطأ أثناء إرسال الرسائل. يرجى المحاولة مرة أخرى');
    } finally {
      setSendingEmails(false);
    }
  };

  // Export valid emails to CSV
  const handleExportValid = () => {
    if (validEmails.length === 0) {
      showError('لا توجد بريد إلكتروني صحيح للتصدير');
      return;
    }

    const csvContent = validEmails.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `valid_emails_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    showSuccess('تم تصدير البريد الإلكتروني الصحيح بنجاح');
  };

  // Export invalid emails to CSV
  const handleExportInvalid = () => {
    if (invalidEmails.length === 0) {
      showError('لا توجد بريد إلكتروني غير صحيح للتصدير');
      return;
    }

    const csvContent = invalidEmails.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `invalid_emails_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    showSuccess('تم تصدير البريد الإلكتروني غير الصحيح بنجاح');
  };

  // Check authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
        <div className="container-custom py-8 sm:py-12">
          {/* Header Skeleton */}
          <div className="mb-8 sm:mb-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-48"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
            </div>
          </div>

          {/* Email Import Form Skeleton */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-sm border border-gray-200 dark:border-dark-card-border p-6 sm:p-8">
              <div className="animate-pulse space-y-8">
                {/* Upload Section Skeleton */}
                <div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-40"></div>
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg border-2 border-dashed"></div>
                </div>

                {/* Instructions Section Skeleton */}
                <div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-32"></div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
                  </div>
                </div>

                {/* Action Buttons Skeleton */}
                <div className="flex gap-4 justify-end">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center transition-colors duration-300" dir="rtl">
        <div className="text-center">
          <h1 className="heading-1 mb-4">غير مصرح لك بالوصول</h1>
          <p className="body-large text-accent-600 dark:text-dark-text-secondary">هذه الصفحة مخصصة للمديرين فقط</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
      {/* Header */}
      <header className="bg-white dark:bg-dark-secondary border-b border-gray-200 dark:border-dark-card-border sticky top-0 z-50 shadow-medium dark:shadow-dark-medium backdrop-blur-sm bg-white/95 dark:bg-dark-secondary/95 transition-colors duration-300">
        <div className="container-custom flex justify-between items-center py-4">
          <h1 className="heading-2">استيراد البريد الإلكتروني</h1>
          <div className="flex gap-3 items-center">
            <button
              onClick={() => router.push('/admin')}
              className="btn-outline"
            >
              العودة للوحة الإدارة
            </button>
          </div>
        </div>
      </header>

      <div className="container-custom py-8">
        {/* Upload Section */}
        <div className="card p-6 mb-8">
          <h2 className="heading-3 mb-4">رفع ملف البريد الإلكتروني</h2>
          <p className="text-accent-600 dark:text-dark-text-secondary mb-6">
            يمكنك رفع ملف CSV أو Excel يحتوي على قائمة البريد الإلكتروني. سيتم التحقق من صحة كل بريد إلكتروني تلقائياً.
          </p>

          <div className="border-2 border-dashed border-gray-300 dark:border-dark-card-border rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="email-file-upload"
            />
            <label
              htmlFor="email-file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-lg font-medium text-accent-500 dark:text-dark-text-primary mb-2">
                انقر لرفع ملف البريد الإلكتروني
              </p>
              <p className="text-sm text-accent-600 dark:text-dark-text-secondary">
                يدعم ملفات CSV، Excel، و TXT
              </p>
            </label>
          </div>

          {uploadedFile && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-blue-800 dark:text-blue-200">
                <strong>الملف المرفوع:</strong> {uploadedFile.name}
              </p>
              <p className="text-blue-600 dark:text-blue-300 text-sm">
                الحجم: {(uploadedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}
        </div>

        {/* Processing Status */}
        {processingStatus === 'processing' && (
          <div className="card p-6 mb-8">
            <div className="flex items-center gap-4">
              <LoadingIndicator />
              <div>
                <h3 className="text-lg font-semibold text-accent-500 dark:text-dark-text-primary">
                  جاري معالجة الملف...
                </h3>
                <p className="text-accent-600 dark:text-dark-text-secondary">
                  يرجى الانتظار أثناء التحقق من صحة البريد الإلكتروني
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {processingStatus === 'completed' && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-accent-600 dark:text-dark-text-secondary mb-1">إجمالي البريد</p>
                    <p className="text-2xl font-bold text-accent-900 dark:text-dark-text-primary">
                      {emails.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-accent-600 dark:text-dark-text-secondary mb-1">صحيح</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {validEmails.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-accent-600 dark:text-dark-text-secondary mb-1">غير صحيح</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {invalidEmails.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-accent-600 dark:text-dark-text-secondary mb-1">نسبة الصحة</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {emails.length > 0 ? Math.round((validEmails.length / emails.length) * 100) : 0}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-accent-500 dark:text-dark-text-primary mb-4">
                إجراءات البريد الإلكتروني
              </h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setShowEmailComposer(true)}
                  disabled={validEmails.length === 0}
                  className="btn-primary bg-blue-600 hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  إرسال رسائل ({validEmails.length})
                </button>

                <button
                  onClick={handleExportValid}
                  disabled={validEmails.length === 0}
                  className="btn-outline text-green-600 border-green-600 hover:bg-green-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  تصدير البريد الإلكتروني ({validEmails.length})
                </button>

                <button
                  onClick={handleClear}
                  className="btn-outline text-gray-600 border-gray-600 hover:bg-gray-50"
                >
                  مسح الكل
                </button>
              </div>
            </div>

            {/* Valid Emails List */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-4">
                البريد الإلكتروني الصحيح ({validEmails.length})
              </h3>
              <div className="max-h-96 overflow-y-auto">
                {validEmails.length > 0 ? (
                  <div className="space-y-2">
                    {validEmails.map((email, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                        <svg className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-green-800 dark:text-green-200">{email}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">لا توجد بريد إلكتروني صحيح</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="card p-6 mt-8">
          <h3 className="text-lg font-semibold text-accent-500 dark:text-dark-text-primary mb-4">
            تعليمات الاستخدام
          </h3>
          <div className="space-y-3 text-accent-600 dark:text-dark-text-secondary">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">1</span>
              <p>ارفع ملف CSV أو Excel يحتوي على البريد الإلكتروني في العمود الأول</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">2</span>
              <p>سيتم التحقق من صحة كل بريد إلكتروني تلقائياً وإزالة التكرار</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">3</span>
              <p>يمكنك تصدير البريد الصحيح أو غير الصحيح كملفات منفصلة</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">4</span>
              <p>يدعم النظام حتى 2000 بريد إلكتروني في المرة الواحدة</p>
            </div>
          </div>
        </div>

        {/* Email Composer Modal */}
        {showEmailComposer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-dark-secondary rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-card-border flex justify-between items-center">
                <h3 className="text-xl font-semibold text-accent-900 dark:text-dark-text-primary">
                  إرسال رسائل البريد الإلكتروني
                </h3>
                <button
                  onClick={() => setShowEmailComposer(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-dark-text-secondary"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="space-y-6">
                  {/* Recipients Info */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">المستلمون</h4>
                    <p className="text-blue-600 dark:text-blue-300">
                      سيتم إرسال الرسالة إلى <strong>{validEmails.length}</strong> بريد إلكتروني صحيح
                    </p>
                  </div>

                  {/* Email Subject */}
                  <div>
                    <label htmlFor="email-subject" className="block text-sm font-medium text-accent-700 dark:text-dark-text-primary mb-2">
                      عنوان الرسالة *
                    </label>
                    <input
                      type="text"
                      id="email-subject"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="أدخل عنوان الرسالة..."
                      className="form-input w-full"
                      required
                    />
                  </div>

                  {/* Email Message */}
                  <div>
                    <label htmlFor="email-message" className="block text-sm font-medium text-accent-700 dark:text-dark-text-primary mb-2">
                      محتوى الرسالة *
                    </label>
                    <textarea
                      id="email-message"
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      rows={8}
                      placeholder="أدخل محتوى الرسالة..."
                      className="form-input w-full resize-none"
                      required
                    />
                    <p className="text-sm text-accent-500 dark:text-dark-text-tertiary mt-2">
                      يمكنك استخدام HTML في محتوى الرسالة
                    </p>
                  </div>

                  {/* Preview */}
                  {emailSubject && emailMessage && (
                    <div>
                      <h4 className="font-medium text-accent-700 dark:text-dark-text-primary mb-2">معاينة الرسالة</h4>
                      <div className="bg-gray-50 dark:bg-dark-tertiary rounded-lg p-4 border">
                        <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">العنوان: {emailSubject}</div>
                        <div className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{emailMessage}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-card-border flex justify-end gap-3">
                <button
                  onClick={() => setShowEmailComposer(false)}
                  className="btn-outline"
                  disabled={sendingEmails}
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSendEmails}
                  disabled={sendingEmails || !emailSubject.trim() || !emailMessage.trim()}
                  className="btn-primary bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {sendingEmails ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      إرسال الرسائل ({validEmails.length})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
