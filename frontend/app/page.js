'use client';

import { useEffect, useRef, useState } from 'react';
import Footer from '../components/Footer';
import CompaniesTicker from '../components/CompaniesTicker';

// Homepage Sub-components
import Hero from '../components/home/Hero';
import ProblemsWeSolve from '../components/home/ProblemsWeSolve';
import ServicesOverview from '../components/home/ServicesOverview';
import WhatMakesUsDifferent from '../components/home/WhatMakesUsDifferent';
import HowWeDoIt from '../components/home/HowWeDoIt';
import Testimonials from '../components/home/Testimonials';
import FAQ from '../components/home/FAQ';
import FinalCTA from '../components/home/FinalCTA';

export default function HomePage() {
  const [animationsPlayed, setAnimationsPlayed] = useState(false);
  const [inViewSteps, setInViewSteps] = useState([]);
  const [lineHeight, setLineHeight] = useState(0);
  const stepRefs = useRef([]);
  const timelineRef = useRef(null);

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

  // Timeline steps observer
  useEffect(() => {
    const targets = stepRefs.current.filter(Boolean);
    if (targets.length === 0) return undefined;

    const triggerStep = (index) => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          setInViewSteps((prev) => {
            if (prev.includes(index)) return prev;
            return [...prev, index];
          });
        }, 120);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && entry.intersectionRatio === 0) return;
          const index = Number(entry.target.dataset.stepIndex);
          if (!Number.isNaN(index)) triggerStep(index);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -20% 0px' }
    );

    targets.forEach((target) => {
      observer.observe(target);
      const rect = target.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        triggerStep(Number(target.dataset.stepIndex));
        observer.unobserve(target);
      }
    });

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

  // Continuous scroll line progress for timeline
  useEffect(() => {
    const handleScroll = () => {
      const steps = stepRefs.current;
      const container = timelineRef.current;
      if (!steps.length || !steps[0] || !container) return;

      const containerRect = container.getBoundingClientRect();
      const triggerPoint = window.innerHeight / 2;
      const relativeScrollPos = triggerPoint - containerRect.top;

      const firstStepTop = steps[0].offsetTop + (steps[0].offsetHeight / 2);
      const lastStepTop = steps[steps.length - 1].offsetTop + (steps[steps.length - 1].offsetHeight / 2);

      const totalDistance = lastStepTop - firstStepTop;
      const currentProgress = relativeScrollPos - firstStepTop;

      setLineHeight(Math.max(0, Math.min(currentProgress, totalDistance)));
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">
      <Hero animationsPlayed={animationsPlayed} />
      <CompaniesTicker />
      <ProblemsWeSolve />
      <ServicesOverview />
      <WhatMakesUsDifferent />
      <HowWeDoIt
        timelineRef={timelineRef}
        stepRefs={stepRefs}
        inViewSteps={inViewSteps}
        lineHeight={lineHeight}
      />
      {/* <Testimonials /> */}
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
