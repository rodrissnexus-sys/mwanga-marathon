"use client";

import React, { useEffect, useState } from 'react';
import { Link } from '@/lib/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faTimesCircle,
  faRotateLeft,
  faPrint,
  faPhone,
  faEnvelope,
  faCopy,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../../../contexts/AuthContext';
import { confirmPayment, markPaymentFailed, reopenPayment, getPaymentHistory } from '../../../../api/marathon/registration';
import { CATEGORY_LABELS, expectedFee, formatMoney, PAYMENT_METHODS } from '@/lib/payments';
import { Alert, Button, DetailList, Drawer, Field, StatusBadge, formatDate, formatDateTime } from '../ui/kit';

const EVENT_TEXT = {
  confirmed: 'Payment confirmed',
  failed: 'Marked as not paid',
  pending: 'Set back to pending',
};

/** Who changed the payment, when, and with what details. */
const PaymentHistory = ({ events }) => {
  if (!events?.length) return null;
  return (
    <section>
      <h3 className="text-sm font-bold uppercase tracking-wide text-primary/70 mb-3">Payment history</h3>
      <ol className="relative border-l-2 border-primary/10 ml-2 space-y-4">
        {events.map((event) => (
          <li key={event.id} className="pl-5 relative">
            <span aria-hidden="true" className={`absolute -left-[7px] top-1.5 w-3 h-3 rounded-full ring-4 ring-tertiary ${event.status === 'confirmed' ? 'bg-positive' : event.status === 'failed' ? 'bg-negative' : 'bg-caution'}`} />
            <p className="text-sm font-semibold text-primary">{EVENT_TEXT[event.status]}</p>
            <p className="text-xs text-primary/70">
              {formatDateTime(event.created_at)} · {event.actor_name || 'System'}
            </p>
            {event.status === 'confirmed' && (
              <p className="text-xs text-primary/80 mt-1">
                {PAYMENT_METHODS[event.method] ?? '—'} · Ref <span className="font-mono">{event.reference}</span> · {formatMoney(event.amount, event.currency)}
              </p>
            )}
            {event.notes && <p className="text-xs text-primary/80 mt-1 italic">“{event.notes}”</p>}
          </li>
        ))}
      </ol>
    </section>
  );
};

