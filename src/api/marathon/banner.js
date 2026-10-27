import { createClient } from '@/lib/supabase/client';
import { currentLocale, localize, toLocaleColumns } from '@/lib/content';

const BANNER_TEXT = ['title', 'subtitle', 'location'];
const BANNER_SHARED = [
  'start_time', 'max_participants', 'registration_start_date',
  'registration_end_date', 'event_date', 'is_active',
];
const BANNER_SELECT = '*, packages:banner_packages(*, event:events(*))';
// Categories the dashboard's banner details screen still reads as fixed fields.
const LEGACY_CATEGORIES = ['fun_run', 'half_marathon', 'full_marathon'];

const ok = (data, message) => ({ status: 'success', ...(message ? { message } : {}), data });
const fail = (error, fallback) => ({ status: 'error', message: error?.message || fallback });

// Database row → the shape the old API returned: `event_packages` with full
// event objects, plus fun_run_event / fun_run_features (etc.) for older screens.
function toBanner(row, locale) {
  const banner = localize(row, locale);
  const packages = [...(banner.packages ?? [])].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
  delete banner.packages;

  banner.event_packages = packages.map((pkg) => ({
    category: pkg.category,
    event_id: pkg.event_id,
    features: pkg.features ?? [],
    event: pkg.event,
  }));
  for (const category of LEGACY_CATEGORIES) {
    const pkg = banner.event_packages.find((p) => p.category === category);
    banner[`${category}_event_id`] = pkg?.event_id ?? null;
    banner[`${category}_event`] = pkg?.event ?? null;
    banner[`${category}_features`] = pkg?.features ?? null;
  }
  return banner;
}

const pick = (values, fields) =>
  Object.fromEntries(fields.filter((f) => values[f] !== undefined).map((f) => [f, values[f]]));

/**
 * The banner to show on the home page.
 * @returns {Promise<Object>} { status: 'active', data } while registration is open, otherwise { status: 'closed' }
 */
export const getActiveBanner = async () => {
  try {
    const { data, error } = await createClient()
      .from('marathon_banners')
      .select(BANNER_SELECT)
      .eq('is_active', true)
      .maybeSingle();
    if (error) throw error;
    if (!data) return { status: 'closed', message: 'No active marathon banner found' };

    const now = Date.now();
    const open = now >= Date.parse(data.registration_start_date) && now <= Date.parse(data.registration_end_date);
    if (!open) return { status: 'closed', message: 'Registration period is not active' };

    return { status: 'active', data: toBanner(data) };
  } catch {
    return { status: 'closed', message: 'No active marathon registration available' };
  }
};

export const getAllBanners = async () => {
  try {
    const { data, error } = await createClient()
      .from('marathon_banners')
      .select(BANNER_SELECT)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return ok(data.map((row) => toBanner(row)));
  } catch (error) {
    return fail(error, 'Failed to fetch banners');
  }
};

export const getBannerById = async (id) => {
  try {
    const { data, error } = await createClient().from('marathon_banners').select(BANNER_SELECT).eq('id', id).single();
    if (error) throw error;
    return ok(toBanner(data));
  } catch (error) {
    return fail(error, 'Failed to fetch banner');
  }
};

// Only one banner may be active; switch the others off first.
async function deactivateOthers(supabase, exceptId) {
  let query = supabase.from('marathon_banners').update({ is_active: false }).eq('is_active', true);
  if (exceptId) query = query.neq('id', exceptId);
  const { error } = await query;
  if (error) throw error;
}

// Packages are replaced as a set, keeping the other language's feature lists.
async function savePackages(supabase, bannerId, packages, locale) {
  const { data: existing, error } = await supabase.from('banner_packages').select('*').eq('banner_id', bannerId);
  if (error) throw error;
  const byCategory = new Map((existing ?? []).map((pkg) => [pkg.category, pkg]));

  const rows = packages.map((pkg, index) => {
    const current = byCategory.get(pkg.category);
    const features = (pkg.features ?? []).filter((f) => String(f).trim() !== '');
    return {
      banner_id: bannerId,
      category: pkg.category,
      event_id: Number(pkg.event_id),
      sort_order: index,
      [`features_${locale}`]: features,
      // a new package created in Swahili also needs English features
      ...(locale === 'sw' && !current ? { features_en: features } : {}),
    };
  });

  const keep = new Set(rows.map((row) => row.category));
  const stale = (existing ?? []).filter((pkg) => !keep.has(pkg.category)).map((pkg) => pkg.id);
  if (stale.length) {
    const { error: deleteError } = await supabase.from('banner_packages').delete().in('id', stale);
    if (deleteError) throw deleteError;
  }
  if (rows.length) {
    const { error: upsertError } = await supabase
      .from('banner_packages')
      .upsert(rows, { onConflict: 'banner_id,category' });
    if (upsertError) throw upsertError;
  }
}

async function saveBanner(id, values) {
  const supabase = createClient();
  const locale = currentLocale();
  const row = { ...pick(values, BANNER_SHARED), ...toLocaleColumns(values, BANNER_TEXT, { locale, isNew: !id }) };

  if (row.is_active) await deactivateOthers(supabase, id);

  const { data, error } = id
    ? await supabase.from('marathon_banners').update(row).eq('id', id).select('id').single()
    : await supabase.from('marathon_banners').insert(row).select('id').single();
  if (error) throw error;

  if (Array.isArray(values.event_packages)) await savePackages(supabase, data.id, values.event_packages, locale);
  return (await getBannerById(data.id)).data;
}

export const createBanner = async (bannerData) => {
  try {
    return ok(await saveBanner(null, bannerData), 'Marathon banner created successfully');
  } catch (error) {
    return fail(error, 'Failed to create banner');
  }
};

export const updateBanner = async (id, bannerData) => {
  try {
    return ok(await saveBanner(id, bannerData), 'Marathon banner updated successfully');
  } catch (error) {
    return fail(error, 'Failed to update banner');
  }
};

export const deleteBanner = async (id) => {
  try {
    const { error } = await createClient().from('marathon_banners').delete().eq('id', id);
    if (error) throw error;
    return ok(null, 'Marathon banner deleted successfully');
  } catch (error) {
    return fail(error, 'Failed to delete banner');
  }
};

export const toggleBannerActive = async (id) => {
  try {
    const supabase = createClient();
    const { data: banner, error } = await supabase.from('marathon_banners').select('is_active').eq('id', id).single();
    if (error) throw error;
    const activate = !banner.is_active;
    if (activate) await deactivateOthers(supabase, id);
    const { error: updateError } = await supabase.from('marathon_banners').update({ is_active: activate }).eq('id', id);
    if (updateError) throw updateError;
    const updated = (await getBannerById(id)).data;
    return ok(updated, activate ? 'Banner activated successfully' : 'Banner deactivated successfully');
  } catch (error) {
    return fail(error, 'Failed to toggle banner status');
  }
};

/**
 * Active events for the banner's package picker. English names on purpose:
 * the form derives package categories (fun_run, half_marathon…) from them.
 */
export const getAvailableEvents = async () => {
  try {
    const { data, error } = await createClient().from('events').select('*').eq('is_active', true).order('sort_order');
    if (error) throw error;
    return ok(localize(data, 'en'));
  } catch (error) {
    return fail(error, 'Failed to fetch events');
  }
};
