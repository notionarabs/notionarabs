'use client';

import { useState, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '../../../contexts/ToastContext';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { emailApi } from '../../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Upload, FileText, CheckCircle, XCircle, Mail, Download, Trash2, Send, AlertCircle, X, Users } from 'lucide-react';

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
  const [sendToAll, setSendToAll] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
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

        if (isBinaryFile(content)) {
          showError('ملفات Excel بصيغة .xlsx هي ملفات مشفرة لا يمكن قراءتها مباشرة. يرجى "حفظ باسم" (Save As) واختيار صيغة CSV (Comma delimited) من برنامج Excel ثم رفع الملف مرة أخرى.');
          setLoading(false);
          setProcessingStatus('error');
          return;
        }

        const emailList = parseFileContent(content, file.type);

        if (emailList.length === 0) {
          showError('لم نجد أي بريد إلكتروني في الملف. تأكد من أن الملف نصي أو بصيغة CSV.');
          setLoading(false);
          setProcessingStatus('error');
          return;
        }

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

  const isBinaryFile = (content) => {
    // Check for common binary Excel signatures or non-text characters
    if (content.includes('PK\u0003\u0004')) return true; // XLSX/ZIP signature
    if (content.includes('\u0000')) return true; // Null bytes usually mean binary
    return false;
  };

  // Parse different file formats (Robust version)
  const parseFileContent = (content, fileType) => {
    // Remove BOM if present
    const cleanContent = content.replace(/^\uFEFF/, '');
    const lines = cleanContent.split(/\r?\n/);
    const emails = [];

    // Common email regex for extraction from text
    const extractEmailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Skip common header keywords
      const lowerLine = trimmedLine.toLowerCase();
      if (index === 0 && (
        lowerLine.includes('email') ||
        lowerLine.includes('البريد') ||
        lowerLine.includes('الاسم') ||
        lowerLine.includes('name')
      )) {
        return;
      }

      // If it looks like a CSV line (has commas or semicolons)
      if (trimmedLine.includes(',') || trimmedLine.includes(';')) {
        const delimiter = trimmedLine.includes(',') ? ',' : ';';
        const columns = trimmedLine.split(delimiter);

        // Strategy: Look for the first column that matches email pattern
        let foundInLine = false;
        for (let col of columns) {
          const cleanCol = col.replace(/"/g, '').trim();
          if (emailRegex.test(cleanCol.toLowerCase())) {
            emails.push(cleanCol);
            foundInLine = true;
            break;
          }
        }

        // Fallback: If no strict match, try to extract any email string from the whole line
        if (!foundInLine) {
          const extracted = trimmedLine.match(extractEmailRegex);
          if (extracted) {
            extracted.forEach(e => emails.push(e));
          }
        }
      } else {
        // Plain text or single column
        const extracted = trimmedLine.match(extractEmailRegex);
        if (extracted) {
          extracted.forEach(e => emails.push(e));
        } else if (emailRegex.test(trimmedLine.toLowerCase())) {
          emails.push(trimmedLine);
        }
      }
    });

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
    setSendToAll(false);
    setSelectedTemplate('');
    setShowEmailComposer(false);
    setEmailSubject('');
    setEmailMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle email sending
  const handleSendEmails = async () => {
    if (!sendToAll && validEmails.length === 0) {
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
        emails: sendToAll ? 'all' : validEmails,
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

  // Predefined templates
  const templates = [
    {
      id: 'widgets',
      name: 'إعلان الودجتس الجديدة',
      subject: '✨ جديد عرب نوشن: أدوات الصلاة والقرآن الكريم لمساحة عملك',
      message: `مرحباً {{name}}،

سعداء جداً اليوم بالإعلان عن إطلاق أحدث أدوات "عرب نوشن" التي ستغير طريقة استخدامك لمساحة عملك:

1️⃣ ودجت مواقيت الصلاة: تتبع أوقات الصلاة مباشرة من داخل نوشن مع تصميم عصري يناسب كل الثيمات.
2️⃣ ودجت القرآن الكريم: آية يومية متجددة تظهر لك في مساحة عملك لتبقى على صلة بكتاب الله.

كل ما عليك فعله هو التوجه لصفحة الأدوات المحترفة في موقعنا، تخصيص الودجت الخاص بك، ثم نسخه ولصقه في صفحة نوشن!

تفضل بزيارة صفحة الأدوات الآن: https://www.notionarabs.com/widgets

تحياتنا،
فريق عرب نوشن`
    },
    {
      id: 'welcome',
      name: 'رسالة ترحيب وتذكير',
      subject: '👋 مرحباً بك في مجتمع عرب نوشن - هل استكشت القوالب الجديدة؟',
      message: `أهلاً بك يا {{name}}،

نحن في عرب نوشن نسعى دائماً لتوفير أفضل القوالب والأدوات التي تساعدك على تنظيم حياتك وعملك بذكاء.

هل قمت بتفقد متجر القوالب مؤخراً؟ لدينا عشرات القوالب المجانية والمدفوعة التي صممت خصيصاً لتناسب احتياجات المستخدم العربي.

كما يسعدنا أن نخبرك أننا قمنا بفتح باب الانضمام لـ "برنامج المبدعين"، إذا كنت تملك مهارة بناء القوالب، يمكنك الآن البدء في بيعها وجني الأرباح من خلال منصتنا!

استكشف المتجر هنا: https://www.notionarabs.com/store

فريقك في عرب نوشن`
    },
    {
      id: 'empty',
      name: 'قالب فارغ',
      subject: '',
      message: ''
    }
  ];

  const applyTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setEmailSubject(template.subject);
      setEmailMessage(template.message);
      setSelectedTemplate(templateId);
    }
  };

  // Check authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center" dir="rtl">
        <LoadingIndicator />
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

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white dark:bg-dark-secondary border-b border-gray-200 dark:border-dark-card-border sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/80 dark:bg-dark-secondary/80"
      >
        <div className="container-custom flex justify-between items-center py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-tertiary rounded-lg transition-colors text-accent-600 dark:text-gray-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-l from-primary-600 to-primary-400 bg-clip-text text-transparent">
              استيراد البريد الإلكتروني
            </h1>
          </div>
        </div>
      </motion.header>

      <div className="container-custom py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto space-y-6"
        >
          {/* Upload Section */}
          <section className="bg-white dark:bg-dark-secondary rounded-2xl shadow-sm border border-gray-100 dark:border-dark-card-border overflow-hidden p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">رفع ملف البريد الإلكتروني</h2>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl">
              يمكنك رفع ملف CSV أو Excel يحتوي على قائمة البريد الإلكتروني. سيقوم النظام بمعالجة الملف والتحقق من صحة كل بريد إلكتروني تلقائياً.
            </p>

            <div className="border-2 border-dashed border-gray-300 dark:border-dark-card-border rounded-xl p-8 sm:p-12 text-center transition-all hover:border-primary-500 dark:hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-dark-tertiary/50 group">
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
                className="cursor-pointer flex flex-col items-center justify-center w-full h-full"
              >
                <div className="w-16 h-16 bg-gray-100 dark:bg-dark-tertiary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-8 h-8 text-gray-400 group-hover:text-primary-500 transition-colors" />
                </div>
                <p className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                  انقر هنا لرفع الملف
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  يدعم ملفات CSV، Excel، و TXT (بحد أقصى 5 ميجابايت)
                </p>
              </label>
            </div>

            <div className="flex items-center gap-4 mt-6">
              <div className="h-px bg-gray-200 dark:bg-dark-card-border flex-1" />
              <span className="text-sm text-gray-400 font-medium">أو</span>
              <div className="h-px bg-gray-200 dark:bg-dark-card-border flex-1" />
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => {
                  setSendToAll(true);
                  setProcessingStatus('completed');
                  setValidEmails([]);
                  setEmails([]);
                  showSuccess('تم اختيار جميع مستخدمي الموقع كهدف للإرسال');
                }}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl border-2 transition-all ${sendToAll ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white dark:bg-dark-tertiary border-gray-200 dark:border-dark-card-border text-gray-700 dark:text-gray-200 hover:border-primary-500'}`}
              >
                <Users className={`w-6 h-6 ${sendToAll ? 'text-primary-600' : 'text-gray-400'}`} />
                <div className="text-right">
                  <p className="font-bold text-lg">إرسال لجميع مستخدمي الموقع</p>
                  <p className="text-sm opacity-70">سيتم استهداف كافة الحسابات المسجلة والنشطة</p>
                </div>
              </button>
            </div>

            <AnimatePresence>
              {uploadedFile && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-900 dark:text-blue-100">
                        {uploadedFile.name}
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {(uploadedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClear}
                    className="p-2 hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-lg text-blue-600 dark:text-blue-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Processing Status */}
          <AnimatePresence mode="wait">
            {processingStatus === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-dark-secondary rounded-2xl shadow-sm p-8 text-center"
              >
                <LoadingIndicator />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-4">
                  جاري معالجة الملف...
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  نقوم الآن بقراءة الملف والتحقق من صحة عناوين البريد الإلكتروني.
                </p>
              </motion.div>
            )}

            {processingStatus === 'completed' && (
              <motion.div
                key="completed"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <motion.div
                    variants={itemVariants}
                    className="bg-white dark:bg-dark-secondary p-5 rounded-2xl border border-gray-100 dark:border-dark-card-border shadow-sm flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">إجمالي البريد</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{emails.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-gray-100 dark:bg-dark-tertiary rounded-xl flex items-center justify-center">
                      <Mail className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </div>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="bg-white dark:bg-dark-secondary p-5 rounded-2xl border border-gray-100 dark:border-dark-card-border shadow-sm flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">بريد صحيح</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">{validEmails.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="bg-white dark:bg-dark-secondary p-5 rounded-2xl border border-gray-100 dark:border-dark-card-border shadow-sm flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm text-red-600 dark:text-red-400 font-medium">بريد خاطئ</p>
                      <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">{invalidEmails.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="bg-white dark:bg-dark-secondary p-5 rounded-2xl border border-gray-100 dark:border-dark-card-border shadow-sm flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">نسبة الصحة</p>
                      <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">
                        {emails.length > 0 ? Math.round((validEmails.length / emails.length) * 100) : 0}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </motion.div>
                </div>

                {/* Actions & List */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Actions Panel */}
                  <motion.div variants={itemVariants} className="bg-white dark:bg-dark-secondary rounded-2xl shadow-sm border border-gray-100 dark:border-dark-card-border p-6 h-fit">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">إجراءات سريعة</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => setShowEmailComposer(true)}
                        disabled={!sendToAll && validEmails.length === 0}
                        className="w-full btn-primary py-3 flex items-center justify-center gap-2 group disabled:opacity-50"
                      >
                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform rtl:group-hover:-translate-x-1" />
                        <span>إرسال رسائل جماعية</span>
                      </button>

                      <button
                        onClick={handleExportValid}
                        disabled={validEmails.length === 0}
                        className="w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-dark-card-border text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-dark-tertiary flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                      >
                        <Download className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span>تصدير القائمة الصحيحة</span>
                      </button>

                      <button
                        onClick={handleClear}
                        className="w-full py-3 px-4 rounded-xl border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center justify-center gap-2 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                        <span>مسح وبدء من جديد</span>
                      </button>
                    </div>
                  </motion.div>

                  {/* Valid Emails List */}
                  <div className="lg:col-span-2 bg-white dark:bg-dark-secondary rounded-2xl shadow-sm border border-gray-100 dark:border-dark-card-border p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        {sendToAll ? 'جميع مستخدمي الموقع' : (validEmails.length > 0 ? 'البريد الإلكتروني الصحيح' : 'قائمة المستلمين')}
                      </h3>
                      <span className="text-sm px-3 py-1 bg-gray-100 dark:bg-dark-tertiary rounded-full text-gray-600 dark:text-gray-400 font-medium">
                        {sendToAll ? 'الكل' : `${validEmails.length} مستلم`}
                      </span>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                      {sendToAll ? (
                        <div className="text-center py-12 flex flex-col items-center">
                          <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-4">
                            <Users className="w-8 h-8 text-primary-500" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">وضع الإرسال للكل مفعل</h3>
                          <p className="text-gray-500 dark:text-gray-400 max-w-sm">سيتم جلب كافة عناوين البريد الإلكتروني للمستخدمين المسجلين في الموقع تلقائياً عند الضغط على إرسال.</p>
                        </div>
                      ) : validEmails.length > 0 ? (
                        validEmails.map((email, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-tertiary/50 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-dark-card-border transition-all">
                            <div className="w-8 h-8 rounded-full bg-white dark:bg-dark-secondary border border-gray-100 dark:border-dark-card-border flex items-center justify-center text-xs font-bold text-primary-600">
                              {index + 1}
                            </div>
                            <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">{email}</span>
                            <div className="mr-auto">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 flex flex-col items-center">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-dark-tertiary rounded-full flex items-center justify-center mb-4">
                            <Mail className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 font-medium">لا توجد بريد إلكتروني في القائمة</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Instructions */}
          <motion.div
            variants={itemVariants}
            className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20 p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              تعليمات هامة
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-white dark:bg-dark-secondary text-blue-600 rounded-full flex items-center justify-center font-bold shadow-sm text-xs mt-0.5">1</span>
                <p>تأكد من أن ملف CSV أو Excel يحتوي على عمود واحد فقط للبريد الإلكتروني.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-white dark:bg-dark-secondary text-blue-600 rounded-full flex items-center justify-center font-bold shadow-sm text-xs mt-0.5">2</span>
                <p>يقوم النظام تلقائياً بإزالة التكرار والتحقق من تنسيق البريد.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-white dark:bg-dark-secondary text-blue-600 rounded-full flex items-center justify-center font-bold shadow-sm text-xs mt-0.5">3</span>
                <p>يمكنك إرسال رسائل لـ 2000 مستلم بحد أقصى في الدفعة الواحدة.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-white dark:bg-dark-secondary text-blue-600 rounded-full flex items-center justify-center font-bold shadow-sm text-xs mt-0.5">4</span>
                <p>استخدم هذا النظام بحذر لتجنب تصنيف رسائلك كبريد عشوائي (Spam).</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Improved Email Composer Modal */}
        <AnimatePresence>
          {showEmailComposer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-dark-secondary rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
              >
                {/* Modal Header */}
                <div className="px-6 py-5 border-b border-gray-100 dark:border-dark-card-border flex justify-between items-center bg-gray-50/50 dark:bg-dark-tertiary/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400">
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">إرسال رسالة جماعية</h3>
                      <p className="text-sm text-gray-500">{sendToAll ? 'سيتم الإرسال لجميع مستخدمي الموقع' : `سيتم الإرسال إلى ${validEmails.length} مستلم`}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEmailComposer(false)}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-dark-tertiary rounded-full transition-colors text-gray-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                  <div className="space-y-6">
                    {/* Template Selection */}
                    <div className="bg-primary-50/50 dark:bg-primary-900/10 p-4 rounded-xl border border-primary-100 dark:border-primary-900/20">
                      <label className="block text-sm font-bold text-primary-700 dark:text-primary-400 mb-3">
                        اختر قالباً جاهزاً لتسريع العمل:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {templates.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => applyTemplate(t.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedTemplate === t.id ? 'bg-primary-600 text-white shadow-md' : 'bg-white dark:bg-dark-tertiary text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-dark-card-border hover:border-primary-400'}`}
                          >
                            {t.name}
                          </button>
                        ))}
                      </div>
                      <div className="mt-3 text-[10px] text-primary-600/70 font-medium">
                        💡 يمكنك استخدام <code className="bg-primary-100 dark:bg-primary-900/40 px-1 rounded">{"{{name}}"}</code> لوضع اسم المستخدم تلقائياً، أو <code className="bg-primary-100 dark:bg-primary-900/40 px-1 rounded">{"{{email}}"}</code> لبريده.
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email-subject" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        عنوان الرسالة <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="email-subject"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="مثال: تحديثات هامة بخصوص حسابك"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-card-border bg-white dark:bg-dark-tertiary focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email-message" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        محتوى الرسالة <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <textarea
                          id="email-message"
                          value={emailMessage}
                          onChange={(e) => setEmailMessage(e.target.value)}
                          rows={8}
                          placeholder="اكتب رسالتك هنا..."
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-card-border bg-white dark:bg-dark-tertiary focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none resize-none font-sans"
                          required
                        />
                        <div className="absolute bottom-3 left-3 text-xs text-gray-400">
                          يدعم HTML
                        </div>
                      </div>
                    </div>

                    {/* Branded Preview Box */}
                    {emailSubject && emailMessage && (
                      <div className="bg-gray-100 dark:bg-dark-tertiary/30 rounded-2xl p-6 border border-gray-200 dark:border-dark-card-border">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">معاينة البريد النهائي:</h4>

                        <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-inner border border-gray-200 dark:border-dark-card-border overflow-hidden max-w-full overflow-x-auto text-right" dir="rtl">
                          <div className="p-10">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                              {emailSubject}
                            </h2>
                            <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                              {emailMessage}
                            </div>
                          </div>

                          <div className="p-10 pt-0 bg-white dark:bg-dark-secondary text-right">
                            <div className="border-t border-gray-100 dark:border-dark-card-border pt-6">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
                                عرب نوشن — بيت عشّاق نوشن في العالم العربي
                              </p>
                              <p className="text-xs text-gray-400">
                                إذا كنت لا ترغب في تلقي هذه الرسائل، يمكنك <span className="underline cursor-pointer">إلغاء الاشتراك هنا</span>.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-dark-card-border bg-gray-50/50 dark:bg-dark-tertiary/20 flex justify-end gap-3 z-20">
                  <button
                    onClick={() => setShowEmailComposer(false)}
                    className="px-6 py-2.5 rounded-xl border border-gray-300 dark:border-dark-card-border text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-100 dark:hover:bg-dark-tertiary transition-colors"
                    disabled={sendingEmails}
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSendEmails}
                    disabled={sendingEmails || !emailSubject.trim() || !emailMessage.trim()}
                    className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold flex items-center gap-2 shadow-lg shadow-primary-600/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-95"
                  >
                    {sendingEmails ? (
                      <>
                        <LoadingIndicator size="sm" color="white" />
                        <span>جاري الإرسال...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 rtl:-rotate-90" />
                        <span>إرسال الآن</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
