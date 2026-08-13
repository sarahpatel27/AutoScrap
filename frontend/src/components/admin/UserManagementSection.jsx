import { useState, useEffect } from 'react';
import { TARGET_CITIES } from '../../utils/cityHelper';
import { fetchUsers, createDealerUser, deleteDealerUser } from '../../services/adminStore';
import { showToast } from './ToastContainer';
import DeleteConfirmationModal from './DeleteConfirmationModal';

export default function UserManagementSection() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [assignedCity, setAssignedCity] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const updatedList = await createDealerUser({
        email,
        password,
        name: name || undefined,
        assignedCity: assignedCity || null,
      });

      setUsers(updatedList);
      const msg = `Dealer account successfully created for ${assignedCity ? `${assignedCity} Dealer` : email}!`;
      setSuccess(msg);
      showToast(msg, 'success');

      // Reset form
      setEmail('');
      setPassword('');
      setName('');
      setAssignedCity('');
    } catch (err) {
      setError(err.message || 'Failed to create user account.');
      showToast(err.message || 'Failed to create account.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;

    setError('');
    setSuccess('');
    try {
      const updatedList = await deleteDealerUser(userToDelete.id);
      setUsers(updatedList);
      const msg = `Account for ${userToDelete.email} has been permanently deleted.`;
      setSuccess(msg);
      showToast(msg, 'success');
    } catch (err) {
      setError(err.message || 'Failed to delete account.');
      showToast(err.message || 'Failed to delete account.', 'error');
    } finally {
      setUserToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="rounded-2xl sm:rounded-3xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5 text-[#0b2e21] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl">👤</span>
          <div>
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider font-['Manrope']">
              City Dealer Account Manager
            </h2>
            <p className="text-xs text-[#0f7b4f] font-medium leading-relaxed">
              Super Administrators can create dedicated portal accounts for specific City Dealers across the UK or manage existing credentials.
            </p>
          </div>
        </div>

        <span className="rounded-xl bg-[#0f7b4f] px-3 py-1 text-xs font-black text-white shrink-0">
          {users.length} Total Accounts
        </span>
      </div>

      {/* Alert Notices */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-800">
          ⚠️ {error}
        </div>
      )}

      {/* Grid: Create Form & Accounts List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Create Account Card */}
        <div className="lg:col-span-5 rounded-2xl sm:rounded-3xl border border-gray-200 bg-white p-4 sm:p-6 shadow-xs space-y-4 h-fit">
          <div>
            <h3 className="text-base font-black text-slate-900 font-['Manrope']">
              ➕ Create New City Account
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Generate login credentials and assign to a specific city territory.
            </p>
          </div>

          <form onSubmit={handleCreateAccount} className="space-y-3.5">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Assigned City Territory
              </label>
              <select
                value={assignedCity}
                onChange={(e) => setAssignedCity(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#0f7b4f] focus:bg-white"
              >
                <option value="">🛡️ Super Administrator (All Cities Access)</option>
                {TARGET_CITIES.map((city) => (
                  <option key={city} value={city}>
                    📍 {city} Dealer
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Account Name / Label
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={assignedCity ? `${assignedCity} Dealer` : 'Admin User'}
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-xs font-medium outline-none focus:border-[#0f7b4f] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={assignedCity ? `${assignedCity.toLowerCase()}@autoscrap.co.uk` : 'admin@myautoscrap.co.uk'}
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-xs font-medium outline-none focus:border-[#0f7b4f] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                minLength={4}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Set password (min 4 chars)"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-xs font-medium outline-none focus:border-[#0f7b4f] focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full cursor-pointer rounded-xl bg-[#0f7b4f] py-3 text-xs font-black text-white shadow-md transition hover:bg-[#075b3a] active:scale-98 disabled:opacity-50"
            >
              {submitting ? 'Creating Account...' : '🚀 Generate Dealer Account'}
            </button>
          </form>
        </div>

        {/* Existing Accounts Table */}
        <div className="lg:col-span-7 rounded-2xl sm:rounded-3xl border border-gray-200 bg-white p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 font-['Manrope']">
                📋 Existing Registered Accounts
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Active admin & dealer credentials stored in database.
              </p>
            </div>

            <button
              type="button"
              onClick={loadUsers}
              disabled={loading}
              className="text-xs font-extrabold text-[#0f7b4f] hover:underline cursor-pointer"
            >
              {loading ? 'Refreshing...' : '🔄 Refresh List'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-200 bg-gray-50/80 font-extrabold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-3.5 py-3">Account / User</th>
                  <th className="px-3.5 py-3">Role / Territory</th>
                  <th className="px-3.5 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 font-medium">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-4 py-8 text-center text-gray-400">
                      No registered accounts found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="px-3.5 py-3.5">
                        <div className="font-extrabold text-slate-900">{u.name}</div>
                        <div className="text-[11px] font-mono text-gray-500">{u.email}</div>
                      </td>

                      <td className="px-3.5 py-3.5 whitespace-nowrap">
                        {u.assignedCity ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-black text-amber-900 uppercase">
                            📍 {u.assignedCity} Dealer
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-black text-emerald-900 uppercase">
                            🛡️ Super Admin
                          </span>
                        )}
                      </td>

                      <td className="px-3.5 py-3.5 text-right whitespace-nowrap">
                        {u.role !== 'Super Admin' ? (
                          <button
                            type="button"
                            onClick={() => openDeleteModal(u)}
                            className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-extrabold text-red-700 hover:bg-red-100 transition cursor-pointer"
                          >
                            🗑️ Delete
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-bold">Protected</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Account Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={`Delete Dealer Account?`}
        subtitle="Account Revocation Confirmation"
        warningText={
          userToDelete
            ? `The dealer login account for ${userToDelete.name} (${userToDelete.email}) will be permanently revoked from the database.`
            : 'This dealer account will be permanently revoked.'
        }
        onConfirm={handleConfirmDeleteUser}
      />
    </div>
  );
}
