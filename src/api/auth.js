import { createClient } from '@/lib/supabase/client';
import { createUser, listUsers } from '@/server/users';

/**
 * Authentication with Supabase Auth. The session lives in cookies (set by
 * @supabase/ssr), so the server and the proxy see the same login.
 */

// The signed-in user's staff profile ({ id, name, email, role }), or null.
async function loadProfile(supabase, userId) {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  return data;
}

/**
 * Login a user with email and password
 * @returns {Promise<Object>} { success, user } or { success: false, errors: { general: [...] } }
 */
export const login = async (email, password) => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const message = error.status === 429
      ? 'Too many login attempts. Please try again later.'
      : 'Invalid email or password. Please try again.';
    return { success: false, errors: { general: [message] } };
  }

  const profile = await loadProfile(supabase, data.user.id);
  if (!profile) {
    await supabase.auth.signOut();
    return { success: false, errors: { general: ['This account has no dashboard access.'] } };
  }
  return { success: true, user: profile };
};

/**
 * Create a staff account (admin only)
 */
export const register = async (userData) => {
  const result = await createUser(userData);
  return result.success
    ? { success: true, user: result.data }
    : { success: false, errors: result.errors || { general: [result.error] } };
};

/**
 * The signed-in staff member, or throws when nobody (or no staff) is signed in
 */
export const getCurrentUser = async () => {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('Not signed in');
  const profile = await loadProfile(supabase, data.user.id);
  if (!profile) throw new Error('This account has no dashboard access.');
  return profile;
};

export const logout = async () => {
  await createClient().auth.signOut();
  return { success: true, message: 'Logged out successfully' };
};

export const getUsers = async () => {
  const result = await listUsers();
  return result.success ? result.data : [];
};
