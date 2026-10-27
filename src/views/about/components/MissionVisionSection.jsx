"use client";

import { useTranslations } from "next-intl";
import React from 'react';
import { motion } from 'framer-motion';
import SectionHeader from '../../../components/common/SectionHeader';

const MissionVisionSection = () => {
  const t = useTranslations("about.purpose");
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
      <SectionHeader firstWord={t("titleFirst")} secondWord={t("titleSecond")} />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-12"
      >
        <motion.div variants={itemVariants} className="group">
          <div className="relative p-8 bg-tertiary rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="absolute -top-4 left-8 bg-primary text-tertiary px-6 py-2 rounded-full text-sm uppercase tracking-wider">
              {t("mission")}
            </div>
            <div className="mt-4">
              <p className="text-lg text-text-primary/80 leading-relaxed">
                {t("missionText")}
              </p>
            </div>
            <div className="absolute -right-3 -bottom-3 w-24 h-24 bg-secondary opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute -left-3 -top-3 w-16 h-16 bg-primary opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500" />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="group">
          <div className="relative p-8 bg-tertiary rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="absolute -top-4 left-8 bg-secondary text-text-primary px-6 py-2 rounded-full text-sm uppercase tracking-wider">
              {t("vision")}
            </div>
            <div className="mt-4">
              <p className="text-lg text-text-primary/80 leading-relaxed">
                {t("visionText")}
              </p>
            </div>
            <div className="absolute -right-3 -bottom-3 w-24 h-24 bg-primary opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute -left-3 -top-3 w-16 h-16 bg-secondary opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MissionVisionSection;
