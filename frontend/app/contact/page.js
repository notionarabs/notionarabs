import Link from 'next/link';
import { Mail } from 'lucide-react';
import Footer from '../../components/Footer';
import ContactForm from '../../components/ContactForm';

export const metadata = {
  title: 'اتصل بنا | عرب نوشن',
  description: 'تواصل مع عرب نوشن - نحن هنا لمساعدتك في أي استفسار أو مساعدة تحتاجها. راسلنا وسنرد عليك خلال 24 ساعة.',
  alternates: {
    canonical: 'https://www.notionarabs.com/contact',
  },
  keywords: ['اتصل بنا', 'الدعم', 'خدمة العملاء', 'notionarabs', 'contact'],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'اتصل بنا | عرب نوشن',
    description: 'تواصل مع عرب نوشن - نحن هنا لمساعدتك في أي استفسار أو مساعدة تحتاجها.',
    url: 'https://www.notionarabs.com/contact',
    type: 'website',
  },
};

const contactMethods = [
  {
    title: "البريد الإلكتروني",
    description: "راسلنا وسنرد عليك خلال 24 ساعة",
    contact: "support@notionarabs.com",
    Icon: Mail,
    bg: "from-primary-100 to-primary-200 dark:from-orange-900/30 dark:to-orange-800/30"
  }
];

const faqs = [
  {
    question: "كيف تبدأون مشروع الاستشارة؟",
    answer: "نبدأ بجلسة استكشاف لفهم أهدافك وتحدياتك، ثم نقدم خطة واضحة للهيكلة والتنفيذ."
  },
  {
    question: "هل يمكن ربط نوشن بأدواتنا الحالية؟",
    answer: "نعم، نوفر تكاملات وأتمتة مع الأدوات الشائعة لتقليل العمل اليدوي وتسريع الإنجاز."
  },
  {
    question: "كم يستغرق تنفيذ النظام؟",
    answer: "يعتمد على حجم المشروع، لكننا نشاركك جدولاً زمنياً واضحاً من البداية."
  }
];

export default function ContactPage() {
  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "اتصل بنا | عرب نوشن",
    "description": "تواصل مع عرب نوشن - نحن هنا لمساعدتك في أي استفسار أو مساعدة تحتاجها. راسلنا وسنرد عليك خلال 24 ساعة.",
    "url": "https://www.notionarabs.com/contact",
    "mainEntity": {
      "@type": "Organization",
      "name": "عرب نوشن",
      "url": "https://www.notionarabs.com",
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "support@notionarabs.com",
        "contactType": "customer service",
        "availableLanguage": ["Arabic", "ar"]
      }
    }
  };

  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Main Content Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Elements (Optional, matching homepage vibe) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-primary-100/20 to-transparent dark:from-primary-900/10 blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-accent-100/20 to-transparent dark:from-accent-900/10 blur-3xl opacity-50"></div>
        </div>

        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Text Content Column */}
            <div className="text-center lg:text-right">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-accent-900 dark:text-white mb-6 leading-tight">
                تواصل معنا
              </h1>
              <p className="text-lg sm:text-xl text-accent-600 dark:text-dark-text-secondary leading-relaxed mb-8 max-w-2xl mx-auto lg:mx-0">
                اشرح لنا احتياجك وسنقترح عليك أفضل حل لبناء نظام نوشن يناسب فريقك. نحن هنا لمساعدتك في كل خطوة.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  href="mailto:support@notionarabs.com"
                  className="inline-flex items-center justify-center gap-3 bg-white dark:bg-dark-secondary text-accent-700 dark:text-dark-text-primary px-8 py-4 rounded-xl shadow-sm hover:shadow-md border border-gray-200 dark:border-dark-card-border transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-dark-tertiary flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-dark-card-hover transition-colors">
                    <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="text-right">
                    <span className="block text-xs text-accent-500 dark:text-dark-text-tertiary font-medium">البريد الإلكتروني</span>
                    <span className="block font-semibold dir-ltr">support@notionarabs.com</span>
                  </div>
                </a>
              </div>
            </div>

            {/* Contact Form Column */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 rounded-3xl blur-2xl -z-10"></div>
              <div className="bg-white/80 dark:bg-dark-secondary/80 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-dark-card-border/60 shadow-xl p-2 sm:p-4">
                <ContactForm />
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
