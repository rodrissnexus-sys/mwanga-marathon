"use client";

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { EVENT } from '@/lib/event';

const UNITS = [
  ['days', 86400000],
  ['hours', 3600000],
  ['minutes', 60000],
  ['seconds', 1000],
];

// Time left until the race, split into days / hours / minutes / seconds.
const timeLeft = (now) => {
  let rest = Math.max(0, Date.parse(EVENT.startsAt) - now);
  return UNITS.map(([unit, ms]) => {
    const value = Math.floor(rest / ms);
    rest -= value * ms;
    return [unit, value];
  });
};

// Counts in the browser only (after mount), so the pre-rendered page never
// shows a stale time.
function useNow() {
  const [now, setNow] = useState(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

const Countdown = ({ compact }) => {
  const t = useTranslations('home.heroEvent');
  const tUnits = useTranslations('home.banner');
  const now = useNow();
  if (now !== null && Date.parse(EVENT.startsAt) <= now) return null; // race has started

  const parts = now === null ? UNITS.map(([unit]) => [unit, null]) : timeLeft(now);
  return (
    <div role="timer" aria-label={t('countdownLabel')} className={`flex ${compact ? 'justify-center gap-2' : 'gap-3'}`}>
      {parts.map(([unit, value]) => (
        <div
          key={unit}
          className={`glass-card rounded-lg text-center ${compact ? 'w-16 py-2' : 'w-20 py-3'}`}
        >
          <div aria-hidden="true" className={`font-bold tabular-nums text-tertiary leading-none ${compact ? 'text-2xl' : 'text-3xl'}`}>
            {value === null ? '--' : String(value).padStart(2, '0')}
          </div>
          <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-tertiary/80">
            {tUnits(unit)}
          </div>
        </div>
      ))}
    </div>
  );
};

const HeroEventTitle = () => {
  const t = useTranslations('home.heroEvent');
  const shadow = '[text-shadow:0_2px_16px_rgb(0_0_0/0.45)]';

  return (
    <>
      {/* Desktop: right side of the photo, with a fade behind it for contrast */}
      <div aria-hidden="true" className="hidden lg:block absolute inset-y-0 right-0 w-3/5 bg-gradient-to-l from-primary/80 via-primary/45 to-transparent z-[1]" />
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="hidden lg:flex absolute inset-y-0 right-32 xl:right-40 z-10 flex-col justify-center items-end text-right max-w-xl"
      >
        <p className={`text-secondary text-sm font-semibold uppercase tracking-[0.25em] mb-4 ${shadow}`}>
          {t('dateVenue')}
        </p>
        <h2 className={`text-tertiary font-extrabold uppercase leading-[0.95] tracking-tight text-6xl xl:text-7xl ${shadow}`}>
          {t('title')}
          <span className="block text-secondary">{EVENT.year}</span>
        </h2>
        <p className={`mt-4 text-tertiary/90 text-lg italic ${shadow}`}>“{t('theme')}”</p>
        <div className="mt-8">
          <Countdown />
        </div>
      </motion.div>

      {/* Tablet and phone: compact block at the top of the photo. Short screens
          (small phones, landscape) drop the countdown, then the block, so it
          never covers the card. */}
      <div aria-hidden="true" className="lg:hidden absolute inset-x-0 top-0 h-3/5 bg-gradient-to-b from-primary/85 via-primary/50 to-transparent z-[1] [@media(max-height:729px)]:hidden" />
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="lg:hidden absolute inset-x-0 top-24 md:top-32 z-10 px-4 text-center [@media(max-height:729px)]:hidden"
      >
        <p className={`text-secondary text-xs font-semibold uppercase tracking-[0.12em] md:tracking-[0.2em] mb-2 ${shadow}`}>
          {t('dateVenue')}
        </p>
        <h2 className={`text-tertiary font-extrabold uppercase leading-none tracking-tight text-4xl md:text-6xl ${shadow}`}>
          {t('title')} <span className="text-secondary">{EVENT.year}</span>
        </h2>
        <div className="mt-4 [@media(max-height:809px)]:hidden">
          <Countdown compact />
        </div>
      </motion.div>
    </>
  );
};

export default HeroEventTitle;
