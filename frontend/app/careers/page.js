import { generateMetadata } from '../../lib/seo';
import JoinTeamForm from '../../components/JoinTeamForm';

export const metadata = generateMetadata({
  title: 'انضم لفريقنا',
  description: 'فرص للانضمام إلى فريق عرب نوشن. شاركنا خبراتك وسنعود إليك قريباً.',
  url: '/careers',
  keywords: ['انضم للفريق', 'وظائف', 'فرص عمل', 'notionarabs', 'careers']
});

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300 relative overflow-hidden" dir="rtl">

      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
        style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="container-custom max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 text-accent-900 dark:text-white">
            انضم لفريقنا
          </h1>
          <p className="text-base text-gray-500 dark:text-gray-400">
            نبحث دائماً عن المتميزين لمشاركتنا الرحلة.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="relative z-10 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8">
        <div className="container-custom">
          {/* Dossier Container - adding visual depth */}
          <div className="max-w-4xl mx-auto relative">
            {/* Pseudo-border/gradient glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-[2.5rem] blur-xl opacity-70"></div>

            <div className="relative">
              <JoinTeamForm />
            </div>

            {/* Trust Badges / Footer Note */}
            {/* Removed as per request */}
          </div>
        </div>
      </section>

    </main>
  );
}
