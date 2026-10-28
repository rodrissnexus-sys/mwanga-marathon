"use client";

import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { Link } from '@/lib/router';
import Image from "next/image";
import HeroEventTitle from "./HeroEventTitle";
import { desktopImages, mobileImages } from "../data/heroData";

const HeroSection = () => {
  const t = useTranslations("home.hero");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Determine which image set to use based on screen size
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Check if mobile on mount and window resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Use appropriate image set based on screen size
  const imageText = useTranslations("home.heroImages");
  const withText = (list, key) =>
    list.map((image, i) => ({ ...image, ...imageText.raw(key)[i] }));
  const images = isMobile ? withText(mobileImages, "mobile") : withText(desktopImages, "desktop");

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % images.length);
        setIsTransitioning(false);
      }, 600);
    }, 6000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handleIndicatorClick = (index) => {
    if (index !== activeIndex) {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveIndex(index);
        setIsTransitioning(false);
      }, 600);
    }
  };

  return (
    <section
      id="home"
      className="relative w-full h-screen overflow-hidden bg-primary"
    >
      {/* Background gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/50 to-secondary opacity-90"></div>
      
      {/* Ambient color bleed */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-secondary opacity-5 blur-[150px]"></div>
      <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] bg-secondary opacity-5 blur-[120px]"></div>

      {/* Hero Images Container */}
      <div className="absolute inset-0">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${
              index === activeIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Animated image with Ken Burns effect */}
            <div className={`relative w-full h-full overflow-hidden ${
              index === activeIndex ? 'animate-ken-burns' : ''
            }`}>
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="100vw"
                priority={index === 0}
                className="object-cover scale-110"
              />
            </div>
            {/* Multi-layer gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/45 via-secondary/10 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-primary/40"></div>
            <div className="absolute inset-0 bg-primary/30"></div>
          </div>
        ))}
      </div>

      {/* Event title, date and countdown */}
      <HeroEventTitle />

      {/* Main Content Container */}
      <div className="relative z-10 h-full flex items-end md:items-center">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-0 lg:px-16">
          
          {/* Desktop Layout - Compact Left Card */}
          <div className="hidden lg:block">
            <div className="relative max-w-sm ml-8 group">
              {/* Glass background */}
              <div className="absolute -inset-4 glass-card rounded-xl z-0"></div>
              
              {/* Decorative corner accents - inspired by AboutSection */}
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-secondary/60 rounded-tl-lg opacity-80 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-secondary/60 rounded-tr-lg opacity-80 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-secondary/60 rounded-bl-lg opacity-80 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-secondary/60 rounded-br-lg opacity-80 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
              
              {/* Subtle decorative background circle */}
              <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full opacity-10 transition-opacity duration-300 group-hover:opacity-20 bg-gradient-to-r from-secondary to-primary blur-2xl z-0"></div>
              
              <div className="relative px-5 py-6 rounded-lg overflow-hidden z-10">
                {/* Overline */}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-secondary text-xs font-semibold tracking-[0.2em] uppercase">
                    {t("experience")}
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="sr-only">{t("slideOf", { current: activeIndex + 1, total: images.length })}</span>
                    <span aria-hidden="true" className="text-secondary text-lg font-normal">{images[activeIndex].subtitle}</span>
                    <span aria-hidden="true" className="text-tertiary/75 text-xs">/{String(images.length).padStart(2, '0')}</span>
                  </div>
                </div>

                {/* Headline */}
                <h1 className="text-tertiary text-2xl font-light leading-tight mb-3 tracking-tight">
                  Mwanga<br />
                  <span className="font-light text-tertiary/90">Festival</span><br />
                  <span className="font-bold text-secondary">& Marathon</span>
                </h1>

                {/* Current view */}
                <div className="mb-3">
                  <p className="text-tertiary/75 text-xs font-medium uppercase tracking-[0.15em] mb-0.5">{t("currentView")}</p>
                  <h2 className="text-tertiary text-base font-normal">{images[activeIndex].title}</h2>
                </div>

                {/* Description */}
                <p className="text-tertiary/90 text-sm leading-relaxed mb-4">
                  {t("tagline")}
                </p>

                {/* Divider */}
                <div className="w-10 h-[0.5px] bg-gradient-to-r from-secondary to-transparent mb-4"></div>

                {/* CTA Buttons */}
                <div className="flex flex-col gap-2">
                  <Link to="/register" className="min-h-11 flex items-center justify-center px-5 py-3 bg-secondary text-black font-bold text-xs uppercase tracking-wider text-center transition-all duration-300 hover:bg-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary">
                    {t("registerNow")}
                  </Link>
                  <Link to="/about" className="min-h-11 flex items-center justify-center px-5 py-3 text-tertiary font-semibold text-xs uppercase tracking-wider border border-tertiary/45 bg-primary/85 text-center transition-all duration-300 hover:border-secondary hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary">
                    {t("aboutMwafem")}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Tablet Layout - Left Aligned Compact Card */}
          <div className="hidden md:block lg:hidden">
            <div className="relative max-w-xs ml-4 group">
              {/* Glass background */}
              <div className="absolute -inset-4 glass-card rounded-xl z-0"></div>
              
              {/* Decorative corner accents */}
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-secondary/60 rounded-tl-lg opacity-80 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-secondary/60 rounded-tr-lg opacity-80 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
              <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-secondary/60 rounded-bl-lg opacity-80 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-secondary/60 rounded-tr-lg opacity-80 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
              
              {/* Subtle decorative background circle */}
              <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full opacity-10 transition-opacity duration-300 group-hover:opacity-20 bg-gradient-to-r from-secondary to-primary blur-2xl z-0"></div>
              
              <div className="relative px-4 py-5 rounded-lg overflow-hidden z-10">
                {/* Overline */}
                <div className="flex items-center justify-between mb-2">
                  <p className="text-secondary text-xs font-semibold tracking-[0.2em] uppercase">
                    {t("experience")}
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="sr-only">{t("slideOf", { current: activeIndex + 1, total: images.length })}</span>
                    <span aria-hidden="true" className="text-secondary text-sm font-normal">{images[activeIndex].subtitle}</span>
                    <span aria-hidden="true" className="text-tertiary/75 text-xs">/{String(images.length).padStart(2, '0')}</span>
                  </div>
                </div>

                {/* Headline */}
                <h1 className="text-tertiary text-xl font-light leading-tight mb-2 tracking-tight">
                  Mwanga<br />
                  <span className="font-light text-tertiary/90">Festival</span><br />
                  <span className="font-bold text-secondary">& Marathon</span>
                </h1>

                {/* Current view */}
                <div className="mb-2">
                  <p className="text-tertiary/75 text-xs font-medium uppercase tracking-[0.15em] mb-0.5">{t("currentView")}</p>
                  <h2 className="text-tertiary text-base font-normal">{images[activeIndex].title}</h2>
                </div>

                {/* Description */}
                <p className="text-tertiary/90 text-sm leading-relaxed mb-3">
                  {t("tagline")}
                </p>

                {/* Divider */}
                <div className="w-8 h-[0.5px] bg-gradient-to-r from-secondary to-transparent mb-3"></div>

                {/* CTA Buttons */}
                <div className="flex flex-col gap-2">
                  <Link to="/register" className="min-h-11 flex items-center justify-center px-5 py-3 bg-secondary text-black font-bold text-xs uppercase tracking-wider text-center transition-all duration-300 hover:bg-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary">
                    {t("registerNow")}
                  </Link>
                  <Link to="/about" className="min-h-11 flex items-center justify-center px-5 py-3 text-tertiary font-semibold text-xs uppercase tracking-wider border border-tertiary/45 bg-primary/85 text-center transition-all duration-300 hover:border-secondary hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary">
                    {t("aboutMwafem")}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Layout - Bottom Compact Card */}
          <div className="md:hidden w-full pb-16">
            <div className="relative max-w-xs mx-auto group">
              {/* Glass background */}
              <div className="absolute -inset-4 glass-card rounded-xl z-0"></div>
              
              {/* Decorative corner accents */}
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-secondary/70 rounded-tl-lg opacity-90 z-10"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-secondary/70 rounded-tr-lg opacity-90 z-10"></div>
              <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-secondary/70 rounded-bl-lg opacity-90 z-10"></div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-secondary/70 rounded-br-lg opacity-90 z-10"></div>
              
              {/* Subtle decorative background circle */}
              <div className="absolute -right-6 -bottom-6 w-16 h-16 rounded-full opacity-10 bg-gradient-to-r from-secondary to-primary blur-xl z-0"></div>
              
              <div className="relative px-4 py-5 rounded-lg overflow-hidden z-10">
                {/* Overline */}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-secondary text-xs font-semibold tracking-[0.2em] uppercase">
                    {t("experience")}
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="sr-only">{t("slideOf", { current: activeIndex + 1, total: images.length })}</span>
                    <span aria-hidden="true" className="text-secondary text-base font-normal">{images[activeIndex].subtitle}</span>
                    <span aria-hidden="true" className="text-tertiary/75 text-xs">/{String(images.length).padStart(2, '0')}</span>
                  </div>
                </div>

                {/* Headline */}
                <h1 className="text-tertiary text-xl font-light leading-tight mb-2 tracking-tight">
                  Mwanga<br />
                  <span className="font-light text-tertiary/90">Festival</span><br />
                  <span className="font-bold text-secondary">& Marathon</span>
                </h1>

                {/* Current view */}
                <div className="mb-2">
                  <p className="text-tertiary/75 text-xs font-medium uppercase tracking-[0.15em] mb-0.5">{t("currentView")}</p>
                  <h2 className="text-tertiary text-base font-normal">{images[activeIndex].title}</h2>
                </div>

                {/* Description */}
                <p className="text-tertiary/90 text-sm leading-relaxed mb-3">
                  {t("tagline")}
                </p>

                {/* Divider */}
                <div className="w-8 h-[0.5px] bg-gradient-to-r from-secondary to-transparent mb-3"></div>

                {/* CTA Buttons */}
                <div className="flex flex-col gap-1.5">
                  <Link to="/register" className="min-h-11 flex items-center justify-center px-5 py-3 bg-secondary text-black font-bold text-xs uppercase tracking-wider text-center transition-all duration-300 hover:bg-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary">
                    {t("registerNow")}
                  </Link>
                  <Link to="/about" className="min-h-11 flex items-center justify-center px-5 py-3 text-tertiary font-semibold text-xs uppercase tracking-wider border border-tertiary/45 bg-primary/85 text-center transition-all duration-300 hover:border-secondary hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary">
                    {t("aboutMwafem")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Elegant Side Navigation - Right Side */}
      <div className="hidden md:block absolute right-6 lg:right-12 top-1/2 transform -translate-y-1/2 z-20">
        <div className="relative">
          {/* Glass background container */}
          <div className="absolute -inset-3 glass-card glass-card--light rounded-full"></div>
          
          {/* Navigation buttons */}
          <div className="relative flex flex-col items-center gap-3 py-4 px-2">
            {/* Previous button */}
            <button
              onClick={() => handleIndicatorClick((activeIndex - 1 + images.length) % images.length)}
              className="group relative w-10 h-10 rounded-full border border-secondary/30 hover:border-secondary/60 transition-all duration-300 flex items-center justify-center hover:bg-secondary/10"
              aria-label={t("previousImage")}
            >
              <svg className="w-4 h-4 text-secondary transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Divider line */}
            <div className="w-[1px] h-8 bg-gradient-to-b from-transparent via-secondary/30 to-transparent"></div>

            {/* Image indicators */}
            <div className="flex flex-col items-center gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleIndicatorClick(index)}
                  className="group relative"
                  aria-label={t("goToImage", { number: index + 1 })}
                >
                  <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    index === activeIndex
                      ? 'bg-secondary shadow-lg shadow-secondary/50 scale-125'
                      : 'bg-tertiary/30 hover:bg-tertiary/50 hover:scale-110'
                  }`}></div>
                  
                  {/* Tooltip on hover */}
                  <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="bg-primary/90 backdrop-blur-sm px-3 py-1 rounded text-tertiary text-xs whitespace-nowrap border border-secondary/20">
                      {images[index].title}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Divider line */}
            <div className="w-[1px] h-8 bg-gradient-to-b from-transparent via-secondary/30 to-transparent"></div>

            {/* Next button */}
            <button
              onClick={() => handleIndicatorClick((activeIndex + 1) % images.length)}
              className="group relative w-10 h-10 rounded-full border border-secondary/30 hover:border-secondary/60 transition-all duration-300 flex items-center justify-center hover:bg-secondary/10"
              aria-label={t("nextImage")}
            >
              <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Minimalist Indicators - Bottom Center (Mobile Only) */}
      <div className="md:hidden absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center gap-4">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => handleIndicatorClick(index)}
              className="group relative"
            >
              <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
                index === activeIndex
                  ? 'bg-secondary shadow-lg shadow-secondary/50'
                  : 'bg-tertiary/20 hover:bg-tertiary/40'
              }`}></div>
              {index === activeIndex && (
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-secondary animate-ping opacity-30"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Minimal corner accents */}
      <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-tertiary/5"></div>
      <div className="absolute top-0 right-0 w-20 h-20 border-t border-r border-tertiary/5"></div>
      <div className="absolute bottom-0 left-0 w-20 h-20 border-b border-l border-tertiary/5"></div>
      <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-tertiary/5"></div>
    </section>
  );
};

export default HeroSection;