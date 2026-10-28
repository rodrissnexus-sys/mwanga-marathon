"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faUsers, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { getRegistrationsPage, exportRegistrationsCsv } from '../../../../api/marathon/registration';
import { fetchEvents } from '../../../../api/dropdowns';
import { Alert, Button, Card, EmptyState, PageHeader, Pagination, SearchInput, Select, Spinner, StatusBadge, formatDate } from '../ui/kit';
import RegistrationDrawer from '../payments/RegistrationDrawer';

const PAGE_SIZE = 25;

const RegistrationView = () => {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({ search: '', eventId: '', paymentStatus: '', locale: '' });
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
    const result = await getRegistrationsPage({ page, pageSize: PAGE_SIZE, ...filters });
    if (result.success) {
      setRows(result.data);
      setTotal(result.total);
      setError('');
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [page, filters]);

  useEffect(() => {
    load();
  }, [load]);

  const setFilter = (name) => (e) => {
    setFilters((f) => ({ ...f, [name]: e.target.value }));
    setPage(1);
  };

  const exportCsv = async () => {
    setExporting(true);
    const result = await exportRegistrationsCsv(filters);
    if (!result.success) setError(result.error);
    setExporting(false);
  };

  return (
    <div>
      <PageHeader
        title="Registrations"
        description={`${total.toLocaleString()} ${total === 1 ? 'registration matches' : 'registrations match'} the filters. Open one to see all details or handle its payment.`}
        actions={<Button icon={faFileExport} loading={exporting} onClick={exportCsv}>Export CSV</Button>}
      />

      <div className="flex flex-col lg:flex-row gap-3 mb-4">
        <SearchInput
          placeholder="Name, phone, email or MWF-…"
          aria-label="Search registrations"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:flex">
          <Select aria-label="Race" value={filters.eventId} onChange={setFilter('eventId')}>
            <option value="">All races</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>{event.name}</option>
            ))}
          </Select>
          <Select aria-label="Payment" value={filters.paymentStatus} onChange={setFilter('paymentStatus')}>
            <option value="">Any payment status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Paid</option>
            <option value="failed">Not paid</option>
          </Select>
          <Select aria-label="Site language" value={filters.locale} onChange={setFilter('locale')}>
            <option value="">Both site languages</option>
            <option value="en">English site</option>
            <option value="sw">Swahili site</option>
          </Select>
        </div>
      </div>

      {error && <div className="mb-4"><Alert onClose={() => setError('')}>{error}</Alert></div>}

      <Card padded={false} className="overflow-hidden">
        {loading && !rows.length ? (
          <Spinner />
        ) : rows.length === 0 ? (
          <EmptyState icon={faUsers} title="No registrations found">Try clearing the search or filters.</EmptyState>
        ) : (
          <>
            <ul className="md:hidden divide-y divide-primary/10">
              {rows.map((r) => (
                <li key={r.id}>
                  <button type="button" onClick={() => setSelected(r)} className="w-full text-left px-4 py-4 flex items-center gap-3 cursor-pointer hover:bg-primary/[0.03]">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-primary truncate">{r.first_name} {r.last_name}</p>
                      <p className="text-xs text-primary/70 font-mono">{r.registration_id}</p>
                      <p className="text-sm text-primary/80 mt-1 mb-2">{r.event?.name}</p>
                      <StatusBadge status={r.payment_status} />
                    </div>
                    <FontAwesomeIcon icon={faArrowRight} className="text-primary/70" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-primary/[0.03] text-left text-xs uppercase tracking-wide text-primary/70">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold">Participant</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Contact</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Race</th>
                    <th scope="col" className="px-5 py-3 font-semibold">T-shirt</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Registered</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Payment</th>
                    <th scope="col" className="px-5 py-3"><span className="sr-only">Action</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/10 text-primary">
                  {rows.map((r) => (
                    <tr key={r.id} className="hover:bg-primary/[0.03]">
                      <td className="px-5 py-3">
                        <p className="font-semibold">{r.first_name} {r.last_name}</p>
                        <p className="text-xs text-primary/70 font-mono">{r.registration_id}</p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="whitespace-nowrap">{r.phone_number}</p>
                        <p className="text-xs text-primary/70 break-all">{r.email}</p>
                      </td>
                      <td className="px-5 py-3">{r.event?.name}</td>
                      <td className="px-5 py-3">{(r.kids_shirt_size ?? r.shirt_size)?.code}</td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        {formatDate(r.created_at)}
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-primary/10 text-xs font-semibold uppercase">{r.locale}</span>
                      </td>
                      <td className="px-5 py-3"><StatusBadge status={r.payment_status} /></td>
                      <td className="px-5 py-3 text-right">
                        <Button onClick={() => setSelected(r)}>Open</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
          </>
        )}
      </Card>

      <RegistrationDrawer
        registration={selected}
        onClose={() => setSelected(null)}
        onChange={(updated) => {
          setSelected(updated);
          load();
        }}
      />
    </div>
  );
};

export default RegistrationView;
