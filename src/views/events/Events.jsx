"use client";

import { useTranslations } from "next-intl";
import React from 'react';
import { Link } from '@/lib/router';
import HeroSection from '../../components/common/HeroSection';
import { eventsHeroData as eventsHeroDataBase } from './data/eventsHeroData';
import SectionHeader from '../../components/common/SectionHeader';
import PrimaryButton from '../../components/common/buttons/PrimaryButton';
import EventTypes from '../home/components/EventType';
import ScheduleSection from '../home/components/ScheduleSection';
import EventOverview from './components/EventOverview';
import EventGallery from './components/EventGallery';
import RegistrationCTA from '../about/components/RegistrationCTA';

const Events = () => {
  const t = useTranslations("events.page");
  const eventsHeroData = { ...eventsHeroDataBase, ...useTranslations("hero").raw("events") };
  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-tertiary to-primary/5">

        {/* Hero Section */}
        <HeroSection
          title={eventsHeroData.title}
          subtitle={eventsHeroData.subtitle}
          backgroundImage={eventsHeroData.backgroundImage}
        >
          <Link to="/register">
            <PrimaryButton>
              <span className={eventsHeroData.className}>{eventsHeroData.cta}</span>
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
            <SectionHeader firstWord={t("titleFirst")} secondWord={t("titleSecond")} />

            {/* Event Overview Section */}
            <EventOverview />

            {/* Event Types Section - Reused from Home Page */}
            <div className="mt-20">
              <EventTypes />
            </div>

            {/* Schedule Section - Reused from Home Page */}
            <div className="mt-10">
              <ScheduleSection />
            </div>

            {/* Event Gallery Section */}
            <div className="mt-20">
              <EventGallery />
            </div>

            {/* Registration CTA Section - Reused from About Page */}
            <div className="mt-20">
              <RegistrationCTA />
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Events;
