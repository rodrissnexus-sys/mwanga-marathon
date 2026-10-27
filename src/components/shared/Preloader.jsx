"use client";

import { useTranslations } from "next-intl";
import React from 'react';
import { motion } from 'framer-motion';

const Preloader = () => {
  const t = useTranslations("common.preloader");
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <motion.div 
        className="flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo animation */}
        <div className="flex mb-4">
          {"MWAFEM".split('').map((letter, index) => (
            <motion.div
              key={index}
              className="text-3xl font-bold text-primary mx-1"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                delay: index * 0.1,
                duration: 0.5,
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: 0.5
              }}
            >
              {letter}
            </motion.div>
          ))}
        </div>
        
        {/* Loading text */}
        <motion.p 
          className="text-primary/70 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {t("text")}
        </motion.p>
        
        {/* Loading bar */}
        <div className="w-48 h-1 bg-gray-200 rounded-full mt-4 overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary to-secondary"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut" 
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Preloader;
