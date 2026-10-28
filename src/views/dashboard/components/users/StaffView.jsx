"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { faUserPlus, faUserShield, faBan, faCircleCheck, faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../../../contexts/AuthContext';
import { getUsers, createUser, updateUser, deleteUser, updateUserStatus } from '../../../../api/users';
import { Alert, Button, Card, Drawer, EmptyState, Field, PageHeader, Spinner, formatDateTime } from '../ui/kit';

const ROLE_TEXT = {
  admin: 'Everything, including website content, staff accounts and undoing confirmed payments.',
  moderator: 'Registrations, payments and messages.',
};

const firstErrors = (errors = {}) => Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, v[0]]));

/** Add a staff member, or edit one (`user` given). Password is optional when editing. */
const StaffForm = ({ user, onSaved, onClose }) => {
  const [values, setValues] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    role: user?.role ?? 'moderator',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (name) => (e) => setValues((v) => ({ ...v, [name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setError('');
    const payload = user && !values.password
      ? { name: values.name, email: values.email, role: values.role }
      : values;
    const result = user ? await updateUser(user.id, payload) : await createUser(payload);
    setSaving(false);
    if (result.success) return onSaved(user ? 'Staff member updated.' : `Account created for ${values.name}. Share the password with them privately.`);
    setErrors(firstErrors(result.errors));
    if (!result.errors) setError(result.error);
  };

  return (
    <Drawer
      open
      onClose={onClose}
      title={user ? `Edit ${user.name}` : 'Add a staff member'}
      footer={
        <div className="flex gap-2 justify-end">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" form="staff-form" variant="primary" loading={saving}>{user ? 'Save changes' : 'Create account'}</Button>
        </div>
      }
    >
      <form id="staff-form" onSubmit={submit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <Field label="Full name" error={errors.name}>
          <input value={values.name} onChange={set('name')} required autoComplete="off" />
        </Field>
        <Field label="Email" error={errors.email}>
          <input type="email" value={values.email} onChange={set('email')} required autoComplete="off" />
        </Field>
        <fieldset>
          <legend className="block text-sm font-semibold text-primary mb-2">Role</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {['moderator', 'admin'].map((role) => (
              <label key={role} className={`flex gap-3 p-3 rounded-xl border cursor-pointer ${values.role === role ? 'border-primary bg-primary/5' : 'border-primary/20'}`}>
                <input type="radio" name="role" value={role} checked={values.role === role} onChange={set('role')} className="mt-1 accent-primary" />
                <span>
                  <span className="block font-semibold text-primary capitalize">{role}</span>
                  <span className="block text-xs text-primary/75">{ROLE_TEXT[role]}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <Field label={user ? 'New password (leave empty to keep it)' : 'Password'} hint="At least 8 characters." error={errors.password}>
          <input type="password" value={values.password} onChange={set('password')} required={!user} autoComplete="new-password" />
        </Field>
        {(values.password || !user) && (
          <Field label="Repeat password" error={errors.password_confirmation}>
            <input type="password" value={values.password_confirmation} onChange={set('password_confirmation')} required autoComplete="new-password" />
          </Field>
        )}
      </form>
    </Drawer>
  );
};

const StaffView = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState(null); // null, 'new' or a user
  const [busy, setBusy] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    const result = await getUsers();
    if (result.success) setUsers(result.data);
    else setError(result.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (id, fn, message) => {
    setBusy(id);
    setError('');
    const result = await fn();
    setBusy(null);
    setConfirmDelete(null);
    if (!result.success) return setError(result.error);
    setNotice(message);
    load();
  };

  return (
    <div>
      <PageHeader
        title="Staff accounts"
        description="People who can sign in to this dashboard. Moderators handle registrations, payments and messages; admins can do everything."
        actions={<Button variant="accent" icon={faUserPlus} onClick={() => setEditing('new')}>Add staff member</Button>}
      />

      <div className="space-y-3 mb-4">
        {error && <Alert onClose={() => setError('')}>{error}</Alert>}
        {notice && <Alert tone="positive" onClose={() => setNotice('')}>{notice}</Alert>}
      </div>

      <Card padded={false} className="overflow-hidden">
        {loading ? (
          <Spinner />
        ) : users.length === 0 ? (
          <EmptyState icon={faUserShield} title="No staff accounts yet" />
        ) : (
          <ul className="divide-y divide-primary/10">
            {users.map((u) => {
              const me = u.id === currentUser?.id;
              const suspended = u.status === 'suspended';
              return (
                <li key={u.id} className="px-5 py-4 flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${u.role === 'admin' ? 'bg-primary text-secondary' : 'bg-primary/10 text-primary'}`}>
                      {(u.name || '?').split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-primary">
                        {u.name} {me && <span className="text-xs font-normal text-primary/70">(you)</span>}
                      </p>
                      <p className="text-sm text-primary/75 break-all">{u.email}</p>
                      <p className="text-xs text-primary/70">Last sign-in: {u.last_sign_in_at ? formatDateTime(u.last_sign_in_at) : 'never'}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${u.role === 'admin' ? 'bg-secondary text-primary' : 'bg-primary/10 text-primary'}`}>{u.role}</span>
                    {suspended && <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-negative/10 text-negative">Suspended</span>}
                    <Button icon={faPen} onClick={() => setEditing(u)}>Edit</Button>
                    {!me && u.role !== 'admin' && (
                      <>
                        <Button
                          icon={suspended ? faCircleCheck : faBan}
                          loading={busy === u.id && !confirmDelete}
                          onClick={() => act(u.id, () => updateUserStatus(u.id, suspended ? 'active' : 'suspended'), suspended ? `${u.name} can sign in again.` : `${u.name} can no longer sign in.`)}
                        >
                          {suspended ? 'Allow sign-in' : 'Suspend'}
                        </Button>
                        {confirmDelete === u.id ? (
                          <>
                            <Button variant="danger" icon={faTrash} loading={busy === u.id} onClick={() => act(u.id, () => deleteUser(u.id), `${u.name} was removed.`)}>Yes, remove</Button>
                            <Button onClick={() => setConfirmDelete(null)}>Keep</Button>
                          </>
                        ) : (
                          <Button variant="danger" icon={faTrash} onClick={() => setConfirmDelete(u.id)}>Remove</Button>
                        )}
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {editing && (
        <StaffForm
          user={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(message) => {
            setEditing(null);
            setNotice(message);
            load();
          }}
        />
      )}
    </div>
  );
};

export default StaffView;
