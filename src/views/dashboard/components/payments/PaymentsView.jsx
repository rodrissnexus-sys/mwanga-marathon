"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faInbox, faChevronDown, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { getRegistrationsPage, exportRegistrationsCsv, countByPaymentStatus } from '../../../../api/marathon/registration';
import { fetchEvents } from '../../../../api/dropdowns';
import { expectedFee, formatMoney, PAYMENT_METHODS } from '@/lib/payments';
import { Alert, Button, Card, EmptyState, PageHeader, Pagination, SearchInput, Select, Spinner, Tabs, formatDateTime, timeAgo } from '../ui/kit';
import RegistrationDrawer from './RegistrationDrawer';

const PAGE_SIZE = 20;

// pending: oldest first (first come, first checked); others: latest first
const ORDER = {
  pending: { orderBy: 'created_at', ascending: true },
  confirmed: { orderBy: 'payment_confirmed_at', ascending: false },
  failed: { orderBy: 'updated_at', ascending: false },
};

const HowItWorks = () => {
  const [open, setOpen] = useState(false);
  return (
    <Card padded={false} className="mb-6">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left cursor-pointer"
      >
        <span className="font-bold text-primary">How payments are confirmed</span>
        <FontAwesomeIcon icon={faChevronDown} className={`text-primary/70 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ol className="px-5 pb-5 grid gap-4 md:grid-cols-4 text-sm text-primary">
          {[
            ['Participant registers', 'They get their registration ID (MWF-2026-…) and the payment numbers and bank accounts. Their payment shows here as Pending.'],
            ['They pay', 'By mobile money or bank transfer, using their registration ID as the reference where possible.'],
            ['You check the money arrived', 'Open the pending payment, find the matching M-Pesa / bank message (name, phone, amount) and enter its transaction ID.'],
            ['Confirm', 'The participant gets a confirmation email and you can print a receipt. Every step is kept in the payment history.'],
          ].map(([title, text], i) => (
            <li key={title} className="rounded-xl bg-primary/[0.03] border border-primary/10 p-4">
              <span className="w-7 h-7 rounded-full bg-secondary text-primary font-extrabold flex items-center justify-center mb-2">{i + 1}</span>
              <p className="font-bold">{title}</p>
              <p className="text-primary/75 mt-1">{text}</p>
            </li>
          ))}
          <li className="md:col-span-4 text-primary/75">
            No payment after a reminder? Use <strong>Mark as not paid</strong> (it can be reopened if they pay later).
            A confirmed payment can only be undone by an admin.
          </li>
        </ol>
      )}
    </Card>
  );
};

const PaymentsView = () => {
  const [status, setStatus] = useState('pending');
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({});
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({ search: '', eventId: '' });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchEvents().then((r) => r.success && setEvents(r.data));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((f) => (f.search === searchInput ? f : { ...f, search: searchInput }));
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    const [list, totals] = await Promise.all([
      getRegistrationsPage({ page, pageSize: PAGE_SIZE, ...ORDER[status], ...filters, paymentStatus: status }),
      countByPaymentStatus(filters),
    ]);
    if (list.success) {
      setRows(list.data);
      setTotal(list.total);
      setError('');
    } else {
      setError(list.error);
    }
    if (totals.success) setCounts(totals.data);
    setLoading(false);
  }, [page, status, filters]);

  useEffect(() => {
    load();
  }, [load]);

  const handleChange = (updated) => {
    setSelected(updated);
    load();
  };

  const exportCsv = async () => {
    setExporting(true);
    const result = await exportRegistrationsCsv({ ...filters, paymentStatus: status });
    if (!result.success) setError(result.error);
    setExporting(false);
  };

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Check each pending payment against the mobile-money or bank record, then confirm it."
        actions={<Button icon={faFileExport} loading={exporting} onClick={exportCsv}>Export CSV</Button>}
      />

      <HowItWorks />

      <div className="flex flex-col xl:flex-row xl:items-center gap-3 mb-4">
        <Tabs
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          tabs={[
            { value: 'pending', label: 'To check', count: counts.pending },
            { value: 'confirmed', label: 'Paid', count: counts.confirmed },
            { value: 'failed', label: 'Not paid', count: counts.failed },
          ]}
        />
        <div className="flex flex-col sm:flex-row gap-3 xl:ml-auto">
          <SearchInput
            placeholder="Name, phone, email or MWF-…"
            aria-label="Search payments"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Select
            aria-label="Race"
            value={filters.eventId}
            onChange={(e) => {
              setFilters((f) => ({ ...f, eventId: e.target.value }));
              setPage(1);
            }}
          >
            <option value="">All races</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>{event.name}</option>
            ))}
          </Select>
        </div>
      </div>

      {error && <div className="mb-4"><Alert onClose={() => setError('')}>{error}</Alert></div>}

      <Card padded={false} className="overflow-hidden">
        {loading && !rows.length ? (
          <Spinner />
        ) : rows.length === 0 ? (
          <EmptyState icon={faInbox} title={status === 'pending' ? 'Nothing to check' : 'No payments here yet'}>
            {status === 'pending' ? 'Every payment has been handled. New registrations will appear here.' : 'Try another tab or clear the search.'}
          </EmptyState>
        ) : (
          <>
            {/* phones: cards */}
            <ul className="md:hidden divide-y divide-primary/10">
              {rows.map((r) => {
                const fee = expectedFee(r);
                return (
                  <li key={r.id}>
                    <button type="button" onClick={() => setSelected(r)} className="w-full text-left px-4 py-4 flex items-center gap-3 cursor-pointer hover:bg-primary/[0.03]">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-primary truncate">{r.first_name} {r.last_name}</p>
                        <p className="text-xs text-primary/70 font-mono">{r.registration_id}</p>
                        <p className="text-sm text-primary/80 mt-1">
                          {status === 'confirmed' ? formatMoney(r.payment_amount, r.payment_currency) : fee && formatMoney(fee.amount, fee.currency)} · {r.event?.name}
                        </p>
                      </div>
                      <FontAwesomeIcon icon={faArrowRight} className="text-primary/70" />
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* tablets and up: table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-primary/[0.03] text-left text-xs uppercase tracking-wide text-primary/70">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold">Participant</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Phone</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Race</th>
                    <th scope="col" className="px-5 py-3 font-semibold">{status === 'confirmed' ? 'Received' : 'Fee'}</th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      {status === 'pending' ? 'Waiting since' : status === 'confirmed' ? 'Confirmed' : 'Reason'}
                    </th>
                    <th scope="col" className="px-5 py-3"><span className="sr-only">Action</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/10 text-primary">
                  {rows.map((r) => {
                    const fee = expectedFee(r);
                    return (
                      <tr key={r.id} className="hover:bg-primary/[0.03]">
                        <td className="px-5 py-3">
                          <p className="font-semibold">{r.first_name} {r.last_name}</p>
                          <p className="text-xs text-primary/70 font-mono">{r.registration_id}</p>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">{r.phone_number}</td>
                        <td className="px-5 py-3">{r.event?.name}</td>
                        <td className="px-5 py-3 whitespace-nowrap font-semibold">
                          {status === 'confirmed' ? (
                            <>
                              {formatMoney(r.payment_amount, r.payment_currency)}
                              <span className="block text-xs font-normal text-primary/70">{PAYMENT_METHODS[r.payment_method]} · <span className="font-mono">{r.payment_reference}</span></span>
                            </>
                          ) : fee && formatMoney(fee.amount, fee.currency)}
                        </td>
                        <td className="px-5 py-3">
                          {status === 'pending' && (
                            <span title={formatDateTime(r.created_at)}>{timeAgo(r.created_at)}</span>
                          )}
                          {status === 'confirmed' && (
                            <>
                              {formatDateTime(r.payment_confirmed_at)}
                              <span className="block text-xs text-primary/70">by {r.payment_confirmed_by_name || '—'}</span>
                            </>
                          )}
                          {status === 'failed' && <span className="line-clamp-2 max-w-xs">{r.payment_notes || '—'}</span>}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Button variant={status === 'pending' ? 'accent' : 'ghost'} onClick={() => setSelected(r)}>
                            {status === 'pending' ? 'Check & confirm' : 'Open'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
          </>
        )}
      </Card>

      <RegistrationDrawer registration={selected} onClose={() => setSelected(null)} onChange={handleChange} />
    </div>
  );
};

export default PaymentsView;
