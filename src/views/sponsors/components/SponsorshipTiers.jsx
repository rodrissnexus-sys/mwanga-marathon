"use client";

import { useTranslations } from "next-intl";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PrimaryButton from '../../../components/common/buttons/PrimaryButton';
import SectionHeader from '../../../components/common/SectionHeader';
import Modal from '../../../components/common/Modal';
import PartnershipForm from '../../../components/forms/PartnershipForm';

const SponsorshipTiers = () => {
  const t = useTranslations("sponsors.tiers");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tiers = [
    {
      name: t("tanzanite"),
      price: 'Tsh. 100M',
      description: t("tanzaniteDesc"),
      benefits: [
        t("primeLogo"),
        t("vipAll"),
        t("dedicatedSocial"),
        t("speaking"),
        t("premiumBooth"),
        t("customBranding"),
        t("mediaCoverage")
      ],
      featured: true
    },
    {
      name: t("platinum"),
      price: 'Tsh. 80M',
      description: t("platinumDesc"),
      benefits: [
        t("prominentLogo"),
        t("vipAll"),
        t("enhancedSocial"),
        t("premiumBooth"),
        t("bannerKey"),
        t("pressReleases")
      ],
      featured: false 
    },
    {
      name: t("gold"),
      price: 'Tsh. 50M',
      description: t("goldDesc"),
      benefits: [
        t("logoMaterials"),
        t("vipMain"),
        t("socialMentions"),
        t("standardBooth"),
        t("bannerVenue")
      ],
      featured: false 
    },
    {
      name: t("silver"),
      price: 'Tsh. 30M',
      description: t("silverDesc"),
      benefits: [
        t("logoWebsite"),
        t("eventPasses"),
        t("socialMention"),
        t("boothSpace"),
        t("brandVisibility")
      ],
      featured: false
    }
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
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-4 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary opacity-5 rounded-full -mr-16 -mt-16 z-0"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary opacity-5 rounded-full -ml-16 -mb-16 z-0"></div>

        <div className="relative z-10">
          <SectionHeader firstWord={t("titleFirst")} secondWord={t("titleSecond")} />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16"
          >
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                variants={itemVariants}
                className={`group relative ${
                  tier.featured ? 'transform md:-translate-y-4' : ''
                }`}
              >
                <div className="relative p-8 bg-tertiary rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  {tier.featured && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-secondary text-primary px-6 py-1 rounded-full text-sm uppercase tracking-wider">
                      {t("mostPopular")}
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-primary mb-2">{tier.name}</h3>
                  <p className="mb-4"><span className="inline-block px-2.5 py-0.5 rounded-sm bg-secondary text-primary text-xl font-bold">{tier.price}</span></p>
                  <p className="text-text-primary/70 mb-6">{tier.description}</p>
                  <ul className="space-y-4 mb-8">
                    {tier.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start">
                        <svg
                          className="w-5 h-5 text-secondary mt-1 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-text-primary/80">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <PrimaryButton 
                    className="w-full flex justify-center"
                    onClick={() => setIsModalOpen(true)}
                  >
                    {t("joinUs")}
                  </PrimaryButton>
                </div>

                {/* Decorative circles */}
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary opacity-5 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-500"></div>
                <div className="absolute -left-4 -top-4 w-24 h-24 bg-secondary opacity-5 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-500"></div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Partnership Application Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={t("applicationTitle")}
        maxWidth="max-w-3xl"
      >
        <PartnershipForm onClose={() => setIsModalOpen(false)} />
      </Modal>
    </section>
  );
};

export default SponsorshipTiers;
