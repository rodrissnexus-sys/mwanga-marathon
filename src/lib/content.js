// Bridges the bilingual database (name_en / name_sw columns) and the ported
// components, which expect a single `name` in the language being viewed.

export const currentLocale = () =>
  typeof document !== 'undefined' && document.documentElement.lang === 'sw' ? 'sw' : 'en';

const hasValue = (value) =>
  Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined && value !== '';

// Adds `field` for every `field_en` column, using Swahili when viewing in
// Swahili and it is filled in, English otherwise. Nested rows are localized too.
export function localize(row, locale = currentLocale()) {
  if (Array.isArray(row)) return row.map((item) => localize(item, locale));
  if (!row || typeof row !== 'object') return row;

  const out = {};
  for (const [key, value] of Object.entries(row)) {
    out[key] = value && typeof value === 'object' && !(value instanceof Date) ? localize(value, locale) : value;
  }
  for (const key of Object.keys(row)) {
    if (!key.endsWith('_en')) continue;
    const base = key.slice(0, -3);
    const sw = row[`${base}_sw`];
    out[base] = locale === 'sw' && hasValue(sw) ? sw : row[key];
  }
  return out;
}

// Turns form values ({ title: '...' }) into the columns of the language being
// edited. New rows created while editing Swahili also fill the required
// English column, so English pages are never blank.
export function toLocaleColumns(values, fields, { locale = currentLocale(), isNew = false } = {}) {
  const out = {};
  for (const field of fields) {
    if (!(field in values)) continue;
    out[`${field}_${locale}`] = values[field];
    if (isNew && locale === 'sw') out[`${field}_en`] = values[field];
  }
  return out;
}

export const failure = (error, fallback) => ({
  success: false,
  error: error?.message || fallback,
});