const ConfirmForm = ({ registration, fee, onDone }) => {
  const [values, setValues] = useState({
    method: 'mobile_money',
    reference: '',
    amount: fee?.amount ?? '',
    currency: fee?.currency ?? 'TZS',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [duplicates, setDuplicates] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (name) => (e) => {
    setValues((v) => ({ ...v, [name]: e.target.value }));
    if (name === 'reference') setDuplicates(null);
  };

  const submit = async (allowDuplicate = false) => {
    setSaving(true);
    setError('');
    setErrors({});
    const result = await confirmPayment(registration.id, { ...values, allowDuplicate });
    setSaving(false);
    if (result.success) return onDone(result.data, 'Payment confirmed. The participant will get an email.');
    if (result.duplicates) return setDuplicates(result.duplicates);
    setError(result.error);
    setErrors(Object.fromEntries(Object.entries(result.errors ?? {}).map(([k, v]) => [k, v[0]])));
  };

  const short = fee && values.currency === fee.currency && Number(values.amount) > 0 && Number(values.amount) < fee.amount;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(false);
      }}
      className="space-y-4"
    >
      <div className="rounded-xl bg-secondary/25 border border-secondary px-4 py-3 text-sm text-primary">
        <p className="font-bold mb-1">Before you confirm</p>
        <ol className="list-decimal ml-4 space-y-0.5">
          <li>Find the payment in the M-Pesa / Tigo Pesa / Airtel Money messages or the bank statement.</li>
          <li>Check the sender name or phone matches this participant.</li>
          <li>Check the amount, then copy the transaction ID below.</li>
        </ol>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Paid by">
          <select value={values.method} onChange={set('method')}>
            {Object.entries(PAYMENT_METHODS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>
        <Field label="Transaction ID / reference" hint="e.g. the M-Pesa code like QJK3H2L9XP" error={errors.reference}>
          <input value={values.reference} onChange={set('reference')} autoComplete="off" className="font-mono uppercase" required />
        </Field>
        <Field label="Amount received" error={errors.amount}>
          <input type="number" inputMode="decimal" min="0" step="any" value={values.amount} onChange={set('amount')} required />
        </Field>
        <Field label="Currency">
          <select value={values.currency} onChange={set('currency')}>
            <option value="TZS">TZS</option>
            <option value="USD">USD</option>
          </select>
        </Field>
      </div>
      {short && (
        <Alert tone="caution">
          That is less than the race fee ({formatMoney(fee.amount, fee.currency)}). Confirm only if the difference was agreed — and say why in the note.
        </Alert>
      )}
      <Field label="Note (optional)" error={errors.notes}>
        <textarea rows={2} value={values.notes} onChange={set('notes')} placeholder="e.g. paid by parent for two children" />
      </Field>

      {error && !duplicates && <Alert>{error}</Alert>}
      {duplicates && (
        <Alert tone="caution">
          <p className="font-bold">This reference was already used for:</p>
          <ul className="list-disc ml-4 my-1">
            {duplicates.map((d) => (
              <li key={d.id}>{d.name} ({d.registration_id})</li>
            ))}
          </ul>
          <p>Only continue if one payment really covers several people.</p>
          <Button variant="primary" className="mt-2" loading={saving} onClick={() => submit(true)}>Confirm anyway</Button>
        </Alert>
      )}
      {!duplicates && (
        <Button type="submit" variant="accent" icon={faCheckCircle} loading={saving} className="w-full min-h-12 text-base">
          Confirm payment
        </Button>
      )}
    </form>
  );
};

/** Asks for a reason, then runs `action(reason)`. */
const ReasonAction = ({ label, icon, prompt, variant = 'ghost', action }) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!open) return <Button variant={variant} icon={icon} onClick={() => setOpen(true)}>{label}</Button>;
  return (
    <div className="w-full space-y-3 rounded-xl border border-primary/15 p-4">
      <Field label={prompt} error={error}>
        <textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} autoFocus />
      </Field>
      <div className="flex gap-2">
        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          loading={saving}
          onClick={async () => {
            setSaving(true);
            const result = await action(reason);
            setSaving(false);
            if (!result.success) setError(result.error);
          }}
        >
          {label}
        </Button>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  );
};

