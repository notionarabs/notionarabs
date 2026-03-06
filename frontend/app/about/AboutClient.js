'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import {
    Target,
    Lightbulb,
    Trophy,
    GraduationCap,
    Puzzle,
    Settings,
    BookOpen,
    Rocket,
    Star,
    MessageSquare,
    Youtube,
    Facebook,
    Send,
    Users,
    ChevronLeft,
    Zap,
    TrendingUp
} from 'lucide-react';
import Footer from '../../components/Footer';
import HeroSection from './components/HeroSection';
import VisionMissionSection from './components/VisionMissionSection';
import FutureGoalsSection from './components/FutureGoalsSection';
import SpotlightFeaturesSection from './components/SpotlightFeaturesSection';
import ValuesSection from './components/ValuesSection';
import TeamSection from './components/TeamSection';
import JourneySection from './components/JourneySection';
import CertificationSection from './components/CertificationSection';







export default function AboutClient() {


    return (
        <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">

            {/* Hero Section */}
            <HeroSection />

            {/* Vision & Mission Section */}
            <VisionMissionSection />

            {/* Journey Section (Timeline) */}
            <JourneySection />

            {/* Future Goals Section */}
            <FutureGoalsSection />

            {/* Features Section (Spotlight) */}
            <SpotlightFeaturesSection />

            {/* Values Section (Accordion) */}
            <ValuesSection />

            {/* Team Section */}
            <TeamSection />

            {/* Certification Section */}
            <CertificationSection />









            {/* CTA Section */}
            <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-500 to-accent-500 dark:from-orange-600 dark:to-orange-700 transition-colors duration-300">
                <div className="container-custom text-center">
                    <div className="flex items-center gap-3 justify-center mb-6">
                        <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-white flex-shrink-0" />
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                            انضم إلينا
                        </h2>
                    </div>
                    <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-3xl mx-auto px-4 leading-relaxed">
                        نبحث عن مواهب شغوفة بالنظم، الأتمتة، وبناء تجارب عربية احترافية في نوشن.
                    </p>
                    <p className="text-base sm:text-lg text-white/80 mb-6 sm:mb-8 max-w-2xl mx-auto px-4 leading-relaxed">
                        لو تحب تشتغل على مشاريع حقيقية وتأثير ملموس — انضم لفريقنا وشاركنا رحلتنا.
                    </p>
                    <p className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-6 sm:mb-8">
                        شاركنا التأثير. ابنِ معنا.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
                        <Link href="/careers" className="btn-secondary px-8 sm:px-10 py-3 sm:py-4 bg-white text-primary-500 hover:bg-gray-100 w-full sm:w-auto text-center text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                            انضم للفريق
                        </Link>
                        <Link href="/contact" className="px-8 sm:px-10 py-3 sm:py-4 bg-white/10 text-white hover:bg-white/20 w-full sm:w-auto text-center text-base sm:text-lg font-semibold rounded-xl border-2 border-white/30 transition-all duration-300">
                            تواصل معنا
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
