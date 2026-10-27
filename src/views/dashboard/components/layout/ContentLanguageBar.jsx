"use client";

import React from 'react';
import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { useTheme } from '../../contexts/ThemeContext';

// Text edited in the dashboard is saved for the language in the address:
// /dashboard edits the English site, /sw/dashboard the Swahili site.
const ContentLanguageBar = () => {
  const locale = useLocale();
  const pathname = usePathname();
  const { theme } = useTheme();
  const other = locale === 'sw' ? 'en' : 'sw';
  const names = { en: 'English', sw: 'Kiswahili' };

  return (
    <div className={`mb-4 px-4 py-2 rounded-md text-sm flex flex-wrap items-center gap-x-3 gap-y-1 border border-secondary/60 ${theme === 'dark' ? 'bg-primary/60 text-tertiary' : 'bg-secondary/20 text-primary'}`}>
      <span>
        Editing <strong>{names[locale]}</strong> content — changes to text appear on the {names[locale]} site.
      </span>
      <Link href={pathname} locale={other} className="underline font-medium">
        Switch to {names[other]}
      </Link>
    </div>
  );
};

export default ContentLanguageBar;
