"use client";

import { useTranslations } from "next-intl";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/lib/router';
import { fetchEvents } from '../../../api/dropdowns';

const CategoryCards = () => {
  const t = useTranslations("raceCategories.cards");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const response = await fetchEvents();
        
        if (response.success) {
          // Map API data to our component's expected format
          const formattedCategories = response.data.map((event, index) => {
            // Use predefined icons based on event name or index
            const icons = ['/images/icons/marathon.svg', '/images/icons/half-marathon.svg', '/images/icons/10k.svg', '/images/icons/5k.svg'];
            // Use the custom theme colors defined in index.css
            const colors = ['bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-primary/80'];
            const textColors = ['text-tertiary', 'text-text-primary', 'text-text-primary', 'text-tertiary'];
            const ageLimits = [t("n18Years"), t("n16Years"), t("n14Years"), t("allAges")];
            
            // Extract distance from name or use default
            let distance = '';
            if (event.name.includes('Full') || event.name.includes('Marathon')) {
              distance = '42.195 km';
            } else if (event.name.includes('Half')) {
              distance = '21.0975 km';
            } else if (event.name.includes('10K')) {
              distance = '10 km';
            } else if (event.name.includes('5K')) {
              distance = '5 km';
            } else {
              // Default distance if not found in name
              distance = t("tbd");
            }
            
            return {
              id: event.id,
              title: event.name,
              distance: distance,
              description: event.description || t("defaultDescription"),
              icon: icons[index % icons.length],
              color: colors[index % colors.length],
              textColor: textColors[index % textColors.length],
              price: `TZS ${event.local_price}`,
              foreignPrice: `USD ${event.foreign_price}`,
              kidsPrice: `TZS ${event.local_kids_price}`,
              ageLimit: ageLimits[index % ageLimits.length]
            };
          });
          
          setCategories(formattedCategories);
        } else {
          setError(t("failedToLoadRace"));
        }
      } catch (err) {
        console.error('Error loading race categories:', err);
        setError(t("anErrorOccurredWhile"));
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red mb-4">{error}</p>
        <p>{t("pleaseTryAgainLater")}</p>
      </div>
    );
  }

  // Fallback to static data if no categories are returned from API
  const displayCategories = categories.length > 0 ? categories : [
    {
      id: 1,
      title: t("fullMarathon"),
      distance: '42.195 km',
      description: t("fullMarathonDesc"),
      icon: '/images/icons/marathon.svg',
      color: 'bg-primary',
      textColor: 'text-tertiary',
      price: 'TZS 50,000',
      ageLimit: t("n18Years")
    },
    {
      id: 2,
      title: t("halfMarathon"),
      distance: '21.0975 km',
      description: t("halfMarathonDesc"),
      icon: '/images/icons/half-marathon.svg',
      color: 'bg-secondary',
      textColor: 'text-text-primary',
      price: 'TZS 40,000',
      ageLimit: t("n16Years")
    },
    {
      id: 3,
      title: t("race10k"),
      distance: '10 km',
      description: t("race10kDesc"),
      icon: '/images/icons/10k.svg',
      color: 'bg-tertiary',
      textColor: 'text-text-primary',
      price: 'TZS 30,000',
      ageLimit: t("n14Years")
    },
    {
      id: 4,
      title: t("funRun5k"),
      distance: '5 km',
      description: t("funRun5kDesc"),
      icon: '/images/icons/5k.svg',
      color: 'bg-primary/80',
      textColor: 'text-tertiary',
      price: 'TZS 20,000',
      ageLimit: t("allAges")
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
    >
      {displayCategories.map((category) => (
        <motion.div
          key={category.id}
          variants={itemVariants}
          className="group"
        >
          <div className={`relative rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full flex flex-col ${category.color}`}>
            <div className="p-6">
              <div className={`text-2xl font-bold mb-2 ${category.textColor}`}>{category.title}</div>
              <div className={`text-lg font-semibold mb-4 ${category.textColor}`}>{category.distance}</div>
              <p className={`mb-4 ${category.textColor} opacity-90`}>{category.description}</p>
            </div>
            
            <div className="mt-auto p-6 bg-black/5 backdrop-blur-sm">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold">{t("entryFee")}</div>
                  <div>{category.price}</div>
                </div>
                {category.foreignPrice && (
                  <div>
                    <div className="font-semibold">{t("foreignEntryFee")}</div>
                    <div>{category.foreignPrice}</div>
                  </div>
                )}
                {category.kidsPrice && (
                  <div>
                    <div className="font-semibold">{t("kidsEntryFee")}</div>
                    <div>{category.kidsPrice}</div>
                  </div>
                )}
                <div>
                  <div className="font-semibold">{t("ageRequirement")}</div>
                  <div>{category.ageLimit}</div>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <Link 
                  to="/register" 
                  className="inline-block px-6 py-2 rounded-full bg-secondary text-text-primary text-sm font-medium hover:bg-secondary/90 transition-colors duration-300 cursor-pointer"
                >
                  {t("register")}
                </Link>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -right-3 -bottom-3 w-24 h-24 bg-secondary opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute -left-3 -top-3 w-16 h-16 bg-primary opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500" />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default CategoryCards;
