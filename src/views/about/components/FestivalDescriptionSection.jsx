"use client";

import { useTranslations } from "next-intl";
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const FestivalDescriptionSection = () => {
  const t = useTranslations("about.festival");
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const highlightVariants = {
    hidden: { width: 0, opacity: 0 },
    visible: {
      width: '100%',
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <div className="mb-20" ref={sectionRef}>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="relative"
      >
        {/* Main description card with elegant design */}
        <motion.div 
          variants={itemVariants} 
          className="relative z-10 bg-gradient-to-br from-tertiary to-tertiary/90 rounded-lg p-8 md:p-10 overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-secondary opacity-10 rounded-full transform rotate-45"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary opacity-10 rounded-full"></div>
          <div className="absolute top-1/4 right-10 w-6 h-6 bg-secondary opacity-20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/3 left-1/4 w-4 h-4 bg-primary opacity-20 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          
          {/* Content */}
          <div className="relative z-10">
            <motion.div 
              variants={itemVariants}
              className="mb-8"
            >
              <h3 className="text-2xl font-light text-primary mb-6 tracking-wide relative inline-block">
                <span className="relative z-10">{t("welcome")}</span>
                <motion.span 
                  variants={highlightVariants}
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-secondary to-secondary/30"
                ></motion.span>
              </h3>
              <p className="text-lg text-text-primary/80 leading-relaxed mb-6">
                {t("intro1")}
              </p>
              <p className="text-lg text-text-primary/80 leading-relaxed">
                {t("intro2")}
              </p>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8"
            >
              <div className="bg-white/50 backdrop-blur-sm p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 group">
                <h4 className="text-xl font-medium text-primary mb-3 group-hover:text-secondary transition-colors duration-300">{t("communityTitle")}</h4>
                <p className="text-text-primary/70">
                  {t.rich("communityText", {
                    org: (chunks) => <b>{chunks}</b>,
                    link: (chunks) => <b><a className="text-primary underline hover:no-underline" href="https://kisangaratours.com" target="_blank" rel="noopener noreferrer">{chunks}</a></b>,
                  })}
                </p>
                <div className="w-12 h-0.5 bg-secondary mt-4 group-hover:w-full transition-all duration-500"></div>
              </div>
              
              <div className="bg-white/50 backdrop-blur-sm p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 group">
                <h4 className="text-xl font-medium text-primary mb-3 group-hover:text-secondary transition-colors duration-300">{t("invitationTitle")}</h4>
                <p className="text-text-primary/70">
                  {t("invitationText")}
                </p>
                <div className="w-12 h-0.5 bg-secondary mt-4 group-hover:w-full transition-all duration-500"></div>
              </div>
            </motion.div>

            {/* Key points with elegant styling */}
            <motion.div variants={itemVariants} className="bg-primary/5 backdrop-blur-sm p-6 rounded-lg">
              <h4 className="text-xl font-medium text-primary mb-4 flex items-center">
                <span className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                {t("keyInfo")}
              </h4>
              
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-secondary mr-2">•</span>
                  <div>
                    <span className="font-medium text-lg text-primary">{t("regionalFocus")}</span>
                    <p className="text-text-primary/70 ml-1">{t("regionalFocusText")}</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <span className="text-secondary mr-2">•</span>
                  <div>
                    <span className="font-medium text-lg text-primary">{t("organization")}</span>
                    <p className="text-text-primary/70 ml-1">
                      {t.rich("organizationText", {
                        org: (chunks) => <b>{chunks}</b>,
                        link: (chunks) => <a className="text-primary underline hover:no-underline" href="https://kisangaratours.net" target="_blank" rel="noopener noreferrer">{chunks}</a>,
                      })}
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <span className="text-secondary mr-2">•</span>
                  <div>
                    <span className="font-medium text-lg text-primary">{t("purpose")}</span>
                    <p className="text-text-primary/70 ml-1">
                      {t("purposeText")}
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <span className="text-secondary mr-2">•</span>
                  <div>
                    <span className="font-medium text-lg text-primary">{t("distinction")}</span>
                    <p className="text-text-primary/70 ml-1">{t("distinctionText")}</p>
                  </div>
                </li>
              </ul>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Decorative floating elements */}
        <div className="absolute top-10 -left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 -right-10 w-20 h-20 bg-secondary/10 rounded-full blur-xl"></div>
      </motion.div>
    </div>
  );
};

export default FestivalDescriptionSection;
