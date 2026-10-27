"use client";

import { useTranslations } from "next-intl";
import React from 'react';
import HeroSection from '../../components/common/HeroSection';
import { raceCategoriesHeroData as raceCategoriesHeroDataBase } from './data/race_categories_hero_data';
import SectionHeader from '../../components/common/SectionHeader';
import CategoryCards from './components/CategoryCards';
import CategoryFAQ from './components/CategoryFAQ';
import CategoryCTA from './components/CategoryCTA';

const RaceCategories = () => {
  const t = useTranslations("raceCategories.page");
  const raceCategoriesHeroData = { ...raceCategoriesHeroDataBase, ...useTranslations("hero").raw("raceCategories") };
  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-tertiary to-primary/5">

        {/* Hero Section */}
        <HeroSection
          title={raceCategoriesHeroData.title}
          subtitle={raceCategoriesHeroData.subtitle}
          backgroundImage={raceCategoriesHeroData.backgroundImage}
        >
        </HeroSection>

        {/* Main Content */}
        <section className="py-20 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary opacity-5 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary opacity-5 rounded-full -ml-32 -mb-32" />

          <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
            {/* Section Title */}
            <SectionHeader firstWord={t("titleFirst")} secondWord={t("titleSecond")} />
            
            {/* Race Categories Section */}
            <div className="mb-20">
              <p className="text-center text-lg text-text-primary/80 mb-12 max-w-3xl mx-auto">
                {t("exploreOurDiverseRange")}
              </p>
              
              {/* Category Cards */}
              <CategoryCards />
            </div>

            {/* FAQ Section */}
            <div className="mb-20">
              <SectionHeader firstWord={t("faqFirst")} secondWord={t("faqSecond")} />
              <CategoryFAQ />
            </div>

            {/* CTA Section */}
            <CategoryCTA />
          </div>
        </section>
      </div>
    </>
  );
};

export default RaceCategories;
