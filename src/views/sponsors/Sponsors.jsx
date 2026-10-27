"use client";

import { useTranslations } from "next-intl";
import React from 'react';
import { motion } from 'framer-motion';
import HeroSection from '../../components/common/HeroSection';
import { sponsorsHeroData as sponsorsHeroDataBase } from './data/sponsorsHeroData';
import SponsorshipTiers from './components/SponsorshipTiers';
import ContactSection from './components/ContactSection';
import SponsorSection from '../about/components/SponsorSection';
import PrimaryButton from '../../components/common/buttons/PrimaryButton';

const Sponsors = () => {
  const sponsorsHeroData = { ...sponsorsHeroDataBase, ...useTranslations("hero").raw("sponsors") };
  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-tertiary to-primary/5">

        {/* Hero Section */}
        <HeroSection
          title={sponsorsHeroData.title}
          subtitle={sponsorsHeroData.subtitle}
          backgroundImage={sponsorsHeroData.backgroundImage}
        >
          <a href="#sponsors" className="inline-block">
            <PrimaryButton>
              <span className={sponsorsHeroData.className}>{sponsorsHeroData.cta}</span>
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
          </a>
        </HeroSection>

        {/* Main Content */}
        <div id="sponsors" className="relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary opacity-5 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary opacity-5 rounded-full -ml-32 -mb-32" />

          {/* Sponsorship Tiers */}
          <SponsorshipTiers />

          {/* Current sponsors (was only on the Swahili site) */}
          <SponsorSection />

          {/* Contact Section */}
          <ContactSection />
        </div>
      </div>
    </>
  );
};

export default Sponsors;