const RegistrationDrawer = ({ registration, onClose, onChange }) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const [history, setHistory] = useState([]);
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState(false);

  // a different registration: clear the last success message
  useEffect(() => {
    setNotice('');
  }, [registration?.id]);

  useEffect(() => {
    if (registration) getPaymentHistory(registration.id).then((r) => r.success && setHistory(r.data));
  }, [registration?.id, registration?.payment_status]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!registration) return null;
  const r = registration;
  const fee = expectedFee(r);

  const done = (updated, message) => {
    onChange(updated);
    setNotice(message);
    return updated;
  };
  const run = (fn, message) => async (reason) => {
    const result = await fn(r.id, reason);
    if (result.success) done(result.data, message);
    return result;
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(r.registration_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked — nothing to do
    }
  };

  return (
    <Drawer
      open
      onClose={onClose}
      title={`${r.first_name} ${r.last_name}`}
      subtitle={
        <span className="inline-flex items-center gap-2">
          <span className="font-mono">{r.registration_id}</span>
          <button type="button" onClick={copyId} className="text-primary/70 hover:text-primary cursor-pointer" aria-label="Copy registration ID">
            <FontAwesomeIcon icon={faCopy} />
          </button>
          {copied && <span className="text-xs text-positive font-semibold">Copied</span>}
        </span>
      }
    >
      {notice && <Alert tone="positive" onClose={() => setNotice('')}>{notice}</Alert>}

      {/* payment summary */}
      <section className="rounded-2xl bg-primary text-tertiary p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-tertiary/75 font-semibold">Race fee</p>
            <p className="text-3xl font-extrabold mt-1">{fee ? formatMoney(fee.amount, fee.currency) : '—'}</p>
            <p className="text-sm text-tertiary/80 mt-1">
              {r.event?.name}
              {r.participant_category && <> · {CATEGORY_LABELS[r.participant_category]}</>}
            </p>
          </div>
          <span className="bg-tertiary rounded-full"><StatusBadge status={r.payment_status} /></span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <a href={`tel:${r.phone_number}`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-tertiary/10 hover:bg-tertiary/20">
            <FontAwesomeIcon icon={faPhone} /> {r.phone_number}
          </a>
          <a href={`mailto:${r.email}`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-tertiary/10 hover:bg-tertiary/20 break-all">
            <FontAwesomeIcon icon={faEnvelope} /> {r.email}
          </a>
        </div>
      </section>

      {r.payment_status === 'pending' && (
        <section className="space-y-4">
          <ConfirmForm key={r.id} registration={r} fee={fee} onDone={done} />
          <div className="pt-2 border-t border-primary/10">
            <ReasonAction
              label="Mark as not paid"
              icon={faTimesCircle}
              variant="danger"
              prompt="Why? (e.g. no payment found after reminder on 5 Dec)"
              action={run(markPaymentFailed, 'Marked as not paid.')}
            />
          </div>
        </section>
      )}

      {r.payment_status === 'confirmed' && (
        <section className="space-y-4">
          <DetailList
            items={[
              ['Paid by', PAYMENT_METHODS[r.payment_method] ?? '—'],
              ['Reference', r.payment_reference && <span className="font-mono">{r.payment_reference}</span>],
              ['Amount received', formatMoney(r.payment_amount, r.payment_currency)],
              ['Confirmed', `${formatDateTime(r.payment_confirmed_at)} by ${r.payment_confirmed_by_name || '—'}`],
              r.payment_notes && ['Note', r.payment_notes],
            ]}
          />
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/dashboard/receipt/${r.id}`}
              target="_blank"
              className="inline-flex items-center justify-center gap-2 min-h-10 px-4 rounded-lg text-sm font-semibold bg-primary text-tertiary hover:bg-primary/90"
            >
              <FontAwesomeIcon icon={faPrint} /> Receipt
            </Link>
            {isAdmin && (
              <ReasonAction
                label="Undo confirmation"
                icon={faRotateLeft}
                variant="danger"
                prompt="Why is this being undone? (kept in the history)"
                action={run(reopenPayment, 'Payment set back to pending.')}
              />
            )}
          </div>
          {!isAdmin && <p className="text-xs text-primary/70">Only an admin can undo a confirmed payment.</p>}
        </section>
      )}

      {r.payment_status === 'failed' && (
        <section className="space-y-3">
          {r.payment_notes && <DetailList items={[['Reason', r.payment_notes]]} />}
          <ReasonAction
            label="Reopen payment"
            icon={faRotateLeft}
            prompt="What changed? (e.g. participant paid late)"
            action={run(reopenPayment, 'Payment is pending again — confirm it once you have found it.')}
          />
        </section>
      )}

      <PaymentHistory events={history} />

      <section>
        <h3 className="text-sm font-bold uppercase tracking-wide text-primary/70 mb-3">Participant</h3>
        <DetailList
          items={[
            ['Registered', formatDateTime(r.created_at)],
            ['Site language', r.locale === 'sw' ? 'Kiswahili' : 'English'],
            ['Participant type', CATEGORY_LABELS[r.participant_category]],
            ['Date of birth', formatDate(r.date_of_birth)],
            ['Gender', r.gender?.name],
            ['Nationality', r.nationality?.name],
            ['Country', r.country?.name],
            r.id_number && ['ID number', r.id_number],
            r.passport_number && ['Passport', r.passport_number],
            ['T-shirt', r.shirt_size?.name],
            r.kids_shirt_size && ['Kids t-shirt', r.kids_shirt_size?.name],
            ['Collect kit at', r.collection_venue?.name],
            ['Emergency contact', `${r.emergency_contact_name} · ${r.emergency_contact_number}`],
            r.voucher_code && ['Voucher', r.voucher_code],
            r.postal_code && ['Postal code', r.postal_code],
          ]}
        />
      </section>
    </Drawer>
  );
};

export default RegistrationDrawer;
