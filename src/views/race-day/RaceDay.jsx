"use client";

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarDay,
  faLocationDot,
  faHourglassEnd,
  faBoxOpen,
  faIdCard,
  faCheck,
  faRoute,
  faPersonRunning,
  faMagnifyingGlass,
  faPhone,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from '@/lib/router';
import HeroSection from '../../components/common/HeroSection';
import SectionHeader from '../../components/common/SectionHeader';
import ScheduleSection from '../home/components/ScheduleSection';
import { fetchCollectionVenues, fetchEvents } from '../../api/dropdowns';

const Fact = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 p-5 rounded-2xl bg-tertiary border border-primary/10 shadow-sm">
    <span className="w-12 h-12 shrink-0 rounded-xl bg-primary text-secondary flex items-center justify-center text-lg">
      <FontAwesomeIcon icon={icon} />
    </span>
    <span>
      <span className="block text-xs font-bold uppercase tracking-wider text-primary/70">{label}</span>
      <span className="block font-bold text-primary">{value}</span>
    </span>
  </div>
);

const Checklist = ({ items, dark = false }) => (
  <ul className="space-y-3">
    {items.map((line) => (
      <li key={line} className="flex gap-3">
        <FontAwesomeIcon icon={faCheck} className={`mt-1 ${dark ? 'text-secondary' : 'text-primary'}`} />
        <span>{line}</span>
      </li>
    ))}
  </ul>
);

const RaceDay = () => {
  const t = useTranslations('raceDay');
  const hero = useTranslations('hero').raw('raceDay');
  const [races, setRaces] = useState([]);
  const [venues, setVenues] = useState([]);

  useEffect(() => {
    fetchEvents().then((r) => r.success && setRaces(r.data));
    fetchCollectionVenues().then((r) => r.success && setVenues(r.data));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-tertiary to-primary/5">
      <HeroSection title={hero.title} subtitle={hero.subtitle} backgroundImage="/assets/images/2026/race-start.jpg" height="min-h-[480px]" />

      {/* Key facts */}
      <section className="px-4 -mt-12 relative z-10">
        <div className="max-w-6xl mx-auto grid gap-4 md:grid-cols-3">
          <Fact icon={faCalendarDay} label={t('facts.date')} value={t('facts.dateValue')} />
          <Fact icon={faLocationDot} label={t('facts.venue')} value={t('facts.venueValue')} />
          <Fact icon={faHourglassEnd} label={t('facts.closes')} value={t('facts.closesValue')} />
        </div>
      </section>

      {/* Races */}
      <section className="py-16 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeader firstWord={t('racesFirst')} secondWord={t('racesSecond')} />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {races.map((race) => (
              <li key={race.id} className="rounded-2xl bg-primary text-tertiary p-6">
                <FontAwesomeIcon icon={faPersonRunning} className="text-secondary text-2xl" />
                <p className="mt-3 text-3xl font-extrabold">{Number(race.distance_km)} km</p>
                <p className="font-bold">{race.name}</p>
                {race.description && <p className="mt-2 text-sm text-tertiary/80">{race.description}</p>}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-primary/15 bg-tertiary p-5 text-primary">
            <FontAwesomeIcon icon={faRoute} className="mt-1 text-lg" />
            <p><span className="font-bold">{t('routesTitle')}</span> {t('routesText')}</p>
          </div>
        </div>
      </section>

      {/* Programme of the day (from the dashboard schedule) */}
      <ScheduleSection />

      {/* Kit collection */}
      <section className="py-16 md:py-20 px-4" id="kit">
        <div className="max-w-6xl mx-auto">
          <SectionHeader firstWord={t('kitFirst')} secondWord={t('kitSecond')} />
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <p className="text-primary/80 mb-5">{t('kitIntro')}</p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {venues.map((venue) => (
                  <li key={venue.id} className="flex gap-3 p-5 rounded-2xl bg-tertiary border border-primary/10 shadow-sm">
                    <FontAwesomeIcon icon={faLocationDot} className="mt-1 text-primary" />
                    <span>
                      <span className="block font-bold text-primary">{venue.name}</span>
                      {venue.address && <span className="block text-sm text-primary/75">{venue.address}</span>}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-primary/75">{t('kitDates')}</p>
            </div>
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl bg-secondary text-primary p-6">
                <h3 className="flex items-center gap-2 text-lg font-extrabold mb-3"><FontAwesomeIcon icon={faBoxOpen} /> {t('kitContentsTitle')}</h3>
                <Checklist items={t.raw('kitContents')} />
              </div>
              <div className="rounded-2xl bg-primary text-tertiary p-6">
                <h3 className="flex items-center gap-2 text-lg font-extrabold mb-3"><FontAwesomeIcon icon={faIdCard} className="text-secondary" /> {t('bringTitle')}</h3>
                <Checklist items={t.raw('bring')} dark />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* On the day */}
      <section className="pb-16 md:pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeader firstWord={t('dayFirst')} secondWord={t('daySecond')} />
          <ol className="grid gap-4 md:grid-cols-2">
            {t.raw('tips').map((tip, i) => (
              <li key={tip.title} className="flex gap-4 p-5 rounded-2xl bg-tertiary border border-primary/10 shadow-sm">
                <span className="w-9 h-9 shrink-0 rounded-full bg-secondary text-primary font-extrabold flex items-center justify-center">{i + 1}</span>
                <span>
                  <span className="block font-bold text-primary">{tip.title}</span>
                  <span className="block text-sm text-primary/80 mt-0.5">{tip.text}</span>
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-10 rounded-2xl bg-primary text-tertiary p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6 justify-between">
            <div>
              <h3 className="text-2xl font-extrabold">{t('ctaTitle')}</h3>
              <p className="mt-1 text-tertiary/80">{t('ctaText')}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link to="/registration-status" className="inline-flex items-center justify-center gap-2 min-h-12 px-5 rounded-lg bg-secondary text-primary font-bold">
                <FontAwesomeIcon icon={faMagnifyingGlass} /> {t('ctaStatus')}
              </Link>
              <a href="tel:+255755002886" className="inline-flex items-center justify-center gap-2 min-h-12 px-5 rounded-lg border border-tertiary/40 font-semibold hover:border-secondary">
                <FontAwesomeIcon icon={faPhone} /> +255 755 002 886
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RaceDay;
