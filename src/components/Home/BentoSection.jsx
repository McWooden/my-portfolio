'use client';

import React from 'react';
import { motion } from 'framer-motion';
import HeroVisual from './HeroVisual';
import TopicInterested from './TopicInterested';
import BentoPublicChat from './BentoPublicChat';
import BentoAntigravityIde from './BentoAntigravityIde';

export default function BentoSection({ homepageData, testimonialCard }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 16
      }
    }
  };

  const cardsContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.16,
        delayChildren: 0.05
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 35, scale: 0.96, filter: 'blur(3px)' },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        stiffness: 110,
        damping: 15
      }
    }
  };

  return (
    <div className="w-full flex flex-col gap-10">
      
      {/* Section 1: Headline & Tech Stack */}
      <div className="w-full min-h-screen md:h-screen flex items-center justify-center relative py-16 md:py-0">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col md:flex-row md:items-stretch gap-8 md:gap-16 lg:gap-24 max-w-6xl w-full justify-between px-4"
        >
          {/* Left Headline - Simple in-view fade/slide reveal */}
          <motion.div variants={itemVariants} className="flex flex-col justify-center select-none">
            <h2 className="font-sans text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.02] flex flex-col text-white">
              <span>Mau bikin</span>
              <span>apa nih?</span>
            </h2>
          </motion.div>

          {/* Right Side - Topics I'm Interested In */}
          <motion.div variants={itemVariants} className="flex flex-col justify-between py-1 max-w-[420px] w-full gap-4 md:gap-0">
            <TopicInterested />
          </motion.div>
        </motion.div>
      </div>

      {/* Section 2: 3 Side-by-side Bento Cards stretched to fill viewport height */}
      <motion.div 
        variants={cardsContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 md:h-[calc(100vh-240px)] min-h-[450px]"
      >
        <motion.div variants={cardVariants} className="col-span-1 flex">
          <HeroVisual 
            contentHeight={null} 
            homepageData={homepageData} 
            testimonialCard={testimonialCard} 
          />
        </motion.div>

        <motion.div variants={cardVariants} className="col-span-1 flex">
          <BentoAntigravityIde />
        </motion.div>

        <motion.div variants={cardVariants} className="col-span-1 flex">
          <BentoPublicChat />
        </motion.div>
      </motion.div>

    </div>
  );
}
