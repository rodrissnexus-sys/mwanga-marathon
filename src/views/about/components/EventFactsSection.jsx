"use client";

import { useTranslations } from "next-intl";
import React from 'react';
import { motion } from 'framer-motion';
import SectionHeader from '../../../components/common/SectionHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faBolt, faGlobe, faCalendarDays } from '@fortawesome/free-solid-svg-icons';

const EventFactsSection = () => {
  const t = useTranslations("about.facts");
  const facts = [
    {
      title: '2000+',
      description: t("expectedParticipants"),
      icon: <FontAwesomeIcon icon={faUsers} className="w-16 h-16 text-4xl text-secondary" />,
    },
    {
      title: '4+',
      description: t("culturalEvents"),
      icon: <FontAwesomeIcon icon={faGlobe} className="w-16 h-16 text-4xl text-secondary" />,
    },
    {
      title: '2+',
      description: t("daysOfFestivities"),
      icon: <FontAwesomeIcon icon={faCalendarDays} className="w-16 h-16 text-4xl text-secondary" />,
    },
  ];

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
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {facts.map((fact, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="group"
          >
            <div className="relative p-6 bg-tertiary rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
              <div className="flex justify-center mb-4">
                {fact.icon}
              </div>
              <h3 className="text-2xl font-bold text-primary mb-2">{fact.title}</h3>
              <p className="text-text-primary/80">{fact.description}</p>
              
              {/* Decorative elements */}
              <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-primary opacity-10 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-500" />
              <div className="absolute -left-2 -top-2 w-16 h-16 bg-secondary opacity-10 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-500" />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default EventFactsSection;
