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
        <main className="min-h-screen bg-gray-50 dark:bg-black relative overflow-x-hidden transition-colors duration-300" dir="rtl">
            {/* Ambient Mesh Background */}
            <div className="fixed inset-0 pointer-events-none z-10">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

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









            {/* CTA Section - Showroom Style */}
            <section className="py-32 sm:py-48 relative z-10 overflow-visible">
                <div className="container-custom">
                    <div className="bg-gradient-to-br from-primary-600 to-purple-700 rounded-[3rem] p-10 sm:p-20 text-center shadow-glow relative overflow-hidden group">
                        {/* Interactive background shapes */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 group-hover:scale-150 transition-transform duration-700" style={{ animationDelay: '1s' }}></div>

                        <div className="relative z-10">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-white/20 backdrop-blur-xl mb-8 shadow-large">
                                <Rocket className="w-10 h-10 text-white animate-bounce" />
                            </div>

                            <h2 className="text-5xl sm:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
                                شاركنا التأثير. <span className="text-white/70">ابنِ معنا.</span>
                            </h2>

                            <p className="text-lg sm:text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed font-bold">
                                نبحث عن مواهب شغوفة بالنظم، الأتمتة، وبناء تجارب عربية احترافية في نوشن.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                                <Link href="/careers" className="px-10 py-5 bg-white text-primary font-black rounded-2xl shadow-large hover:scale-105 transition-all text-xl">
                                    انضم للفريق
                                </Link>
                                <Link href="/contact" className="px-10 py-5 bg-white/10 backdrop-blur-md text-white font-black rounded-2xl border-none shadow-soft hover:bg-white/20 transition-all text-xl">
                                    تواصل معنا
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
