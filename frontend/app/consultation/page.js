import { generateMetadata } from '../../lib/seo';
import ConsultationForm from '../../components/ConsultationForm';
import { Sparkles } from 'lucide-react';

export const metadata = generateMetadata({
  title: 'احجز استشارة',
  description: 'احجز استشارة مع فريق عرب نوشن لبناء نظام نوشن يناسب عملك وفريقك.',
  url: '/consultation',
  keywords: ['احجز استشارة', 'استشارة نوشن', 'notionarabs', 'consultation']
});

export default function ConsultationPage() {
  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">

      {/* Immersive Layout for Focus Flow */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center py-10 px-4 sm:px-6 overflow-hidden">

        {/* Background ambient light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="container-custom relative z-10 w-full max-w-5xl">

          {/* Subtle Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-1.5 rounded-full text-xs font-medium text-gray-500 dark:text-gray-400 mb-6 shadow-sm backdrop-blur-sm">
              <Sparkles size={12} className="text-primary-500" />
              <span>استشارة مخصصة</span>
            </div>
            {/* Note: The form has its own "Intro" step, so we keep this minimal or remove it. 
                Use this space just for branding/context if needed, otherwise let the form drive.
            */}
          </div>

          <div className="bg-white/50 dark:bg-dark-secondary/50 backdrop-blur-xl border border-white/60 dark:border-white/5 rounded-3xl shadow-2xl overflow-hidden">
            <ConsultationForm />
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            بإرسال هذا النموذج، أنت توافق على سياسة الخصوصية الخاصة بنا.
          </p>
        </div>
      </section>

    </main>
  );
}
