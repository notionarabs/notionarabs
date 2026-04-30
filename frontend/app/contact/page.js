import { generateMetadata } from '../../lib/seo';
import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';
import Footer from '../../components/Footer';
import ContactForm from '../../components/ContactForm';

export const metadata = generateMetadata({
  title: 'اتصل بنا',
  description: 'تواصل مع عرب نوشن - نحن هنا لمساعدتك في أي استفسار أو مساعدة تحتاجها. راسلنا وسنرد عليك خلال 24 ساعة.',
  url: '/contact',
});

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
    question: "كيف يمكنني الحصول على دعم لقالب قمت بشرائه؟",
    answer: "يمكنك مراسلة المبدع صاحب القالب مباشرة عبر صفحته، أو التواصل معنا وسنقوم بمساعدتك في الوصول إليه."
  },
  {
    question: "هل يمكنني طلب ميزات إضافية في قالب معين؟",
    answer: "نحن نشجع المبدعين على تحديث قوالبهم باستمرار. يمكنك إرسال اقتراحاتك لنا وسنقوم بتوصيلها للمبدع المعني."
  },
  {
    question: "كيف أنضم لمجتمع المبدعين؟",
    answer: "يمكنك التقديم عبر صفحة 'انضم كمبدع'، وسيقوم فريقنا بمراجعة أعمالك وفتح متجرك الخاص في عرب نوشن."
  }
];

export default function ContactPage() {
  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "اتصل بنا",
    "description": "تواصل مع فريق دعم عرب نوشن لأي استفسارات حول القوالب، حسابات المبدعين، أو الدعم التقني للمجتمع.",
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
    <main className="min-h-screen bg-gray-50 dark:bg-black relative overflow-x-hidden transition-colors duration-300" dir="rtl">
      {/* Ambient Mesh Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Main Content Section */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Elements (Optional, matching homepage vibe) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-primary-100/20 to-transparent dark:from-primary-900/10 blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-accent-100/20 to-transparent dark:from-accent-900/10 blur-3xl opacity-50"></div>
        </div>

        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center">

            {/* Text Content Column */}
            <div className="text-center lg:text-right order-1 relative z-10">
              <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black text-accent-500 dark:text-white mb-6 leading-[1.1] tracking-tight">
                تواصل <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">معنا</span>
              </h1>
              <p className="text-lg sm:text-xl text-accent-600 dark:text-gray-400 leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0 font-medium opacity-80">
                لديك استفسار حول قالب؟ أو تواجه مشكلة تقنية؟ فريق دعم عرب نوشن هنا لمساعدتك وتوجيهك نحو أفضل تجربة إنتاجية.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full lg:max-w-2xl mx-auto lg:mx-0">
                <a
                  href="mailto:support@notionarabs.com"
                  className="w-full inline-flex items-center justify-center gap-4 bg-white/50 dark:bg-white/5 backdrop-blur-xl text-accent-700 dark:text-white px-6 py-5 rounded-2xl shadow-soft hover:shadow-large border-none transition-all duration-500 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 group-hover:bg-primary group-hover:scale-110 flex items-center justify-center transition-all duration-500 shrink-0 shadow-sm group-hover:shadow-glow">
                    <Mail className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div className="text-right min-w-0">
                    <span className="block text-xs text-accent-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-0.5">البريد الإلكتروني</span>
                    <span className="block font-black text-sm sm:text-base truncate">support@notionarabs.com</span>
                  </div>
                </a>
                <a
                  href="tel:+201050505673"
                  className="w-full inline-flex items-center justify-center gap-4 bg-white/50 dark:bg-white/5 backdrop-blur-xl text-accent-700 dark:text-white px-6 py-5 rounded-2xl shadow-soft hover:shadow-large border-none transition-all duration-500 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 group-hover:bg-blue-500 group-hover:scale-110 flex items-center justify-center transition-all duration-500 shrink-0 shadow-sm group-hover:shadow-glow">
                    <Phone className="w-6 h-6 text-blue-500 group-hover:text-white transition-colors" />
                  </div>
                  <div className="text-right min-w-0">
                    <span className="block text-xs text-accent-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-0.5">رقم الموبايل</span>
                    <span className="block font-black text-sm sm:text-base truncate" dir="ltr">+20 105 050 5673</span>
                  </div>
                </a>
              </div>
            </div>

            <div className="relative order-2 z-10">
              <div className="bg-white/50 dark:bg-white/5 backdrop-blur-[40px] rounded-[2.5rem] border-none shadow-large p-4 sm:p-8">
                <ContactForm />
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main >
  );
}
