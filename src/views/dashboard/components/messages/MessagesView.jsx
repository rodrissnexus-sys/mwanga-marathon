"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelopeOpenText, faCheck, faRotateLeft, faReply, faHandshake, faEnvelope, faPhone, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../../../contexts/AuthContext';
import { getMessages, setMessageHandled } from '../../../../api/messages';
import { Alert, Button, Card, EmptyState, PageHeader, Pagination, Select, Spinner, Tabs, formatDateTime, timeAgo } from '../ui/kit';

const PAGE_SIZE = 20;

const TIERS = { tanzanite: 'Tanzanite', platinum: 'Platinum', gold: 'Gold', silver: 'Silver', custom: 'Custom' };

const MessagesView = () => {
  const { currentUser } = useAuth();
  const [view, setView] = useState('open');
  const [kind, setKind] = useState('');
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null);
  const [expanded, setExpanded] = useState(null);

  // only the latest request may update the list (an older, slower one could
  // otherwise overwrite newer search results)
  const latest = useRef(0);

  const load = useCallback(async () => {
    const request = ++latest.current;
    setLoading(true);
    const result = await getMessages({ page, pageSize: PAGE_SIZE, kind: kind || undefined, handled: view === 'handled' });
    if (request !== latest.current) return;
    if (result.success) {
      setRows(result.data);
      setTotal(result.total);
      setError('');
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [page, kind, view]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (message) => {
    setBusy(message.id);
    const result = await setMessageHandled(message.id, !message.handled_at, currentUser);
    setBusy(null);
    if (result.success) load();
    else setError(result.error);
  };

  return (
    <div>
      <PageHeader title="Messages" description="Questions from the contact form and sponsorship requests from the Sponsors page." />

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <Tabs
          value={view}
          onChange={(value) => {
            setView(value);
            setPage(1);
          }}
          tabs={[
            { value: 'open', label: 'To answer' },
            { value: 'handled', label: 'Handled' },
          ]}
        />
        <div className="sm:ml-auto">
          <Select
            aria-label="Type"
            value={kind}
            onChange={(e) => {
              setKind(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All messages</option>
            <option value="contact">Contact</option>
            <option value="partnership">Partnership</option>
          </Select>
        </div>
      </div>

      {error && <div className="mb-4"><Alert onClose={() => setError('')}>{error}</Alert></div>}

      {loading && !rows.length ? (
        <Card><Spinner /></Card>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState icon={faEnvelopeOpenText} title={view === 'open' ? 'No messages waiting' : 'Nothing handled yet'}>
            {view === 'open' ? 'New messages from the website will appear here.' : 'Messages you mark as handled are kept here.'}
          </EmptyState>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((m) => {
            const open = expanded === m.id;
            const long = m.message.length > 220;
            return (
              <Card key={m.id} padded={false}>
                <article className="p-5">
                  <header className="flex flex-wrap items-start gap-3">
                    <span className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${m.kind === 'partnership' ? 'bg-secondary text-primary' : 'bg-primary/10 text-primary'}`}>
                      <FontAwesomeIcon icon={m.kind === 'partnership' ? faHandshake : faEnvelope} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-primary">
                        {m.name}
                        {m.company && <span className="font-semibold text-primary/75"> · {m.company}</span>}
                      </p>
                      <p className="text-xs text-primary/70">
                        {m.kind === 'partnership' ? 'Partnership' : 'Contact'}
                        {m.sponsorship_tier && ` · ${TIERS[m.sponsorship_tier]} tier`}
                        {' · '}{m.locale === 'sw' ? 'Swahili site' : 'English site'}
                        {' · '}<span title={formatDateTime(m.created_at)}>{timeAgo(m.created_at)}</span>
                      </p>
                    </div>
                  </header>

                  {m.subject && <p className="mt-3 font-semibold text-primary">{m.subject}</p>}
                  <p className="mt-2 text-sm text-primary/90 whitespace-pre-line">
                    {long && !open ? `${m.message.slice(0, 220)}…` : m.message}
                  </p>
                  {long && (
                    <button type="button" onClick={() => setExpanded(open ? null : m.id)} className="mt-1 text-sm font-semibold text-primary underline underline-offset-4 cursor-pointer">
                      {open ? 'Show less' : 'Read all'}
                    </button>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <a
                      href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || 'Mwanga Marathon'}`)}`}
                      className="inline-flex items-center gap-2 min-h-10 px-4 rounded-lg text-sm font-semibold bg-primary text-tertiary hover:bg-primary/90"
                    >
                      <FontAwesomeIcon icon={faReply} /> Reply by email
                    </a>
                    {m.phone && (
                      <a href={`tel:${m.phone}`} className="inline-flex items-center gap-2 min-h-10 px-4 rounded-lg text-sm font-semibold border border-primary/20 text-primary hover:bg-primary/5">
                        <FontAwesomeIcon icon={faPhone} /> {m.phone}
                      </a>
                    )}
                    {m.website && (
                      <a href={/^https?:\/\//.test(m.website) ? m.website : `https://${m.website}`} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-2 min-h-10 px-4 rounded-lg text-sm font-semibold border border-primary/20 text-primary hover:bg-primary/5">
                        <FontAwesomeIcon icon={faGlobe} /> Website
                      </a>
                    )}
                    <Button
                      variant={m.handled_at ? 'ghost' : 'accent'}
                      icon={m.handled_at ? faRotateLeft : faCheck}
                      loading={busy === m.id}
                      onClick={() => toggle(m)}
                      className="sm:ml-auto"
                    >
                      {m.handled_at ? 'Move back to “To answer”' : 'Mark as handled'}
                    </Button>
                  </div>
                  {m.handled_at && (
                    <p className="mt-3 text-xs text-primary/70">
                      Handled {formatDateTime(m.handled_at)}{m.handled_by_name && ` by ${m.handled_by_name}`}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-primary/70 break-all">{m.email}</p>
                </article>
              </Card>
            );
          })}
          {total > PAGE_SIZE && (
            <Card padded={false}><Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} /></Card>
          )}
        </div>
      )}
    </div>
  );
};

export default MessagesView;
