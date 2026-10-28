"use client";

import React, { useEffect, useState } from 'react';
import { Link } from '@/lib/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faClock,
  faCheckCircle,
  faCoins,
  faHourglassHalf,
  faFlagCheckered,
  faArrowRight,
  faCalendarXmark,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../../../contexts/AuthContext';
import { getOverview } from '../../../../api/marathon/dashboard';
import { expectedFee, formatMoney } from '@/lib/payments';
import { EVENT } from '@/lib/event';
import { Alert, Card, EmptyState, Spinner, timeAgo } from '../ui/kit';

const daysUntil = (date) => Math.ceil((new Date(date) - Date.now()) / 86_400_000);

const greeting = () => {
  const hour = Number(new Date().toLocaleString('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Africa/Dar_es_Salaam' }));
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
};

const money = (totals) =>
  [totals.TZS > 0 && formatMoney(totals.TZS, 'TZS'), totals.USD > 0 && formatMoney(totals.USD, 'USD')].filter(Boolean).join(' + ') || 'TZS 0';

const Stat = ({ icon, label, value, detail, tone = 'default', to }) => {
  const tones = {
    default: 'bg-tertiary text-primary border-primary/10',
    navy: 'bg-primary text-tertiary border-primary',
    lime: 'bg-secondary text-primary border-secondary',
  };
  const body = (
    <div className={`h-full rounded-2xl border p-5 shadow-[0_1px_3px_rgb(34_23_81/0.06)] ${tones[tone]} ${to ? 'hover:shadow-lg transition-shadow' : ''}`}>
      <div className="flex items-center justify-between">
        <p className={`text-sm font-semibold ${tone === 'navy' ? 'text-tertiary/80' : 'text-primary/75'}`}>{label}</p>
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${tone === 'navy' ? 'bg-tertiary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
          <FontAwesomeIcon icon={icon} />
        </span>
      </div>
      <p className="mt-3 text-2xl md:text-3xl font-extrabold tracking-tight break-words">{value}</p>
      {detail && <p className={`mt-1 text-sm ${tone === 'navy' ? 'text-tertiary/80' : 'text-primary/75'}`}>{detail}</p>}
    </div>
  );
  return to ? <Link to={to} className="block h-full">{body}</Link> : body;
};

const DailyChart = ({ daily }) => {
  const max = Math.max(1, ...daily.map((d) => d.count));
  const total = daily.reduce((sum, d) => sum + d.count, 0);
  return (
    <Card title="New registrations" action={<span className="text-sm text-primary/70">last 30 days · {total}</span>}>
      <div className="flex items-end gap-[3px] h-40" role="img" aria-label={`${total} registrations in the last 30 days`}>
        {daily.map((d) => (
          <div key={d.date} className="flex-1 h-full flex items-end group relative">
            <div
              className={`w-full rounded-t ${d.count ? 'bg-primary group-hover:bg-secondary' : 'bg-primary/10'}`}
              style={{ height: `${Math.max(4, (d.count / max) * 100)}%` }}
            />
            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded bg-primary text-tertiary text-xs whitespace-nowrap opacity-0 group-hover:opacity-100">
              {new Date(d.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}: {d.count}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-xs text-primary/70">
        <span>{new Date(daily[0].date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
        <span>Today</span>
      </div>
    </Card>
  );
};

const RaceProgress = ({ races }) => (
  <Card title="By race">
    <ul className="space-y-4">
      {races.map((race) => {
        const pct = (n) => (race.total ? (n / race.total) * 100 : 0);
        return (
          <li key={race.id}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-semibold text-primary">{race.name}</span>
              <span className="text-primary/75 whitespace-nowrap">
                <strong className="text-primary">{race.confirmed}</strong> paid of {race.total}
              </span>
            </div>
            <div className="mt-1.5 h-2.5 rounded-full bg-primary/10 overflow-hidden flex" aria-hidden="true">
              <div className="bg-positive" style={{ width: `${pct(race.confirmed)}%` }} />
              <div className="bg-caution/60" style={{ width: `${pct(race.pending)}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
    <div className="flex gap-4 mt-5 text-xs text-primary/75">
      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-positive" /> Paid</span>
      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-caution/60" /> Pending</span>
    </div>
  </Card>
);

const DashboardHome = () => {
  const { currentUser } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getOverview().then((result) => (result.success ? setData(result.data) : setError(result.error)));
  }, []);

  const raceDays = daysUntil(EVENT.startsAt);
  const closeDays = daysUntil(EVENT.registrationClosesAt);
  const firstName = currentUser?.name?.split(' ')[0] ?? '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-primary">{greeting()}, {firstName}</h1>
          <p className="mt-1 text-sm text-primary/70">Mwanga Marathon {EVENT.year} at a glance.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary text-tertiary text-sm font-semibold">
            <FontAwesomeIcon icon={faFlagCheckered} className="text-secondary" />
            {raceDays > 0 ? `${raceDays} days to race day` : raceDays === 0 ? 'Race day!' : 'Race finished'}
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-tertiary border border-primary/15 text-primary text-sm font-semibold">
            <FontAwesomeIcon icon={faCalendarXmark} />
            {closeDays > 0 ? `Registration closes in ${closeDays} days` : 'Registration closed'}
          </span>
        </div>
      </div>

      {error && <Alert>{error}</Alert>}
      {!data && !error && <Spinner label="Loading the overview…" />}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat icon={faUsers} label="Registrations" value={data.counts.total.toLocaleString()} detail={`${data.genders.M} men · ${data.genders.F} women`} to="/dashboard/registration" />
            <Stat
              icon={faClock}
              label="Payments to check"
              value={data.counts.pending.toLocaleString()}
              detail={data.counts.pending ? 'Open the payment queue →' : 'All caught up'}
              tone="lime"
              to="/dashboard/payments"
            />
            <Stat
              icon={faCheckCircle}
              label="Paid"
              value={data.counts.confirmed.toLocaleString()}
              detail={data.counts.total ? `${Math.round((data.counts.confirmed / data.counts.total) * 100)}% of registrations` : '—'}
            />
            <Stat icon={faCoins} label="Money received" value={money(data.received)} detail={`Still expected: ${money(data.outstanding)}`} tone="navy" />
          </div>

          <div className="grid gap-6 xl:grid-cols-5">
            <div className="xl:col-span-3 space-y-6">
              <DailyChart daily={data.daily} />
              <RaceProgress races={data.races} />
            </div>

            <Card
              className="xl:col-span-2 self-start"
              title="Waiting longest"
              action={<Link to="/dashboard/payments" className="text-sm font-semibold text-primary underline underline-offset-4">All pending</Link>}
            >
              {data.oldestPending.length === 0 ? (
                <EmptyState icon={faCheckCircle} title="No pending payments">Every registration has been checked.</EmptyState>
              ) : (
                <ul className="divide-y divide-primary/10 -my-2">
                  {data.oldestPending.map((r) => {
                    const fee = expectedFee(r);
                    return (
                      <li key={r.id} className="py-3 flex items-center gap-3">
                        <span className="w-10 h-10 shrink-0 rounded-full bg-caution/10 text-caution flex items-center justify-center">
                          <FontAwesomeIcon icon={faHourglassHalf} />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-primary truncate">{r.first_name} {r.last_name}</p>
                          <p className="text-xs text-primary/70">
                            {r.event?.name} · {fee && formatMoney(fee.amount, fee.currency)} · {timeAgo(r.created_at)}
                          </p>
                        </div>
                        <Link to="/dashboard/payments" aria-label={`Check payment of ${r.first_name} ${r.last_name}`} className="w-9 h-9 rounded-lg flex items-center justify-center text-primary hover:bg-primary/5">
                          <FontAwesomeIcon icon={faArrowRight} />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardHome;
