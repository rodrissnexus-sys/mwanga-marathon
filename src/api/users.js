import * as users from '@/server/users';

// Staff accounts are managed on the server (admin only) — see src/server/users.ts.

export const getUsers = () => users.listUsers();

export const getUserById = async (id) => {
  const result = await users.listUsers();
  if (!result.success) return result;
  const user = result.data.find((u) => u.id === id);
  return user ? { success: true, data: user } : { success: false, error: 'User not found' };
};

export const createUser = (userData) => users.createUser(userData);

export const updateUser = (id, userData) => users.updateUser(id, userData);

export const deleteUser = (id) => users.deleteUser(id);

export const updateUserStatus = (id, status) => users.updateUserStatus(id, status);
