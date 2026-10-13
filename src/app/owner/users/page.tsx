'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  UserPlus,
  Edit,
  Trash2,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Lock,
  Sparkles,
} from 'lucide-react';
import ConfirmationModal from '@/components/owner/ConfirmationModal';

interface UserAccount {
  id: string;
  email: string;
  username: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function OwnerUsersPage() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Add/Edit User Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userIdToEdit, setUserIdToEdit] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('ADMIN');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/owner/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else {
        setError('Failed to load user accounts.');
      }
    } catch (e) {
      console.error('Error fetching users:', e);
      setError('Network error fetching users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setUserIdToEdit(null);
    setFormName('');
    setFormEmail('');
    setFormUsername('');
    setFormPassword('');
    setFormRole('ADMIN');
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (user: UserAccount) => {
    setIsEditing(true);
    setUserIdToEdit(user.id);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormUsername(user.username);
    setFormPassword('');
    setFormRole(user.role);
    setError(null);
    setModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFormSubmitting(true);

    try {
      if (isEditing && userIdToEdit) {
        const res = await fetch('/api/owner/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: userIdToEdit,
            name: formName,
            email: formEmail,
            role: formRole,
            password: formPassword || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to update account.');
          setFormSubmitting(false);
          return;
        }
        setNotice(`Account updated successfully!`);
      } else {
        const res = await fetch('/api/owner/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            email: formEmail,
            username: formUsername,
            password: formPassword,
            role: formRole,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to create staff account.');
          setFormSubmitting(false);
          return;
        }
        setNotice(`Created new staff account: ${data.user.username}`);
      }

      setModalOpen(false);
      setTimeout(() => setNotice(null), 3500);
      await fetchUsers();
    } catch (err) {
      console.error('Save user error:', err);
      setError('An unexpected error occurred.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/owner/users?id=${userToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok) {
        setNotice(`Deleted account: ${userToDelete.username}`);
        setTimeout(() => setNotice(null), 3000);
        setDeleteModalOpen(false);
        setUserToDelete(null);
        await fetchUsers();
      } else {
        setError(data.error || 'Failed to delete user.');
        setDeleteModalOpen(false);
      }
    } catch (e) {
      console.error('Delete user error:', e);
      setError('Network error deleting user.');
      setDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#C5A059]">
            ACCESS CONTROL
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#111113] dark:text-[#FAF8F5] uppercase tracking-tight">
            User & Role Management
          </h2>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
            Manage administrative personnel, assign roles, and audit security permissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            className="flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-[6px] text-xs font-bold bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] hover:text-[#C5A059] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#C5A059]' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 min-h-[38px] px-4 py-1.5 rounded-[6px] text-xs font-black uppercase tracking-wider text-black bg-[#C5A059] hover:bg-[#B38F46] transition-all shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Staff Account</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3 rounded-[8px] bg-[#ECFDF5] dark:bg-[#062D20] border border-[#A7F3D0] dark:border-[#065F46] text-xs text-[#047857] dark:text-[#6EE7B7] flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-[8px] bg-[#FEF2F2] dark:bg-[#2A1212] border border-[#FECACA] dark:border-[#521C1C] flex items-center gap-2.5 text-xs text-[#DC2626] dark:text-[#F87171]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Single Owner Policy Banner */}
      <div className="p-4 rounded-[10px] bg-[#FAF8F5] dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] flex items-start gap-3 shadow-xs">
        <div className="w-8 h-8 rounded-full bg-[#ECFDF5] dark:bg-[#064E3B]/40 text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]">
            Single-Owner Authorization Model Active
          </h4>
          <p className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
            There is only ONE primary Owner account authorized to manage core site settings and roles. Public users cannot register as Owner, and all API authorization checks are verified directly against PostgreSQL server-side.
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[10px] overflow-hidden shadow-subtle">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#71717A] animate-pulse space-y-2">
            <div className="inline-block w-6 h-6 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
            <div>Loading accounts...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] dark:bg-[#1C1C20] border-b border-[#EAE3D5] dark:border-[#2E2E33] text-[10px] font-black uppercase text-[#8C8275] dark:text-[#A1A1AA]">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE3D5] dark:divide-[#2E2E33]">
                {users.map((u) => {
                  const isOwner = u.role === 'OWNER' || u.role === 'SUPER_ADMIN';

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-[#FAF8F5]/60 dark:hover:bg-[#1C1C20]/60 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#111113] dark:text-[#FAF8F5]">
                          {u.name}
                        </div>
                        <div className="text-[10px] text-[#8C8275] font-mono">
                          @{u.username}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-[#5C5449] dark:text-[#D4D4D8] font-mono">
                        {u.email}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-[4px] border ${
                            u.role === 'OWNER'
                              ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A] dark:bg-[#78350F]/40 dark:text-[#FCD34D]'
                              : u.role === 'SUPER_ADMIN'
                              ? 'bg-[#EDE9FE] text-[#6D28D9] border-[#DDD6FE]'
                              : 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]'
                          }`}
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{u.role}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-[11px] text-[#71717A]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 rounded text-[#71717A] hover:text-[#111113] dark:hover:text-white hover:bg-[#FAF8F5] dark:hover:bg-[#1C1C20] transition-colors"
                            title="Edit Account"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {u.role !== 'OWNER' && (
                            <button
                              onClick={() => {
                                setUserToDelete(u);
                                setDeleteModalOpen(true);
                              }}
                              className="p-1.5 rounded text-[#71717A] hover:text-[#DC2626] hover:bg-[#FEF2F2] dark:hover:bg-[#2A1515] transition-colors"
                              title="Delete Staff Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit User Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[10px] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE3D5] dark:border-[#2E2E33]">
              <h3 className="text-sm font-black text-[#111113] dark:text-[#FAF8F5] uppercase">
                {isEditing ? 'Edit Staff Account' : 'Create Staff Member'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-[#71717A] hover:text-[#111113] dark:hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[#8C8275]">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full min-h-[38px] px-3 py-1.5 rounded-[6px] text-xs font-bold bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[#8C8275]">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. staff@numberlive.in"
                  className="w-full min-h-[38px] px-3 py-1.5 rounded-[6px] text-xs font-bold bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              {!isEditing && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-[#8C8275]">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="e.g. johndoe"
                    className="w-full min-h-[38px] px-3 py-1.5 rounded-[6px] text-xs font-mono bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[#8C8275]">
                  {isEditing ? 'Reset Password (Leave blank to keep unchanged)' : 'Password (Min 8 characters) *'}
                </label>
                <input
                  type="password"
                  required={!isEditing}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full min-h-[38px] px-3 py-1.5 rounded-[6px] text-xs bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[#8C8275]">
                  Role Assignment
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full min-h-[38px] px-3 py-1.5 rounded-[6px] text-xs font-bold bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="ADMIN">ADMIN (Full Workflow Access)</option>
                  <option value="EDITOR">EDITOR (Results Entry)</option>
                  <option value="USER">USER (Standard Member)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EAE3D5] dark:border-[#2E2E33]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-2 rounded text-xs font-bold text-[#71717A] hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 rounded text-xs font-black uppercase tracking-wider text-black bg-[#C5A059] hover:bg-[#B38F46] disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : isEditing ? 'Update Account' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Staff Account"
        message={`Are you sure you want to delete the account for ${userToDelete?.name} (@${userToDelete?.username})? They will no longer have access to the management panel.`}
        confirmLabel="Delete Account"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteUser}
        onCancel={() => {
          setDeleteModalOpen(false);
          setUserToDelete(null);
        }}
      />
    </div>
  );
}
