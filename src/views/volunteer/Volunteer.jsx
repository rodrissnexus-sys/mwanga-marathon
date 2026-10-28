"use client";

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFlagCheckered,
  faClipboardCheck,
  faDrum,
  faSeedling,
  faCamera,
  faHandsHelping,
  faCircleCheck,
  faSpinner,
  faUsers,
  faStar,
  faBriefcase,
} from '@fortawesome/free-solid-svg-icons';
import HeroSection from '../../components/common/HeroSection';
import SectionHeader from '../../components/common/SectionHeader';
import { submitContactMessage } from '@/server/messages';
import { VOLUNTEER_AREAS } from '@/lib/validation';

const AREA_ICONS = { race: faFlagCheckered, registration: faClipboardCheck, festival: faDrum, community: faSeedling, media: faCamera, any: faHandsHelping };
const WHY_ICONS = [faStar, faUsers, faBriefcase];

const inputClass = 'w-full min-h-12 px-4 rounded-lg border border-primary/25 bg-tertiary text-primary placeholder:text-primary/50 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-primary';

const Volunteer = () => {
  const t = useTranslations('volunteer');
  const hero = useTranslations('hero').raw('volunteer');
  const locale = useLocale();
  const [values, setValues] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState('idle'); // idle | sending | done | error
  const [serverError, setServerError] = useState('');
  const set = (name) => (e) => {
    setValues((v) => ({ ...v, [name]: e.target.value }));
    setErrors((er) => ({ ...er, [name]: '' }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!values.name.trim()) found.name = t('form.required');
    if (!/\S+@\S+\.\S+/.test(values.email)) found.email = t('form.invalidEmail');
    if (values.phone.replace(/\D/g, '').length < 6) found.phone = t('form.invalidPhone');
    if (!values.subject) found.subject = t('form.chooseArea');
    setErrors(found);
    if (Object.keys(found).length) return;

    setState('sending');
    const result = await submitContactMessage({ kind: 'volunteer', ...values }, locale).catch(() => ({ success: false }));
    if (result.success) setState('done');
    else {
      setState('error');
      setServerError(result.error || t('form.failed'));
    }
  };

  const field = (name, label, props = {}) => (
    <div>
      <label htmlFor={`vol-${name}`} className="block text-sm font-semibold text-primary mb-1">{label}</label>
      <input id={`vol-${name}`} value={values[name]} onChange={set(name)} aria-invalid={errors[name] ? true : undefined} className={inputClass} {...props} />
      {errors[name] && <p className="mt-1 text-sm font-medium text-negative">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-tertiary to-primary/5">
      <HeroSection title={hero.title} subtitle={hero.subtitle} backgroundImage="/assets/images/2026/walking-group.jpg" height="min-h-[460px]" />

      <section className="py-16 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeader firstWord={t('whyFirst')} secondWord={t('whySecond')} />
          <ul className="grid gap-4 md:grid-cols-3">
            {t.raw('why').map((item, i) => (
              <li key={item.title} className="rounded-2xl bg-tertiary border border-primary/10 shadow-sm p-6">
                <span className="w-11 h-11 rounded-xl bg-secondary text-primary flex items-center justify-center">
                  <FontAwesomeIcon icon={WHY_ICONS[i]} />
                </span>
                <h3 className="mt-4 font-bold text-primary text-lg">{item.title}</h3>
                <p className="mt-1 text-primary/80">{item.text}</p>
              </li>
            ))}
          </ul>

          <div className="mt-16 grid gap-8 lg:grid-cols-5 items-start">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-extrabold text-primary">{t('areasTitle')}</h2>
              <p className="mt-1 text-primary/75">{t('areasText')}</p>
              <ul className="mt-6 space-y-3">
                {VOLUNTEER_AREAS.filter((a) => a !== 'any').map((area) => (
                  <li key={area} className="flex gap-3">
                    <span className="w-9 h-9 shrink-0 rounded-lg bg-primary text-secondary flex items-center justify-center">
                      <FontAwesomeIcon icon={AREA_ICONS[area]} />
                    </span>
                    <span>
                      <span className="block font-semibold text-primary">{t(`areas.${area}.title`)}</span>
                      <span className="block text-sm text-primary/75">{t(`areas.${area}.text`)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-3 rounded-2xl bg-tertiary border border-primary/10 shadow-lg p-6 md:p-8" id="volunteer-form">
              {state === 'done' ? (
                <div role="status" className="text-center py-8">
                  <FontAwesomeIcon icon={faCircleCheck} className="text-5xl text-positive" />
                  <h2 className="mt-4 text-2xl font-extrabold text-primary">{t('form.thanksTitle')}</h2>
                  <p className="mt-2 text-primary/80 max-w-md mx-auto">{t('form.thanksText')}</p>
                </div>
              ) : (
                <form onSubmit={submit} noValidate className="space-y-4">
                  <h2 className="text-2xl font-extrabold text-primary">{t('form.title')}</h2>
                  {field('name', t('form.name'), { autoComplete: 'name' })}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {field('phone', t('form.phone'), { type: 'tel', autoComplete: 'tel', placeholder: '07XX XXX XXX' })}
                    {field('email', t('form.email'), { type: 'email', autoComplete: 'email' })}
                  </div>
                  <fieldset>
                    <legend className="block text-sm font-semibold text-primary mb-2">{t('form.area')}</legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {VOLUNTEER_AREAS.map((area) => (
                        <label
                          key={area}
                          className={`flex items-center gap-3 min-h-12 px-3 rounded-lg border cursor-pointer transition-colors ${values.subject === area ? 'border-primary bg-secondary/30' : 'border-primary/20 hover:border-primary/50'}`}
                        >
                          <input type="radio" name="subject" value={area} checked={values.subject === area} onChange={set('subject')} className="accent-primary" />
                          <FontAwesomeIcon icon={AREA_ICONS[area]} className="text-primary/80 w-4" />
                          <span className="text-sm font-semibold text-primary">{t(`areas.${area}.title`)}</span>
                        </label>
                      ))}
                    </div>
                    {errors.subject && <p className="mt-1 text-sm font-medium text-negative">{errors.subject}</p>}
                  </fieldset>
                  <div>
                    <label htmlFor="vol-message" className="block text-sm font-semibold text-primary mb-1">{t('form.message')}</label>
                    <textarea id="vol-message" rows={3} value={values.message} onChange={set('message')} placeholder={t('form.messagePlaceholder')} className={`${inputClass} py-3`} />
                  </div>
                  {state === 'error' && <p role="alert" className="text-sm font-medium text-negative">{serverError}</p>}
                  <button
                    type="submit"
                    disabled={state === 'sending'}
                    className="w-full min-h-12 rounded-lg bg-primary text-tertiary font-bold inline-flex items-center justify-center gap-2 hover:bg-primary/90 cursor-pointer disabled:opacity-70"
                  >
                    {state === 'sending' && <FontAwesomeIcon icon={faSpinner} spin />}
                    {t('form.submit')}
                  </button>
                  <p className="text-xs text-primary/70">{t('form.privacy')}</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Volunteer;
