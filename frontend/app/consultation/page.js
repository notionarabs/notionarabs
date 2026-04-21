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
    <main className="min-h-screen bg-transparent relative overflow-x-hidden transition-colors duration-300" dir="rtl">
      {/* Ambient Mesh Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Immersive Layout for Focus Flow */}
      <section className="relative min-h-screen flex flex-col items-center justify-center py-24 px-4 sm:px-6 overflow-hidden z-10">



        <div className="container-custom relative z-10 w-full max-w-5xl">

          {/* Subtle Header */}
          <div className="bg-white/50 dark:bg-white/5 backdrop-blur-[40px] rounded-[3rem] shadow-large border-none overflow-hidden relative">
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
