'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

export default function TiltCard({ children, className, variants }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-6, 6]);
  
  const glowX = useTransform(x, [-0.5, 0.5], ["0%", "100%"]);
  const glowY = useTransform(y, [-0.5, 0.5], ["0%", "100%"]);

  const [rawPos, setRawPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event) => {
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left - width / 2;
    const mouseY = event.clientY - rect.top - height / 2;
    const rx = mouseX / width;
    const ry = mouseY / height;
    x.set(rx);
    y.set(ry);
    setRawPos({ x: rx, y: ry });
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setRawPos({ x: 0, y: 0 });
  };

  return (
    <motion.div
      variants={variants}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`${className} relative overflow-hidden`}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Glossy reflection glow effect */}
      <motion.div
        style={{
          background: `radial-gradient(circle 240px at ${glowX} ${glowY}, rgba(255,255,255,0.06), transparent)`,
          pointerEvents: "none"
        }}
        className="absolute inset-0 z-20 rounded-[30px]"
      />
      {typeof children === "function" ? children(rawPos) : children}
    </motion.div>
  );
}
