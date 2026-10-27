"use client";

import { useTranslations } from "next-intl";
import React from 'react';
import { Link } from '@/lib/router';
import { motion } from 'framer-motion';

const PrimaryButton = ({ children }) => (
  <button className="group px-6 py-3 bg-secondary text-text-primary font-medium rounded-full hover:bg-secondary/90 transition-colors duration-300 flex items-center cursor-pointer">
    {children}
  </button>
);

const CategoryCTA = () => {
  const t = useTranslations("raceCategories.cta");
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center py-12 bg-primary text-tertiary rounded-lg shadow-lg relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary opacity-5 rounded-full -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary opacity-10 rounded-full -ml-16 -mb-16" />
      
      <h3 className="text-2xl font-bold mb-4">{t("readyToJoinUs")}</h3>
      <p className="text-lg mb-8 max-w-2xl mx-auto">{t("registerNowToSecure")}</p>
      
      <div className="flex justify-center">
        <Link to="/register">
          <PrimaryButton>
            {t("registerNow")}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-2 inline-block transform group-hover:translate-x-1 transition-transform duration-300"
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
      </div>
    </motion.div>
  );
};

export default CategoryCTA;
