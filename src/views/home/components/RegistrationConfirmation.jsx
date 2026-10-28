"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCopy, faCheck, faMagnifyingGlass, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { Link } from '@/lib/router';
import { expectedFee, formatMoney } from '@/lib/payments';

// Shown in place of the form after a successful registration: the
// registration ID (needed as payment reference and to check the status),
// the fee to pay and what happens next.
const RegistrationConfirmation = ({ registration, onRegisterAnother }) => {
  const t = useTranslations('home.registration.confirmation');
  const [copied, setCopied] = useState(false);
  const fee = expectedFee(registration);
  const id = registration.registration_id;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available — the ID is still shown
    }
  };

  return (
    <div role="status" className="text-tertiary">
      <div className="flex items-center gap-3">
        <FontAwesomeIcon icon={faCircleCheck} className="text-3xl text-secondary" />
        <h4 className="text-xl font-bold">{t('title', { name: registration.first_name })}</h4>
      </div>

      <div className="mt-6 rounded-xl bg-tertiary text-primary p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-primary/70">{t('yourId')}</p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <p className="text-2xl md:text-3xl font-extrabold font-mono tracking-wide break-all">{id}</p>
          <button
            type="button"
            onClick={copy}
            className="shrink-0 inline-flex items-center gap-2 min-h-10 px-3 rounded-lg bg-primary text-tertiary text-sm font-semibold cursor-pointer"
          >
            <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
            {copied ? t('copied') : t('copy')}
          </button>
        </div>
        {fee && (
          <p className="mt-4 pt-4 border-t border-primary/10 flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-sm font-semibold text-primary/75">{t('amountToPay')}</span>
            <span className="text-xl font-extrabold">{formatMoney(fee.amount, fee.currency)}</span>
          </p>
        )}
      </div>

      <ol className="mt-6 space-y-3">
        {['step1', 'step2', 'step3'].map((step, i) => (
          <li key={step} className="flex gap-3">
            <span className="w-7 h-7 shrink-0 rounded-full bg-secondary text-primary font-extrabold text-sm flex items-center justify-center">{i + 1}</span>
            <span className="text-sm leading-relaxed pt-1">{t(step, { id })}</span>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Link to="/register#payment" className="inline-flex items-center justify-center min-h-12 px-5 rounded-lg bg-secondary text-primary font-bold">
          {t('howToPay')}
        </Link>
        <Link
          to={`/registration-status?id=${encodeURIComponent(id)}`}
          className="inline-flex items-center justify-center gap-2 min-h-12 px-5 rounded-lg border border-tertiary/40 font-semibold hover:border-secondary"
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} />
          {t('checkStatus')}
        </Link>
      </div>
      <button
        type="button"
        onClick={onRegisterAnother}
        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4 cursor-pointer"
      >
        <FontAwesomeIcon icon={faUserPlus} />
        {t('registerAnother')}
      </button>
    </div>
  );
};

export default RegistrationConfirmation;
