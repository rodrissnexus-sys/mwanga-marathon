"use client";

import React from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import { motion } from 'framer-motion';

const HeroSection = ({
  title,
  subtitle,
  backgroundImage,
  overlayOpacity = 0.6,
  textColor = 'text-tertiary',
  textAlignment = 'text-center',
  height = 'min-h-[600px]',
  children
}) => {
  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'var(--color-primary)',
    opacity: overlayOpacity
  };

  const titleVariants = {
    hidden: {
      y: -50,
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
        delay: 0.2,
      },
    },
  };

  const subtitleVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
        delay: 0.4,
      },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
        delay: 0.6,
      },
    },
  };

  return (
    <div 
      className={`relative flex items-center justify-center ${height} w-full h-full overflow-hidden`} 
    >
      {backgroundImage && (
        <Image
          src={backgroundImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      )}
      {backgroundImage && <div style={overlayStyle} />}
      
      <motion.div 
        className="relative z-10 px-4 sm:px-6 lg:px-8"
        initial="hidden"
        animate="visible"
      >
        <div className={`max-w-4xl mx-auto ${textAlignment}`}>
          {title && (
            <motion.h1 
              className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 ${textColor}`}
              variants={titleVariants}
              style={{
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                letterSpacing: '0.05em',
              }}
            >
              {title}
            </motion.h1>
          )}
          
          {subtitle && (
            <motion.p 
              className={`text-xl sm:text-2xl mb-8 ${textColor}`}
              variants={subtitleVariants}
              style={{
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
              }}
            >
              {subtitle}
            </motion.p>
          )}
          
          {children && (
            <motion.div 
              className="mt-8"
              variants={contentVariants}
            >
              {children}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

HeroSection.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  backgroundImage: PropTypes.string,
  overlayOpacity: PropTypes.number,
  textColor: PropTypes.string,
  textAlignment: PropTypes.string,
  height: PropTypes.string,
  children: PropTypes.node
};

export default HeroSection;
