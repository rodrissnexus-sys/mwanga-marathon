"use client";

import React, { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass,
  faCircleCheck,
  faClock,
  faCircleXmark,
  faSpinner,
  faPhone,
  faCircleInfo,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from '@/lib/router';
import HeroSection from '../../components/common/HeroSection';
import { lookupRegistration } from '@/server/registration-status';
import { formatMoney } from '@/lib/payments';

const STATUS = {
  pending: { icon: faClock, tone: 'text-caution' },
  confirmed: { icon: faCircleCheck, tone: 'text-positive' },
  failed: { icon: faCircleXmark, tone: 'text-negative' },
};

const inputClass = 'w-full min-h-12 px-4 rounded-lg border border-primary/25 bg-tertiary text-primary placeholder:text-primary/50 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-primary';

const RegistrationStatus = () => {
  const t = useTranslations('registrationStatus');
  const tc = useTranslations('home.form.categories');
  const hero = useTranslations('hero').raw('registrationStatus');
  const locale = useLocale();
  const [values, setValues] = useState({ registrationId: '', phone: '' });
  const [state, setState] = useState({ status: 'idle' }); // idle | loading | found | error

  // /registration-status?id=MWF-2026-00042 (link from the registration confirmation)
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (id) setValues((v) => ({ ...v, registrationId: id }));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setState({ status: 'loading' });
    const result = await lookupRegistration(values).catch(() => ({ success: false, error: 'notFound' }));
    setState(result.success ? { status: 'found', data: result.data } : { status: 'error', error: result.error });
  };

  const r = state.data;
  const date = (value) =>
    new Date(value).toLocaleDateString(locale === 'sw' ? 'sw-TZ' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Dar_es_Salaam' });

  return (
    <div className="min-h-screen bg-gradient-to-b from-tertiary to-primary/5">
      <HeroSection title={hero.title} subtitle={hero.subtitle} backgroundImage="/assets/images/2026/finish-line-arrivals.jpg" height="min-h-[420px]" />

      <section className="py-16 md:py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={submit} className="rounded-2xl bg-tertiary border border-primary/10 shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-extrabold text-primary">{t('formTitle')}</h2>
            <p className="mt-1 text-primary/75">{t('formText')}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="status-id" className="block text-sm font-semibold text-primary mb-1">{t('idLabel')}</label>
                <input
                  id="status-id"
                  required
                  autoComplete="off"
                  value={values.registrationId}
                  onChange={(e) => setValues((v) => ({ ...v, registrationId: e.target.value }))}
                  placeholder="MWF-2026-00042"
                  className={`${inputClass} font-mono uppercase`}
                />
              </div>
              <div>
                <label htmlFor="status-phone" className="block text-sm font-semibold text-primary mb-1">{t('phoneLabel')}</label>
                <input
                  id="status-phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  value={values.phone}
                  onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
                  placeholder="07XX XXX XXX"
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={state.status === 'loading'}
              className="mt-6 w-full min-h-12 rounded-lg bg-primary text-tertiary font-bold inline-flex items-center justify-center gap-2 hover:bg-primary/90 cursor-pointer disabled:opacity-70"
            >
              <FontAwesomeIcon icon={state.status === 'loading' ? faSpinner : faMagnifyingGlass} spin={state.status === 'loading'} />
              {t('check')}
            </button>

            {state.status === 'error' && (
              <p role="alert" className="mt-4 flex gap-3 rounded-lg border border-negative/30 bg-negative/10 text-negative px-4 py-3 text-sm font-medium">
                <FontAwesomeIcon icon={faCircleInfo} className="mt-0.5" />
                {t(`errors.${state.error}`)}
              </p>
            )}
          </form>

          {state.status === 'found' && (
            <article role="status" className="mt-8 rounded-2xl bg-tertiary border border-primary/10 shadow-lg overflow-hidden">
              <header className="bg-primary text-tertiary px-6 py-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-tertiary/80">{t('hello', { name: r.firstName })}</p>
                  <p className="font-mono text-xl font-extrabold tracking-wide">{r.registrationId}</p>
                </div>
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-sm bg-tertiary ${STATUS[r.status].tone}`}>
                  <FontAwesomeIcon icon={STATUS[r.status].icon} />
                  {t(`status.${r.status}`)}
                </span>
              </header>

              <div className="p-6">
                <p className="text-primary">{t(`explain.${r.status}`)}</p>

                <dl className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                  {[
                    [t('race'), r.race[locale] || r.race.en],
                    r.participantCategory && [t('type'), tc(r.participantCategory)],
                    r.fee && [r.status === 'confirmed' ? t('fee') : t('toPay'), formatMoney(r.fee.amount, r.fee.currency)],
                    [t('registered'), date(r.registeredAt)],
                    r.confirmedAt && [t('confirmed'), date(r.confirmedAt)],
                    r.collectionVenue && [t('kit'), r.collectionVenue[locale] || r.collectionVenue.en],
                  ].filter(Boolean).map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs font-bold uppercase tracking-wide text-primary/70">{label}</dt>
                      <dd className="mt-0.5 font-semibold text-primary">{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  {r.status !== 'confirmed' && (
                    <Link to="/register#payment" className="inline-flex items-center justify-center min-h-12 px-5 rounded-lg bg-secondary text-primary font-bold">
                      {t('howToPay')}
                    </Link>
                  )}
                  {r.status === 'confirmed' && (
                    <Link to="/race-day" className="inline-flex items-center justify-center min-h-12 px-5 rounded-lg bg-secondary text-primary font-bold">
                      {t('raceDayGuide')}
                    </Link>
                  )}
                  <a href="tel:+255755002886" className="inline-flex items-center justify-center gap-2 min-h-12 px-5 rounded-lg border border-primary/25 text-primary font-semibold hover:bg-primary/5">
                    <FontAwesomeIcon icon={faPhone} />
                    {t('callUs')}
                  </a>
                </div>
              </div>
            </article>
          )}
        </div>
      </section>
    </div>
  );
};

export default RegistrationStatus;
