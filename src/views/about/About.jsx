"use client";

import { useTranslations } from "next-intl";
import React from 'react';
import { Link } from '@/lib/router';
import HeroSection from '../../components/common/HeroSection';
import { aboutHeroData as aboutHeroDataBase } from './data/aboutHeroData';
import MissionVisionSection from './components/MissionVisionSection';
import EventFactsSection from './components/EventFactsSection';
import SponsorSection from './components/SponsorSection';
import PrimaryButton from '../../components/common/buttons/PrimaryButton';
import SectionHeader from '../../components/common/SectionHeader';
import FestivalDescriptionSection from './components/FestivalDescriptionSection';
import RegistrationCTA from './components/RegistrationCTA';

const About = () => {
  const tp = useTranslations("about.page");
  const aboutHeroData = { ...aboutHeroDataBase, ...useTranslations("hero").raw("about") };
  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-tertiary to-primary/5">

        {/* Hero Section */}
        <HeroSection
          title={aboutHeroData.title}
          subtitle={aboutHeroData.subtitle}
          backgroundImage={aboutHeroData.backgroundImage}
        >
          <Link to="/register">
            <PrimaryButton>
              <span className={aboutHeroData.className}>{aboutHeroData.cta}</span>
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
          </Link>
        </HeroSection>

        {/* Main Content */}
        <section className="py-20 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary opacity-5 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary opacity-5 rounded-full -ml-32 -mb-32" />

          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
            {/* Section Title */}
            <SectionHeader firstWord={tp("titleFirst")} secondWord={tp("titleSecond")} />

            {/* Festival Description Section */}
            <FestivalDescriptionSection />

            {/* Mission & Vision Section */}
            <MissionVisionSection />

            {/* Event Facts Section */}
            <EventFactsSection />

            {/* Registration CTA Section */}
            <RegistrationCTA />

            {/* Sponsor Section */}
            <SponsorSection />
          </div>
        </section>
      </div>
    </>
  );
};

export default About;
