"use client";

import { useTranslations } from "next-intl";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CategoryFAQ = () => {
  const t = useTranslations("raceCategories.faq");
  const [activeIndex, setActiveIndex] = useState(null);

  // questions and answers come from messages/{en,sw}/raceCategories.json
  const faqs = t.raw("items").map((item, index) => ({ id: index + 1, ...item }));

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {faqs.map((faq, index) => (
        <motion.div
          key={faq.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="mb-4"
        >
          <div
            onClick={() => toggleFAQ(index)}
            className={`p-4 rounded-lg cursor-pointer transition-colors duration-300 flex justify-between items-center ${activeIndex === index ? 'bg-primary text-tertiary' : 'bg-tertiary hover:bg-tertiary/80'}`}
          >
            <h3 className="font-medium text-lg">{faq.question}</h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transition-transform duration-300 ${activeIndex === index ? 'transform rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          
          <AnimatePresence>
            {activeIndex === index && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-tertiary/50 rounded-b-lg">
                  <p className="text-text-primary/90">{faq.answer}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

export default CategoryFAQ;
