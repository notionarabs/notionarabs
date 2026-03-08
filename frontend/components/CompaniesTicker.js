'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const companies = [
    { name: 'شركة Trend Design', logo: '/clients/Trend Design.webp', invertInLight: false },
    { name: 'منصة رسالتك', logo: '/clients/Resaltk.webp', invertInLight: true },
    { name: 'Mostafa', logo: '/clients/Mostafa.webp', invertInLight: false },
    { name: 'Hazem', logo: '/clients/Hazem.webp', invertInLight: true },
    { name: 'Shoiep Studio', logo: '/clients/Shoiep Studio.webp', invertInLight: false },
    { name: 'أكاديمية YuYan', logo: '/clients/YuYan Academy.svg', invertInLight: false }
];

export default function CompaniesTicker() {
    const trackRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const speedRef = useRef(35); // Initial Pixels per second
    const actualSpeedRef = useRef(35); // For smooth transition

    useEffect(() => {
        let animationFrameId;
        let position = 0;
        let lastTime = performance.now();

        const animate = (time) => {
            const deltaTime = time - lastTime;
            lastTime = time;

            // Limit deltaTime to prevent huge jumps if tab was inactive
            const safeDelta = Math.min(deltaTime, 50);

            // Lerp the speed to make deceleration and acceleration extremely smooth
            actualSpeedRef.current += (speedRef.current - actualSpeedRef.current) * 0.1;

            position += (actualSpeedRef.current * safeDelta) / 1000;

            if (trackRef.current) {
                // Total width of all 4 sets
                const totalWidth = trackRef.current.scrollWidth;

                // Move positive X for RTL sliding rightwards
                // We reset after moving exactly half the total width (2 sets)
                const maxScroll = totalWidth / 2;

                if (position >= maxScroll && maxScroll > 0) {
                    position -= maxScroll;
                }

                trackRef.current.style.transform = `translateX(${position}px)`;
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    // Update target speed smoothly
    useEffect(() => {
        // 35 for normal, 5 for hovered (very slow readable)
        speedRef.current = isHovered ? 5 : 35;
    }, [isHovered]);

    return (
        <section className="py-8 sm:py-12 bg-secondary-50 dark:bg-dark-secondary border-b border-gray-200/50 dark:border-dark-card-border overflow-hidden transition-colors duration-300">
            <div className="container-custom mb-6 sm:mb-8">
                <p className="text-center text-sm sm:text-base font-semibold text-accent-500 dark:text-dark-text-tertiary tracking-wide">
                    نظم عمل موثوقة تعتمد عليها فرق طموحة
                </p>
            </div>

            <div
                className="relative flex overflow-hidden group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Ticker Track */}
                <div
                    ref={trackRef}
                    className="flex w-max items-center"
                    style={{ willChange: 'transform' }}
                >
                    {[...companies, ...companies, ...companies, ...companies].map((company, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-center w-40 sm:w-48 mx-4 sm:mx-8 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                        >
                            {company.logo ? (
                                <div className="relative w-full h-10 sm:h-12">
                                    <Image
                                        src={company.logo}
                                        alt={`شعار ${company.name}`}
                                        fill
                                        className={`object-contain ${company.invertInLight ? 'dark:invert-0 invert' : ''}`}
                                        unoptimized
                                    />
                                </div>
                            ) : null}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
