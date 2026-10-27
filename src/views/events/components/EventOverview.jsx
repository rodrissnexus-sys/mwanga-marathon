"use client";

import { useTranslations } from "next-intl";
import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay, faMapMarkerAlt, faUsers, faMedal } from '@fortawesome/free-solid-svg-icons';

const EventOverview = () => {
  const t = useTranslations("events.overview");
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const highlights = [
    {
      icon: faCalendarDay,
      title: t("annualEvent"),
      description: t("variousActivitiesIncludingPre"),
      color: 'bg-primary/10 text-primary'
    },
    {
      icon: faMapMarkerAlt,
      title: t("location"),
      description: t("experienceTheBeautyOf"),
      color: 'bg-secondary/10 text-secondary'
    },
    {
      icon: faUsers,
      title: t("peopleOfAllAges"),
      description: t("eventsForEveryoneFrom"),
      color: 'bg-tertiary/10 text-tertiary'
    },
    {
      icon: faMedal,
      title: t("variousRaceCategories"),
      description: t("racesOfVariousDistances"),
      color: 'bg-primary/10 text-primary'
    }
  ];

  return (
    <div className="py-10">
      <div className="max-w-3xl mx-auto mb-12 text-center">
        <motion.p 
          className="text-lg md:text-xl text-text-primary/80 leading-relaxed"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.5 }}
        >
          {t("theMwangaFestivalMarathon")}
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        {highlights.map((item, index) => (
          <motion.div
            key={index}
            className="p-6 rounded-xl border border-primary/10 hover:border-secondary/30 transition-all duration-300 hover:shadow-lg group"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="flex items-start">
              <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center mr-4 transition-all duration-300 group-hover:scale-110`}>
                <FontAwesomeIcon icon={item.icon} className="text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-text-primary group-hover:text-primary transition-colors duration-300">{item.title}</h3>
                <p className="text-text-primary/70">{item.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default EventOverview;
