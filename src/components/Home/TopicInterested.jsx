'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';

const INTERESTED_TOPICS = [
  'Scroll-Driven Motion',
  'Cinematic Web Video',
  'Interactive Web',
  'Complex Web Applications',
  'Web Animations',
  'High-End Web Apps',
  'UI/UX Design',
  'Logo Design',
  'Government Apps'
];

export default function TopicInterested() {
  const headerRef = useRef(null);
  const badgesRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-25% 0px -10% 0px" });
  const badgesInView = useInView(badgesRef, { once: true, margin: "-35% 0px -10% 0px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04
      }
    }
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.7, filter: 'blur(3px)' },
    visible: (idx) => ({
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.36,
        ease: [0.34, 1.56, 0.64, 1],
        delay: idx * 0.095 + 0.35 // 95ms stagger per index + initial delay
      }
    })
  };

  const headerContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1
    }
  };

  const BUILD_EASE = [0.2, 0.8, 0.2, 1];

  const wordVariants = {
    hidden: { 
      opacity: 0, 
      x: 88, 
      y: 6, 
      scale: 0.992, 
      filter: "blur(3.5px)" 
    },
    visible: (idx) => ({
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: idx === 0 ? 0.34 : 0.43,
        ease: BUILD_EASE,
        delay: idx * 0.43 // Stagger delay at 430ms per word as per build timing
      }
    })
  };

  return (
    <>
      {/* Header with Kinetic Center Build styled word-by-word reveal */}
      <motion.div 
        ref={headerRef}
        variants={headerContainerVariants}
        initial="hidden"
        animate={headerInView ? "visible" : "hidden"}
        className="flex flex-wrap items-center"
      >
        {["Topics", "I'm", "Interested", "In"].map((word, idx) => (
          <span key={idx}>
            <motion.span
              custom={idx}
              variants={wordVariants}
              className="text-sm font-sans font-medium text-neutral-400 inline-block"
            >
              {word}
            </motion.span>
            {idx < 3 && (
              <span
                aria-hidden="true"
                style={{ display: "inline-block", whiteSpace: "pre" }}
              >
                {" "}
              </span>
            )}
          </span>
        ))}
      </motion.div>

      {/* Badges Container without badge icons or extra borders */}
      <motion.div 
        ref={badgesRef}
        variants={containerVariants}
        initial="hidden"
        animate={badgesInView ? "visible" : "hidden"}
        className="flex flex-wrap gap-2"
      >
        {INTERESTED_TOPICS.map((topic, idx) => (
          <motion.div
            key={idx}
            custom={idx}
            variants={badgeVariants}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-bg-card text-neutral-200 shadow-sm"
          >
            <span>{topic}</span>
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}
