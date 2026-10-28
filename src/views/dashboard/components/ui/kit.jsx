"use client";

// Building blocks shared by the dashboard pages, so every page has the same
// spacing, colours and states. Theme colours only (the Tailwind palette is
// switched off): navy `primary`, lime `secondary`, white `tertiary`, and the
// status colours `positive` / `caution` / `negative`.

import React, { useEffect, useId } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faClock,
  faTimesCircle,
  faSpinner,
  faXmark,
  faChevronLeft,
  faChevronRight,
  faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons';

export const PageHeader = ({ title, description, actions }) => (
  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
    <div>
      <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-primary">{title}</h1>
      {description && <p className="mt-1 text-sm text-primary/70 max-w-2xl">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>
);

export const Card = ({ title, action, children, className = '', padded = true }) => (
  <section className={`rounded-2xl bg-tertiary border border-primary/10 shadow-[0_1px_3px_rgb(34_23_81/0.06)] ${className}`}>
    {(title || action) && (
      <div className="flex items-center justify-between gap-3 px-5 pt-5">
        {title && <h2 className="text-base font-bold text-primary">{title}</h2>}
        {action}
      </div>
    )}
    <div className={padded ? 'p-5' : ''}>{children}</div>
  </section>
);

const BUTTON = {
  primary: 'bg-primary text-tertiary hover:bg-primary/90',
  accent: 'bg-secondary text-primary hover:bg-secondary/85',
  ghost: 'bg-tertiary text-primary border border-primary/20 hover:bg-primary/5',
  danger: 'bg-tertiary text-negative border border-negative/40 hover:bg-negative/5',
};

export const Button = ({ variant = 'ghost', icon, loading = false, children, className = '', ...props }) => (
  <button
    type="button"
    {...props}
    disabled={props.disabled || loading}
    className={`inline-flex items-center justify-center gap-2 min-h-10 px-4 rounded-lg text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${BUTTON[variant]} ${className}`}
  >
    {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : icon && <FontAwesomeIcon icon={icon} />}
    {children}
  </button>
);

const STATUS = {
  pending: { label: 'Pending', icon: faClock, className: 'bg-caution/10 text-caution' },
  confirmed: { label: 'Paid', icon: faCheckCircle, className: 'bg-positive/10 text-positive' },
  failed: { label: 'Not paid', icon: faTimesCircle, className: 'bg-negative/10 text-negative' },
};

export const StatusBadge = ({ status }) => {
  const s = STATUS[status] ?? STATUS.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${s.className}`}>
      <FontAwesomeIcon icon={s.icon} aria-hidden="true" />
      {s.label}
    </span>
  );
};

export const Spinner = ({ label = 'Loading…' }) => (
  <div className="flex items-center justify-center gap-3 py-16 text-primary/70" role="status">
    <FontAwesomeIcon icon={faSpinner} spin className="text-2xl" />
    <span className="text-sm">{label}</span>
  </div>
);

export const EmptyState = ({ icon, title, children }) => (
  <div className="flex flex-col items-center text-center py-14 px-6">
    {icon && (
      <span className="w-12 h-12 rounded-full bg-secondary/40 text-primary flex items-center justify-center mb-3">
        <FontAwesomeIcon icon={icon} />
      </span>
    )}
    <p className="font-bold text-primary">{title}</p>
    {children && <p className="mt-1 text-sm text-primary/70 max-w-sm">{children}</p>}
  </div>
);

export const Alert = ({ tone = 'negative', children, onClose }) => {
  const tones = {
    negative: 'bg-negative/10 text-negative border-negative/30',
    positive: 'bg-positive/10 text-positive border-positive/30',
    caution: 'bg-caution/10 text-caution border-caution/30',
  };
  return (
    <div role={tone === 'negative' ? 'alert' : 'status'} className={`flex items-start gap-3 px-4 py-3 rounded-lg border text-sm font-medium ${tones[tone]}`}>
      <FontAwesomeIcon icon={tone === 'positive' ? faCheckCircle : faCircleExclamation} className="mt-0.5" />
      <div className="flex-1">{children}</div>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Dismiss" className="cursor-pointer">
          <FontAwesomeIcon icon={faXmark} />
        </button>
      )}
    </div>
  );
};

export const Tabs = ({ tabs, value, onChange }) => (
  <div role="tablist" className="inline-flex p-1 rounded-xl bg-primary/5 border border-primary/10 max-w-full overflow-x-auto">
    {tabs.map((tab) => (
      <button
        key={tab.value}
        type="button"
        role="tab"
        aria-selected={value === tab.value}
        onClick={() => onChange(tab.value)}
        className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${value === tab.value ? 'bg-primary text-tertiary shadow' : 'text-primary/80 hover:text-primary'}`}
      >
        {tab.label}
        {tab.count !== undefined && (
          <span className={`ml-2 px-1.5 py-0.5 rounded-md text-xs ${value === tab.value ? 'bg-secondary text-primary' : 'bg-primary/10'}`}>{tab.count}</span>
        )}
      </button>
    ))}
  </div>
);

