"use client";

import { useTranslations } from "next-intl";
import React from 'react';
import { Link } from '@/lib/router';
import HeroSection from '../../components/common/HeroSection';
import { registerHeroData as registerHeroDataBase } from './data/registerHeroData';
import RegistrationSection from "../home/components/RegistrationSection";
import PaymentInformation from "./components/PaymentInformation";
import PrimaryButton from '../../components/common/buttons/PrimaryButton';
import SectionHeader from '../../components/common/SectionHeader';

const RegistrationPage = () => {
  const registerHeroData = { ...registerHeroDataBase, ...useTranslations("hero").raw("register") };
  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-tertiary to-primary/5">

        {/* Hero Section */}
        <HeroSection
          title={registerHeroData.title}
          subtitle={registerHeroData.subtitle}
          backgroundImage={registerHeroData.backgroundImage}
        >
          <a href="#register">
            <PrimaryButton>
              <span className={registerHeroData.className}>{registerHeroData.cta}</span>
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
        <section className="py-12 md:py-20 relative overflow-hidden" id="register-page">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary opacity-5 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary opacity-5 rounded-full -ml-32 -mb-32" />

          <div className="mx-auto px-4 md:px-8 relative z-10">

            {/* Registration Form Section */}
            {/* edge to edge on phones, a rounded panel on larger screens */}
            <div className="mt-4 md:mt-12 -mx-4 md:mx-0 md:rounded-3xl overflow-hidden">
              <RegistrationSection />
            </div>

            {/* Payment Information Section */}
            <div className="mt-16">
              <PaymentInformation />
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default RegistrationPage;
