'use client';

import { useState, useEffect, useRef } from 'react';

const Counter = ({
  end,
  duration = 2000,
  start = 0,
  delay = 0,
  className = "",
  suffix = "",
  prefix = "",
  separator = ",",
  decimals = 0,
  startImmediately = false
}) => {
  const [count, setCount] = useState(start);
  const [isVisible, setIsVisible] = useState(startImmediately);
  const counterRef = useRef(null);
  const hasAnimated = useRef(false);
  const animationRef = useRef(null);
  const [currentEnd, setCurrentEnd] = useState(end);

  useEffect(() => {
    if (startImmediately) {
      setIsVisible(true);
      hasAnimated.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          setIsVisible(true);
          hasAnimated.current = true;
        }
      },
      { threshold: 0.1 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current);
      }
    };
  }, [startImmediately]);

  // Update currentEnd when end prop changes (when data is fetched)
  useEffect(() => {
    setCurrentEnd(end);
    
    // If we get real data (end > 0) and haven't animated yet, start animation
    if (end > 0 && !hasAnimated.current) {
      setIsVisible(true);
      hasAnimated.current = true;
    }
    
    // If animation is already running and we get new data, restart animation
    if (isVisible && hasAnimated.current && end !== currentEnd && end > 0) {
      // Cancel current animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Restart animation with new end value
      const timer = setTimeout(() => {
        const startTime = Date.now();
        const startValue = count; // Start from current count
        const endValue = end;

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Easing function for smooth animation (ease-out-cubic)
          const easeOutCubic = 1 - Math.pow(1 - progress, 3);
          
          const currentValue = startValue + (endValue - startValue) * easeOutCubic;
          
          setCount(currentValue);

          if (progress < 1) {
            animationRef.current = requestAnimationFrame(animate);
          } else {
            setCount(endValue);
          }
        };

        animationRef.current = requestAnimationFrame(animate);
      }, 100); // Small delay to ensure smooth transition
      
      return () => clearTimeout(timer);
    }
  }, [end, isVisible, currentEnd, count, duration]);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      const startTime = Date.now();
      const startValue = start;
      const endValue = currentEnd;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation (ease-out-cubic)
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);

        const currentValue = startValue + (endValue - startValue) * easeOutCubic;

        setCount(currentValue);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setCount(endValue);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, currentEnd, duration, delay, start]);

  const formatNumber = (num) => {
    if (decimals > 0) {
      return num.toFixed(decimals);
    }

    const rounded = Math.round(num);

    if (separator && rounded >= 1000) {
      return rounded.toLocaleString();
    }

    return rounded.toString();
  };

  return (
    <span ref={counterRef} className={className}>
      {prefix}{formatNumber(count)}{suffix}
    </span>
  );
};

export default Counter;
