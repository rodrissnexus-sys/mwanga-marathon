"use client";

import { useTranslations } from "next-intl";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/lib/router';
import { fetchEvents } from '../../../api/dropdowns';

// Card colours, used in turn. Every part of a card (title, fee panel, labels,
// button) takes its text colour from the card's own theme so it stays readable.
const THEMES = [
  { card: 'bg-primary', text: 'text-tertiary', muted: 'text-tertiary/75', panel: 'bg-tertiary/10', button: 'bg-secondary text-primary hover:bg-secondary/90' },
  { card: 'bg-secondary', text: 'text-primary', muted: 'text-primary/75', panel: 'bg-primary/10', button: 'bg-primary text-tertiary hover:bg-primary/90' },
  { card: 'bg-tertiary', text: 'text-primary', muted: 'text-primary/75', panel: 'bg-primary/5', button: 'bg-secondary text-primary hover:bg-secondary/90' },
  { card: 'bg-primary', text: 'text-tertiary', muted: 'text-tertiary/75', panel: 'bg-tertiary/10', button: 'bg-secondary text-primary hover:bg-secondary/90' },
];

const formatMoney = (currency, amount) => `${currency} ${Number(amount).toLocaleString('en-US')}`;

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
            // Distance is stored per event (km); unknown ones show "TBD"
            const distance = event.distance_km ? `${Number(event.distance_km)} km` : t("tbd");

            return {
              id: event.id,
              title: event.name,
              distance: distance,
              description: event.description || t("defaultDescription"),
              price: formatMoney('TZS', event.local_price),
              foreignPrice: formatMoney('USD', event.foreign_price),
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
        <p className="text-negative mb-4">{error}</p>
        <p>{t("pleaseTryAgainLater")}</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return <p className="text-center py-10 text-primary">{t("pleaseTryAgainLater")}</p>;
  }
  const displayCategories = categories;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      // flex instead of grid so an incomplete last row is centred
      className="flex flex-wrap justify-center gap-8"
    >
      {displayCategories.map((category, index) => {
        const theme = THEMES[index % THEMES.length];
        return (
        <motion.div
          key={category.id}
          variants={itemVariants}
          className="group w-full md:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)]"
        >
          <div className={`relative rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full flex flex-col border border-primary/10 ${theme.card}`}>
            {/* Decorative elements (behind the text) */}
            <div className="absolute -right-3 -bottom-3 w-24 h-24 bg-secondary opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute -left-3 -top-3 w-16 h-16 bg-primary opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500" />

            <div className="relative p-6">
              <h3 className={`text-2xl font-bold mb-2 ${theme.text}`}>{category.title}</h3>
              <div className={`text-lg font-semibold mb-4 ${theme.text}`}>{category.distance}</div>
              <p className={`mb-4 ${theme.text}`}>{category.description}</p>
            </div>

            <div className={`relative mt-auto p-6 ${theme.panel}`}>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                {[
                  [t("entryFee"), category.price],
                  [t("foreignEntryFee"), category.foreignPrice],
                ].filter(([, value]) => value).map(([label, value]) => (
                  <div key={label}>
                    <dt className={`text-xs font-medium uppercase tracking-wide ${theme.muted}`}>{label}</dt>
                    <dd className={`font-semibold ${theme.text}`}>{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5 text-center">
                <Link
                  to="/register"
                  className={`inline-flex items-center justify-center min-h-11 px-6 rounded-full text-sm font-semibold transition-colors duration-300 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary ${theme.button}`}
                >
                  {t("register")}
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
        );
      })}
    </motion.div>
  );
};

export default CategoryCards;
