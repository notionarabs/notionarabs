'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Footer from '../components/Footer';

// Homepage Sub-components
import Hero from '../components/home/Hero';
import HomeMarketplace from '../components/home/HomeMarketplace';

// Dynamically import components that are below the fold
const FAQ = dynamic(() => import('../components/home/FAQ'), { ssr: true });
const FinalCTA = dynamic(() => import('../components/home/FinalCTA'), { ssr: true });
const Testimonials = dynamic(() => import('../components/home/Testimonials'), { ssr: true });
const Integrations = dynamic(() => import('../components/home/Integrations'), { ssr: true });

export default function HomePageClient({ initialStats }) {
  const [animationsPlayed, setAnimationsPlayed] = useState(false);

  // Respect reduced motion and stop replaying animations.
  useEffect(() => {
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setAnimationsPlayed(true);
      return undefined;
    }

    const timer = setTimeout(() => {
      setAnimationsPlayed(true);
    }, 2000); // After all animations complete (0.9s + 1s)

    return () => clearTimeout(timer);
  }, []);

  // Icon draw animation observer
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const elements = Array.from(document.querySelectorAll('[data-draw-icon]'));
    if (elements.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('icon-draw-animate');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.35 }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);


  // Section reveal observer
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const sections = Array.from(document.querySelectorAll('[data-reveal-section]'));
    if (sections.length === 0) return undefined;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    sections.forEach((section, index) => {
      section.classList.add('reveal-on-scroll');
      section.style.setProperty('--reveal-delay', `${Math.min(index, 8) * 80}ms`);
    });

    if (prefersReducedMotion) {
      sections.forEach((section) => section.classList.add('is-revealed'));
      return undefined;
    }

    requestAnimationFrame(() => {
      document.documentElement.classList.add('reveal-ready');
    });

    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          observerInstance.unobserve(entry.target);
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -15% 0px' }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
      document.documentElement.classList.remove('reveal-ready');
    };
  }, []);


  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300 bg-mesh" dir="rtl">
      <Hero animationsPlayed={animationsPlayed} initialStats={initialStats} />
      <HomeMarketplace />
      <Integrations />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
