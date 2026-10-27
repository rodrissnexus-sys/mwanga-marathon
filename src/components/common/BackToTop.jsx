"use client";

import { useTranslations } from "next-intl";
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';

const BackToTop = () => {
  const t = useTranslations("common.backToTop");
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Scroll to top smooth effect
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3 }}
          onClick={scrollToTop}
          aria-label={t("label")}
          className="fixed bottom-8 right-8 p-3 rounded-full bg-gradient-to-r from-primary/90 to-secondary/90 text-tertiary shadow-lg hover:shadow-xl z-[1000] group"
        >
          <div className="relative">
            <FontAwesomeIcon 
              icon={faChevronUp} 
              className="text-lg transition-transform duration-300 group-hover:-translate-y-1" 
            />
            
            {/* Particle effects */}
            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-tertiary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-0 group-hover:scale-100 group-hover:animate-float"></span>
            <span className="absolute -bottom-1 -left-1 w-1 h-1 rounded-full bg-tertiary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-0 group-hover:scale-100 group-hover:animate-float" style={{animationDelay: "200ms"}}></span>
          </div>
          
          {/* Tooltip */}
          <span className="absolute -top-15 left-1/2 transform -translate-x-1/2 bg-black/70 text-tertiary text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 tertiaryspace-nowrap">
            {t("text")}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;
