'use client';

import React, { useEffect } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export default function GlowTracker() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out the movement with spring physics
  const springConfig = { damping: 30, stiffness: 200 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Use clientX/Y for viewport relative position
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full bg-primary-500/10 blur-[120px] dark:bg-primary-500/5 transition-colors duration-500"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
      {/* Subtle overlay to soften the glow */}
      <div className="absolute inset-0 bg-transparent backdrop-blur-[100px] opacity-20 pointer-events-none" />
    </div>
  );
}
