"use client";

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlane, faBus, faCar, faBed, faPhone, faEnvelope, faMountain, faWater, faFeather, faDrum, faBowlFood } from '@fortawesome/free-solid-svg-icons';
import { Link } from '@/lib/router';
import HeroSection from '../../components/common/HeroSection';
import SectionHeader from '../../components/common/SectionHeader';

const TRAVEL_ICONS = [faPlane, faBus, faCar];
// attractions in the order of visit.explore.items, each with a photo or an icon
const EXPLORE = [
  { icon: faMountain, image: '/assets/images/2026/runner-mountain-road.jpg' },
  { icon: faWater },
  { icon: faFeather },
  { icon: faDrum, image: '/assets/images/2026/traditional-dancers.jpg' },
  { icon: faBowlFood, image: '/assets/images/2026/traditional-food.jpg' },
];

const Visit = () => {
  const t = useTranslations('visit');
  const hero = useTranslations('hero').raw('visit');

  return (
    <div className="min-h-screen bg-gradient-to-b from-tertiary to-primary/5">
      <HeroSection title={hero.title} subtitle={hero.subtitle} backgroundImage="/assets/images/2026/runner-scenic-road.jpg" height="min-h-[480px]" />

      {/* Intro */}
      <section className="py-16 md:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xl md:text-2xl font-bold text-primary leading-snug">{t('intro')}</p>
          <p className="mt-4 text-primary/80">{t('introText')}</p>
        </div>
      </section>

      {/* Getting there */}
      <section className="pb-16 md:pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeader firstWord={t('travelFirst')} secondWord={t('travelSecond')} />
          <ul className="grid gap-4 md:grid-cols-3">
            {t.raw('travel').map((item, i) => (
              <li key={item.title} className="rounded-2xl bg-tertiary border border-primary/10 shadow-sm p-6">
                <span className="w-12 h-12 rounded-xl bg-primary text-secondary flex items-center justify-center text-lg">
                  <FontAwesomeIcon icon={TRAVEL_ICONS[i]} />
                </span>
                <h3 className="mt-4 text-lg font-bold text-primary">{item.title}</h3>
                <p className="mt-1 text-primary/80">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Explore Mwanga */}
      <section className="py-16 md:py-20 px-4 bg-primary">
        <div className="max-w-6xl mx-auto">
          <SectionHeader firstWord={t('exploreFirst')} secondWord={t('exploreSecond')} tone="dark" />
          <p className="text-center text-tertiary/85 max-w-3xl mx-auto -mt-8 mb-10">{t('exploreText')}</p>
          {/* flex so an incomplete last row is centred */}
          <ul className="flex flex-wrap justify-center gap-5">
            {t.raw('explore').map((item, i) => (
              <li key={item.title} className="w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.834rem)] rounded-2xl overflow-hidden bg-tertiary/5 border border-tertiary/15 flex flex-col">
                {EXPLORE[i]?.image ? (
                  <div className="relative h-44">
                    <Image src={EXPLORE[i].image} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                  </div>
                ) : (
                  <div className="h-44 flex items-center justify-center bg-gradient-to-br from-tertiary/10 to-secondary/20">
                    <FontAwesomeIcon icon={EXPLORE[i]?.icon} className="text-5xl text-secondary" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-tertiary">{item.title}</h3>
                  <p className="mt-1 text-sm text-tertiary/85">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Where to stay */}
      <section className="py-16 md:py-20 px-4">
        <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-2 items-center">
          <div>
            <SectionHeader firstWord={t('stayFirst')} secondWord={t('staySecond')} />
            <ul className="space-y-4">
              {t.raw('stay').map((item) => (
                <li key={item.title} className="flex gap-4">
                  <span className="w-10 h-10 shrink-0 rounded-full bg-secondary text-primary flex items-center justify-center">
                    <FontAwesomeIcon icon={faBed} />
                  </span>
                  <span>
                    <span className="block font-bold text-primary">{item.title}</span>
                    <span className="block text-primary/80">{item.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-secondary text-primary p-6 md:p-8">
            <h3 className="text-2xl font-extrabold">{t('helpTitle')}</h3>
            <p className="mt-2">{t('helpText')}</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a href="tel:+255755002886" className="inline-flex items-center justify-center gap-2 min-h-12 px-5 rounded-lg bg-primary text-tertiary font-bold">
                <FontAwesomeIcon icon={faPhone} /> +255 755 002 886
              </a>
              <Link to="/contact" className="inline-flex items-center justify-center gap-2 min-h-12 px-5 rounded-lg border-2 border-primary font-bold">
                <FontAwesomeIcon icon={faEnvelope} /> {t('helpContact')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Slogan + register */}
      <section className="pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center rounded-2xl bg-primary text-tertiary p-8 md:p-12">
          <p lang="sw" className="text-xl md:text-2xl font-extrabold leading-snug">{t('slogan')}</p>
          {t('sloganTranslation') && <p className="mt-2 text-tertiary/80 italic">{t('sloganTranslation')}</p>}
          <Link to="/register" className="mt-8 inline-flex items-center justify-center min-h-12 px-8 rounded-lg bg-secondary text-primary font-bold">
            {t('register')}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Visit;
