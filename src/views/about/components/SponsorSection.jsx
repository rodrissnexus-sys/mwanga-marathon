"use client";

import { useTranslations } from "next-intl";
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/lib/router';
import SectionHeader from '../../../components/common/SectionHeader';
import PrimaryButton from '../../../components/common/buttons/PrimaryButton';

const SponsorSection = () => {
  const t = useTranslations("about.sponsors");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  
  const sponsorLogos = [
    { id: 1, name: 'Parrot Hotel', logo: '/assets/sponsors/Parrot_hotel_logo.webp' },
    { id: 2, name: 'Osaka Classic', logo: '/assets/sponsors/osaka_classic_logo.png' },
    { id: 3, name: 'Wasafi Media', logo: '/assets/sponsors/wasafi_media_logo.png' },
    { id: 4, name: 'Coca-Cola', logo: '/assets/sponsors/Coca_cola_logo.png' },
    { id: 5, name: 'Al Bayanu ECO Ltd', logo: '/assets/sponsors/Al_Bayanu_ECO_Ltd.png' },
    { id: 6, name: 'Dongodo Panorama Park', logo: '/assets/sponsors/Dongodo_Panorama_Park.png' },
    { id: 7, name: 'Kilimanjaro Light', logo: '/assets/sponsors/Kilimanjaro_Light.png' },
    { id: 8, name: 'Kilimanjaro Premium Lager', logo: '/assets/sponsors/Kilimanjaro_Premium_Lager.png' },
    { id: 9, name: 'Kisangara Tours Ltd', logo: '/assets/sponsors/Kisangara_Tours_Ltd.png' },
    { id: 10, name: 'Taasisi ya Ustawi wa Jamii', logo: '/assets/sponsors/Taasisi_ya_Ustawi_wa_Jamii.png' },
    { id: 11, name: 'Tanzania Forest Agency', logo: '/assets/sponsors/Tanzania_forest_agency.png' },
    { id: 12, name: 'Nangai Engineering and Contractor', logo: '/assets/sponsors/nangai_engineering_and_contractor.png' },
    { id: 13, name: 'Roadpuma (RCL)', logo: '/assets/sponsors/Roadpuma(RCL).png' },
    { id: 14, name: 'Yas Tanzania', logo: '/assets/sponsors/Yas_Tanzania.png' },
    { id: 15, name: 'Kiwamwaku Foundation', logo: '/assets/sponsors/kiwamwaku_foundation.png' },
    { id: 16, name: 'Neloyt', logo: '/assets/sponsors/neloyt.png' },
    { id: 17, name: 'Nasy Point', logo: '/assets/sponsors/nasy_point.png' },
    { id: 18, name: 'Tesha\'s Investment', logo: '/assets/sponsors/Tesha_s_investment_logo.png' },
    { id: 19, name: 'Kapricon', logo: '/assets/sponsors/kapricon_logo.webp' },
    { id: 20, name: 'Safi Medics Hospital', logo: '/assets/sponsors/safi_medics_hospital.png' },
    { id: 21, name: 'nayma Tours safari', logo: '/assets/sponsors/nayma_tours_&_safari.jpg' },
  ];

  // Function to navigate through sponsors
  const nextSponsor = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % sponsorLogos.length);
  };

  const prevSponsor = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + sponsorLogos.length) % sponsorLogos.length);
  };

  // Auto-rotation effect
  useEffect(() => {
    // Clear any existing interval when component mounts or dependencies change
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Only set up interval if not paused
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        nextSponsor();
      }, 5000); // Change sponsor every 5 seconds
    }
    
    // Cleanup function to clear interval when component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, activeIndex]); // Re-run effect when isPaused or activeIndex changes

  // Calculate indices for the visible sponsors in the carousel
  const getVisibleSponsors = () => {
    const visibleIndices = [];
    const totalSponsors = sponsorLogos.length;
    
    for (let i = 0; i < 5; i++) {
      visibleIndices.push((activeIndex + i) % totalSponsors);
    }
    
    return visibleIndices;
  };

  const visibleIndices = getVisibleSponsors();

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <SectionHeader firstWord={t("titleFirst")} secondWord={t("titleSecond")} />
          <p className="mt-4 max-w-2xl mx-auto text-text-primary/80">
            {t("weAreProudTo")}
          </p>
        </div>
        {/* Sponsor Wall */}
        <div className="mb-20">
          <h3 className="text-xl font-semibold text-center mb-10 text-text-primary">{t("allOurAmazingPartners")}</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
            {sponsorLogos.map((sponsor) => (
              <motion.div
                key={sponsor.id}
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                className="bg-tertiary rounded-lg p-4 shadow-md flex items-center justify-center h-24 transition-all duration-300"
              >
                <img 
                  src={sponsor.logo} 
                  alt={sponsor.name} 
                  className="max-h-full max-w-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300" 
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Featured Sponsor Showcase */}
        <div className="mb-20">
          <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6">
            {/* Main featured sponsor */}
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-tertiary rounded-2xl shadow-lg overflow-hidden"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-10 flex items-center justify-center bg-primary/[0.03]">
                  <img 
                    src={sponsorLogos[activeIndex].logo} 
                    alt={sponsorLogos[activeIndex].name}
                    className="max-w-full max-h-32 sm:max-h-40 md:max-h-48 object-contain" 
                  />
                </div>
                <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col justify-center">
                  <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-3 sm:mb-4">
                    {sponsorLogos[activeIndex].name}
                  </h3>
                  <p className="text-sm sm:text-base text-text-primary/70 mb-4 sm:mb-6">
                    {t("proudSponsorOfMwafem")}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base bg-primary text-tertiary rounded-lg hover:bg-primary/90 transition-colors">
                      {t("learnMore")}
                    </button>
                    <button className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base border-2 border-secondary rounded-lg hover:bg-primary/[0.03] transition-colors">
                      {t("visitWebsite")}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Navigation arrows - hidden on very small screens, visible from small screens up */}
            <button 
              onClick={prevSponsor}
              className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 sm:-translate-x-3 md:-translate-x-6 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-tertiary shadow-lg items-center justify-center hover:bg-primary/[0.03] transition-colors z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={nextSponsor}
              className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 sm:translate-x-3 md:translate-x-6 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-tertiary shadow-lg items-center justify-center hover:bg-primary/[0.03] transition-colors z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          {/* Sponsor indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {sponsorLogos.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === activeIndex ? 'bg-primary' : 'bg-primary/30'
                }`}
                aria-label={t('goToSponsor', { number: index + 1 })}
              />
            ))}
          </div>
        </div>
        {/* Sponsor Carousel for Mobile */}
        <div className="md:hidden mb-16">
          <div className="relative overflow-hidden">
            <div className="flex space-x-4 overflow-x-auto pb-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {sponsorLogos.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className="flex-shrink-0 w-48 bg-tertiary rounded-lg shadow-md p-4 flex flex-col items-center"
                >
                  <div className="h-20 flex items-center justify-center mb-3">
                    <img 
                      src={sponsor.logo} 
                      alt={sponsor.name} 
                      className="max-h-full max-w-full object-contain" 
                    />
                  </div>
                  <p className="text-sm font-medium text-center">{sponsor.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Become a Sponsor */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary opacity-5 rounded-2xl"></div>
          <div className="relative bg-tertiary rounded-2xl p-8 md:p-12 shadow-sm border border-primary/15">
            <div className="flex flex-col md:flex-row items-center">
              <div className="w-full md:w-2/3 text-center md:text-left mb-8 md:mb-0">
                <h3 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">{t("becomeASponsor")}</h3>
                <p className="text-text-primary/70 max-w-xl">
                  {t("joinOurGrowingFamily")}
                </p>
              </div>
              <div className="w-full md:w-1/3 flex justify-center md:justify-end">
                <Link to="/sponsors">
                  <PrimaryButton className="text-lg px-8 py-4">
                    {t("partnerWithUs")}
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
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SponsorSection;