export const Pagination = ({ page, pageSize, total, onChange }) => {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-primary/10 text-sm text-primary/80">
      <span>
        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
      </span>
      <div className="flex items-center gap-1">
        <Button aria-label="Previous page" icon={faChevronLeft} disabled={page <= 1} onClick={() => onChange(page - 1)} className="px-3" />
        <span className="px-3 font-semibold text-primary">{page} / {pages}</span>
        <Button aria-label="Next page" icon={faChevronRight} disabled={page >= pages} onClick={() => onChange(page + 1)} className="px-3" />
      </div>
    </div>
  );
};

const inputClass = 'w-full min-h-10 px-3 py-2 rounded-lg bg-tertiary border border-primary/25 text-primary placeholder:text-primary/50 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-primary';

export const Field = ({ label, hint, error, children }) => {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-primary mb-1">{label}</label>
      {React.cloneElement(children, { id, 'aria-invalid': error ? true : undefined, className: `${inputClass} ${children.props.className ?? ''}` })}
      {hint && !error && <p className="mt-1 text-xs text-primary/70">{hint}</p>}
      {error && <p className="mt-1 text-xs font-semibold text-negative">{error}</p>}
    </div>
  );
};

export const SearchInput = (props) => (
  <input type="search" {...props} className={`${inputClass} sm:w-72`} />
);

export const Select = ({ children, ...props }) => (
  <select {...props} className={`${inputClass} sm:w-auto`}>{children}</select>
);

/** Panel that slides in from the right (full screen on phones). */
export const Drawer = ({ open, onClose, title, subtitle, children, footer }) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-primary/50" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full sm:max-w-xl h-full bg-tertiary shadow-2xl flex flex-col">
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-primary/10">
          <div>
            <h2 className="text-lg font-extrabold text-primary">{title}</h2>
            {subtitle && <p className="text-sm text-primary/70 mt-0.5">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="w-10 h-10 -mr-2 rounded-lg text-primary hover:bg-primary/5 cursor-pointer">
            <FontAwesomeIcon icon={faXmark} className="text-lg" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-primary/10 bg-primary/[0.02]">{footer}</div>}
      </div>
    </div>
  );
};

/** Label/value pairs in two columns. */
export const DetailList = ({ items }) => (
  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
    {items.filter(Boolean).map(([label, value]) => (
      <div key={label}>
        <dt className="text-xs font-semibold uppercase tracking-wide text-primary/70">{label}</dt>
        <dd className="text-sm text-primary mt-0.5 break-words">{value || '—'}</dd>
      </div>
    ))}
  </dl>
);

export const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString('en-GB', { timeZone: 'Africa/Dar_es_Salaam', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const timeAgo = (value) => {
  const minutes = Math.round((Date.now() - new Date(value)) / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
};
