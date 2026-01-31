import ConsultationForm from '../../components/ConsultationForm';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'احجز استشارة | عرب نوشن',
  description: 'احجز استشارة مع فريق عرب نوشن لبناء نظام نوشن يناسب عملك وفريقك.',
  alternates: {
    canonical: 'https://www.notionarabs.com/consultation',
  },
  keywords: ['احجز استشارة', 'استشارة نوشن', 'notionarabs', 'consultation'],
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
    title: 'احجز استشارة | عرب نوشن',
    description: 'احجز استشارة مع فريق عرب نوشن لبناء نظام نوشن يناسب عملك وفريقك.',
    url: 'https://www.notionarabs.com/consultation',
    type: 'website',
  },
};

export default function ConsultationPage() {
  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">
      {/* Hero Section */}
      <section className="py-10 sm:py-14 md:py-18 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-secondary-50 via-primary-50/30 to-accent-100 dark:from-dark-primary dark:via-dark-secondary dark:to-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              احجز استشارة نوشن
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-accent-700 dark:text-dark-text-secondary max-w-3xl mx-auto mt-4">
              شاركنا احتياجك وسنقترح عليك أفضل نظام نوشن يناسب فريقك وأهدافك.
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-10 sm:py-14 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <ConsultationForm />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
