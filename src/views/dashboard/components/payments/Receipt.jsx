"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { faPrint } from '@fortawesome/free-solid-svg-icons';
import { getRegistration } from '../../../../api/marathon/registration';
import { PAYMENT_METHODS, formatMoney } from '@/lib/payments';
import { EVENT } from '@/lib/event';
import { Alert, Button, Spinner, formatDateTime } from '../ui/kit';

/** Printable payment receipt for one confirmed registration. */
const Receipt = () => {
  const { id } = useParams();
  const [r, setR] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getRegistration(id).then((result) => (result.success ? setR(result.data) : setError(result.error)));
  }, [id]);

  if (error) return <Alert>{error}</Alert>;
  if (!r) return <Spinner />;
  if (r.payment_status !== 'confirmed') return <Alert tone="caution">This payment hasn’t been confirmed, so there is no receipt yet.</Alert>;

  const rows = [
    ['Registration ID', r.registration_id],
    ['Participant', `${r.first_name} ${r.last_name}`],
    ['Phone', r.phone_number],
    ['Race', r.event?.name],
    ['T-shirt', (r.kids_shirt_size ?? r.shirt_size)?.name],
    ['Kit collection', r.collection_venue?.name],
    ['Paid by', PAYMENT_METHODS[r.payment_method] ?? '—'],
    ['Reference', r.payment_reference ?? '—'],
    ['Confirmed', `${formatDateTime(r.payment_confirmed_at)} by ${r.payment_confirmed_by_name ?? '—'}`],
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-end mb-4 print:hidden">
        <Button variant="primary" icon={faPrint} onClick={() => window.print()}>Print or save as PDF</Button>
      </div>
      <article className="bg-tertiary rounded-2xl border border-primary/10 shadow-sm overflow-hidden print:shadow-none print:border-0 print:rounded-none">
        <header className="bg-primary text-tertiary px-8 py-6 flex items-center justify-between gap-4 print:[print-color-adjust:exact]">
          <div className="flex items-center gap-4">
            <img src="/assets/logo/logo.png" alt="" className="w-14 h-14 object-contain" />
            <div>
              <p className="text-xl font-extrabold tracking-wide">Mwanga Marathon {EVENT.year}</p>
              <p className="text-sm text-tertiary/80">Mwanga Festival of Marathon (MWAFEM)</p>
            </div>
          </div>
          <p className="text-right">
            <span className="block text-xs uppercase tracking-wider text-secondary font-bold">Payment receipt</span>
            <span className="block font-mono text-sm">{r.registration_id}</span>
          </p>
        </header>
        <div className="px-8 py-6">
          <div className="flex items-end justify-between gap-4 pb-6 border-b border-primary/10">
            <div>
              <p className="text-xs uppercase tracking-wide text-primary/70 font-semibold">Amount received</p>
              <p className="text-4xl font-extrabold text-primary">{formatMoney(r.payment_amount, r.payment_currency)}</p>
            </div>
            <span className="px-3 py-1.5 rounded-full bg-positive/10 text-positive font-bold text-sm">PAID</span>
          </div>
          <dl className="divide-y divide-primary/10">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-6 py-3 text-sm">
                <dt className="text-primary/70">{label}</dt>
                <dd className="text-primary font-semibold text-right">{value || '—'}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-xs text-primary/70">
            Race day: 20 December 2026, C.D. Msuya Stadium, Mwanga. Bring this receipt or your registration ID when collecting your race kit.
          </p>
        </div>
      </article>
    </div>
  );
};

export default Receipt;
