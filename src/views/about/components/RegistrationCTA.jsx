"use client";

import { useTranslations } from "next-intl";
import React from 'react';
import { Link } from '@/lib/router';
import { motion } from 'framer-motion';
import PrimaryButton from '../../../components/common/buttons/PrimaryButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRunning } from '@fortawesome/free-solid-svg-icons';

const RegistrationCTA = () => {
  const t = useTranslations("about.cta");
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

  return (
    <div className="mb-20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-tertiary/70 backdrop-blur-sm rounded-lg p-8 md:p-12 text-center relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-primary opacity-5 rounded-full" />
        <div className="absolute -left-16 -top-16 w-64 h-64 bg-secondary opacity-5 rounded-full" />
        
        <motion.div variants={itemVariants} className="mb-4">
          <FontAwesomeIcon icon={faRunning} className="text-5xl text-secondary mb-6" />
        </motion.div>
        
        <motion.h3 variants={itemVariants} className="text-3xl font-bold text-primary mb-4">
          {t("title")}
        </motion.h3>
        
        <motion.p variants={itemVariants} className="text-lg text-text-primary/80 mb-8 max-w-2xl mx-auto">
          {t("text")}
        </motion.p>
        
        <motion.div variants={itemVariants}>
          <Link to="/register">
            <PrimaryButton className="text-lg">
              {t("registerNow")}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2 inline-block transform group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </PrimaryButton>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegistrationCTA;
