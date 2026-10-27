"use client";

import { useTranslations } from "next-intl";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SectionHeader from '../../../components/common/SectionHeader';
import PrimaryButton from '../../../components/common/buttons/PrimaryButton';
import Modal from '../../../components/common/Modal';
import GeneralContactForm from '../../../components/forms/GeneralContactForm';

const ContactSection = () => {
  const t = useTranslations("sponsors.contact");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="py-20 relative">
      <div className="max-w-4xl mx-auto px-4 md:px-8 text-center overflow-x-hidden overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <SectionHeader firstWord={t("titleFirst")} secondWord={t("titleSecond")} />
          <p className="text-lg text-text-primary/80 mb-8">
            {t("text")}
          </p>
          <PrimaryButton onClick={() => setIsModalOpen(true)}>
            {t("getInTouch")}
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
        </motion.div>
      </div>

      {/* General Contact Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={t("modalTitle")}
        maxWidth="max-w-2xl"
      >
        <GeneralContactForm onClose={() => setIsModalOpen(false)} />
      </Modal>
    </section>
  );
};

export default ContactSection;
