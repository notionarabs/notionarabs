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
    <main className="min-h-screen bg-transparent relative overflow-x-hidden transition-colors duration-300" dir="rtl">
      {/* Ambient Mesh Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>



      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container-custom max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-7xl lg:text-9xl font-black text-accent-900 dark:text-white mb-8 leading-normal py-2">
            انضم <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">لفريقنا</span>
          </h1>
          <p className="text-xl sm:text-2xl text-accent-600 dark:text-gray-400 font-medium max-w-2xl mx-auto">
            نبحث دائماً عن المتميزين لمشاركتنا الرحلة في بناء مستقبل الإنتاجية العربية.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="relative z-10 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto relative">
            <JoinTeamForm />
          </div>
        </div>
      </section>

    </main>
  );
}
