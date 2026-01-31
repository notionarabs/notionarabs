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

      {/* Hero Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-secondary-50 to-accent-500 dark:from-dark-primary dark:to-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-accent-500 dark:text-dark-text-primary">
              تواصل معنا
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-accent-700 dark:text-dark-text-secondary max-w-3xl mx-auto px-4">
              اشرح لنا احتياجك وسنقترح عليك أفضل حل لبناء نظام نوشن يناسب فريقك.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <ContactForm />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
