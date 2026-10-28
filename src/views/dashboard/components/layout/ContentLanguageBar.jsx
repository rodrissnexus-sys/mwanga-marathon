"use client";

import React from 'react';
import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLanguage } from '@fortawesome/free-solid-svg-icons';

// Text edited in the dashboard is saved for the language in the address:
// /dashboard edits the English site, /sw/dashboard the Swahili site.
const ContentLanguageBar = () => {
  const locale = useLocale();
  const pathname = usePathname();
  const other = locale === 'sw' ? 'en' : 'sw';
  const names = { en: 'English', sw: 'Kiswahili' };

  return (
    <div className="mb-6 px-4 py-3 rounded-xl text-sm flex flex-wrap items-center gap-x-3 gap-y-2 bg-secondary/25 border border-secondary text-primary">
      <FontAwesomeIcon icon={faLanguage} className="text-lg" />
      <span className="flex-1 min-w-48">
        Editing <strong>{names[locale]}</strong> text — changes appear on the {names[locale]} site.
      </span>
      <Link href={pathname} locale={other} className="px-3 py-1.5 rounded-lg bg-primary text-tertiary font-semibold">
        Edit {names[other]} instead
      </Link>
    </div>
  );
};

export default ContentLanguageBar;
