import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  fetchUsers,
  createDealerUser,
  deleteDealerUser,
  updateDealerCoverage,
} from '../../services/adminStore';
import { showToast } from './ToastContainer';
import DeleteConfirmationModal from './DeleteConfirmationModal';

export default function UserManagementSection() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Filter state for Existing Accounts
  const [searchQuery, setSearchQuery] = useState('');

  // Track expanded postcodes per user ID in table / card view
  const [expandedAccounts, setExpandedAccounts] = useState({});

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Edit coverage modal state
  const [coverageModalOpen, setCoverageModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [editPostcodes, setEditPostcodes] = useState([]);
  const [editPostcodeInput, setEditPostcodeInput] = useState('');
  const [modalFilter, setModalFilter] = useState('');
  const [savingCoverage, setSavingCoverage] = useState(false);

  // Form states (Create Account)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [accountRole, setAccountRole] = useState('City Dealer'); // 'City Dealer' or 'Super Admin'
  const [postcodeInput, setPostcodeInput] = useState('');
  const [coveredPostcodes, setCoveredPostcodes] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const usersData = await fetchUsers();
      setUsers(usersData || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper to parse comma, space, semicolon, or newline-separated postcode tokens
  const parsePostcodeTokens = (raw) => {
    if (!raw || typeof raw !== 'string') return [];
    return raw
      .split(/[\s,;]+/)
      .map((token) => token.trim().toUpperCase())
      .filter((token) => token.length >= 2);
  };

  const toggleExpandAccount = (userId) => {
    setExpandedAccounts((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  // Add postcodes to Create Account form (supports bulk paste)
  const handleAddPostcode = (e) => {
    if (e) e.preventDefault();
    const tokens = parsePostcodeTokens(postcodeInput);
    if (tokens.length === 0) return;

    const newTokens = tokens.filter((t) => !coveredPostcodes.includes(t));
    if (newTokens.length > 0) {
      setCoveredPostcodes([...coveredPostcodes, ...newTokens]);
      setPostcodeInput('');
    }
  };

  const handleRemovePostcode = (code) => {
    setCoveredPostcodes(coveredPostcodes.filter((p) => p !== code));
  };

  // Add postcodes to Edit Coverage Modal (supports bulk paste)
  const handleAddEditPostcode = (e) => {
    if (e) e.preventDefault();
    const tokens = parsePostcodeTokens(editPostcodeInput);
    if (tokens.length === 0) return;

    const newTokens = tokens.filter((t) => !editPostcodes.includes(t));
    if (newTokens.length > 0) {
      setEditPostcodes([...editPostcodes, ...newTokens]);
      setEditPostcodeInput('');
    }
  };

  const handleRemoveEditPostcode = (code) => {
    setEditPostcodes(editPostcodes.filter((p) => p !== code));
  };

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
        role: accountRole,
        coveredPostcodes: accountRole === 'City Dealer' ? coveredPostcodes : [],
      });

      setUsers(updatedList);
      const msg =
        accountRole === 'City Dealer'
          ? `Dealer account created for ${email}! Coverage: ${
              coveredPostcodes.length > 0 ? `${coveredPostcodes.length} districts` : 'All/Unrestricted'
            }.`
          : `Super Administrator account created for ${email}!`;
      setSuccess(msg);
      showToast(msg, 'success');

      // Reset form
      setEmail('');
      setPassword('');
      setName('');
      setCoveredPostcodes([]);
      setPostcodeInput('');
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

  const openCoverageModal = (user) => {
    setUserToEdit(user);
    setEditPostcodes(user.coveredPostcodes || []);
    setEditPostcodeInput('');
    setModalFilter('');
    setCoverageModalOpen(true);
  };

  const handleSaveCoverage = async () => {
    if (!userToEdit) return;
    setSavingCoverage(true);
    try {
      const updatedList = await updateDealerCoverage(userToEdit.id, {
        coveredPostcodes: editPostcodes,
      });
      setUsers(updatedList);
      showToast(
        `Updated coverage for ${userToEdit.name || userToEdit.email} (${editPostcodes.length} districts)`,
        'success'
      );
      setCoverageModalOpen(false);
      setUserToEdit(null);
    } catch (err) {
      showToast(err.message || 'Failed to update coverage.', 'error');
    } finally {
      setSavingCoverage(false);
    }
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

  // Filtered accounts based on search query (name, email, role, or postcodes)
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase().trim();
    return users.filter((u) => {
      const nameMatch = (u.name || '').toLowerCase().includes(query);
      const emailMatch = (u.email || '').toLowerCase().includes(query);
      const roleMatch = (u.role || '').toLowerCase().includes(query);
      const postcodeMatch = (u.coveredPostcodes || []).some((code) =>
        code.toLowerCase().includes(query)
      );
      return nameMatch || emailMatch || roleMatch || postcodeMatch;
    });
  }, [users, searchQuery]);

  // Modal filtered & sorted postcodes
  const modalFilteredPostcodes = useMemo(() => {
    const list = [...editPostcodes].sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
    if (!modalFilter.trim()) return list;
    const q = modalFilter.toLowerCase().trim();
    return list.filter((p) => p.toLowerCase().includes(q));
  }, [editPostcodes, modalFilter]);

  // Render responsive postcode badges (with preview chips and inline scroll tray)
  const renderPostcodeCoverage = (u, isMobile = false) => {
    if (u.role !== 'City Dealer') return null;

    const postcodes = u.coveredPostcodes || [];
    const count = postcodes.length;

    if (count === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 italic">
          🌐 Nationwide (All Districts)
        </span>
      );
    }

    const isExpanded = !!expandedAccounts[u.id];
    const sortedPostcodes = [...postcodes].sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );

    // If 3 or fewer postcodes, show all directly
    if (count <= 3) {
      return (
        <div className="flex flex-wrap items-center gap-1 mt-1">
          {sortedPostcodes.map((dist) => (
            <span
              key={dist}
              className="inline-flex items-center rounded-md bg-blue-50 border border-blue-200/90 px-1.5 py-0.5 text-[10px] font-extrabold text-blue-800"
            >
              📮 {dist}
            </span>
          ))}
        </div>
      );
    }

    // 4 or more postcodes (e.g., 48 codes):
    // Show summary badge, first 3 preview chips, and interactive "+X more" toggle
    const previewCodes = sortedPostcodes.slice(0, 3);
    const remainingCount = count - previewCodes.length;

    return (
      <div className="w-full space-y-1.5 mt-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-100/90 border border-blue-300 px-2 py-0.5 text-[10px] font-black text-blue-900 shadow-2xs">
            📍 {count} Districts
          </span>

          {previewCodes.map((dist) => (
            <span
              key={dist}
              className="inline-flex items-center rounded-md bg-blue-50 border border-blue-200/80 px-1.5 py-0.5 text-[10px] font-extrabold text-blue-800"
            >
              📮 {dist}
            </span>
          ))}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpandAccount(u.id);
            }}
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black transition cursor-pointer active:scale-95 border ${
              isExpanded
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
            title={isExpanded ? 'Collapse district list' : `View all ${count} districts inline`}
          >
            {isExpanded ? '▲ Hide' : `+${remainingCount} more ▾`}
          </button>
        </div>

        {/* Expanded inline scrollable chip drawer */}
        {isExpanded && (
          <div className="rounded-xl border border-blue-200/90 bg-gradient-to-b from-blue-50/70 to-slate-50/80 p-2.5 text-xs shadow-inner animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-blue-200/60 text-[11px] font-extrabold text-blue-900">
              <span>All {count} Assigned Districts:</span>
              <button
                type="button"
                onClick={() => openCoverageModal(u)}
                className="text-[10px] text-blue-700 hover:text-blue-900 font-black hover:underline cursor-pointer flex items-center gap-0.5"
              >
                <span>Edit in Modal</span>
                <span>↗</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto pr-1">
              {sortedPostcodes.map((dist) => (
                <span
                  key={dist}
                  className="inline-flex items-center rounded-md bg-white border border-blue-200/80 px-1.5 py-0.5 text-[9px] font-extrabold text-blue-800 shadow-2xs"
                >
                  📮 {dist}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="rounded-2xl sm:rounded-3xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5 text-[#0b2e21] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl">👤</span>
          <div>
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider font-['Manrope']">
              Dealer Account Manager
            </h2>
            <p className="text-xs text-[#0f7b4f] font-medium leading-relaxed">
              Super Administrators can create dedicated portal accounts for Dealers by outward postcode districts across the UK or manage existing credentials.
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
              ➕ Create New Account
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Generate login credentials and configure outward district postcode coverage.
            </p>
          </div>

          <form onSubmit={handleCreateAccount} className="space-y-3.5">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Account Type
              </label>
              <select
                value={accountRole}
                onChange={(e) => setAccountRole(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#0f7b4f] focus:bg-white"
              >
                <option value="City Dealer">🏷️ Dealer Account (Postcode Coverage)</option>
                <option value="Super Admin">🛡️ Super Administrator (Full System Access)</option>
              </select>
            </div>

            {accountRole === 'City Dealer' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-extrabold text-slate-700">
                    Covered Outward Districts
                  </label>
                  <span className="text-[10px] text-gray-400 font-semibold">e.g. PE1, PE2, CB1</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={postcodeInput}
                    onChange={(e) => setPostcodeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddPostcode();
                      }
                    }}
                    placeholder="Type or paste (e.g. PE1, PE2, CB1)"
                    className="flex-1 rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2 text-xs font-medium uppercase outline-none focus:border-[#0f7b4f] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddPostcode}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition cursor-pointer shrink-0"
                  >
                    ➕ Add
                  </button>
                </div>

                {coveredPostcodes.length > 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 mt-2 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                      <span>Assigned Districts ({coveredPostcodes.length})</span>
                      <button
                        type="button"
                        onClick={() => setCoveredPostcodes([])}
                        className="text-red-600 hover:underline text-[10px] font-bold cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto pr-1">
                      {coveredPostcodes.map((dist) => (
                        <span
                          key={dist}
                          className="inline-flex items-center gap-1 rounded-md bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-900"
                        >
                          <span>📮 {dist}</span>
                          <button
                            type="button"
                            onClick={() => handleRemovePostcode(dist)}
                            className="text-emerald-700 hover:text-red-600 font-black cursor-pointer ml-0.5"
                            title={`Remove ${dist}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 italic mt-1.5">
                    No districts added. (Dealer will have nationwide or unrestricted access unless specified).
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Account Name / Label
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  accountRole === 'City Dealer'
                    ? coveredPostcodes.length > 0
                      ? `${coveredPostcodes.slice(0, 3).join('/')} Dealer`
                      : 'Dealer Name'
                    : 'Super Administrator'
                }
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
                placeholder={
                  accountRole === 'City Dealer' ? 'dealer@myautoscrap.co.uk' : 'admin@myautoscrap.co.uk'
                }
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-xs font-medium outline-none focus:border-[#0f7b4f] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={4}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set password (min 4 chars)"
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 pr-10 text-xs font-medium outline-none focus:border-[#0f7b4f] focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-slate-700 transition cursor-pointer"
                >
                  {showPassword ? (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full cursor-pointer rounded-xl bg-[#0f7b4f] py-3 text-xs font-black text-white shadow-md transition hover:bg-[#075b3a] active:scale-98 disabled:opacity-50"
            >
              {submitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>

        {/* Existing Accounts Section */}
        <div className="lg:col-span-7 rounded-2xl sm:rounded-3xl border border-gray-200 bg-white p-4 sm:p-6 shadow-xs space-y-4">
          {/* Header & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 font-['Manrope']">
                  📋 Existing Registered Accounts
                </h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-700">
                  {users.length}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Active admin & dealer credentials with assigned district coverage.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                title="Refresh List"
                aria-label="Refresh Dealer Accounts List"
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-extrabold text-[#0f7b4f] hover:bg-emerald-100 transition cursor-pointer disabled:opacity-50 shrink-0"
              >
                <svg
                  className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Quick Search / Filter Bar */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, role, or postcode (e.g. PE1)..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/70 pl-8 pr-8 py-2 text-xs font-medium outline-none focus:border-[#0f7b4f] focus:bg-white transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold text-xs cursor-pointer"
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {searchQuery && (
            <div className="text-[11px] font-bold text-slate-500 flex items-center justify-between">
              <span>
                Found {filteredUsers.length} of {users.length} accounts
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-emerald-700 hover:underline cursor-pointer"
              >
                Show all
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* MOBILE VIEW: Modern Account Cards (visible on md:hidden) */}
          {/* ========================================================= */}
          <div className="md:hidden space-y-3">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-2xl text-xs font-medium">
                {users.length === 0
                  ? 'No registered accounts found.'
                  : 'No accounts match your search query.'}
              </div>
            ) : (
              filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="rounded-2xl border border-gray-200 bg-white p-3.5 shadow-xs space-y-3 hover:border-gray-300 transition"
                >
                  {/* Top: Avatar, Name, Email, Role */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-xs font-black text-slate-700 border border-slate-200/80">
                        {u.name ? u.name.trim().charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-extrabold text-slate-900 text-xs truncate">
                          {u.name || 'Unnamed Account'}
                        </div>
                        <div className="text-[11px] font-mono text-gray-500 truncate">
                          {u.email}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {u.role === 'City Dealer' ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 border border-blue-300 px-2 py-0.5 text-[9px] font-black text-blue-900 uppercase">
                          🏷️ Dealer
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[9px] font-black text-emerald-900 uppercase">
                          🛡️ Admin
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle: Postcode Coverage Details */}
                  {u.role === 'City Dealer' && (
                    <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-2.5 space-y-1">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                        District Coverage
                      </div>
                      {renderPostcodeCoverage(u, true)}
                    </div>
                  )}

                  {/* Deactivated Status */}
                  {u.isActive === false && (
                    <div className="inline-flex items-center gap-1 rounded-md bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-extrabold text-red-700">
                      🔒 Account Deactivated
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                    {String(u.id) === String(currentUser?.id) ? (
                      <span className="w-full text-center py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-[#0f7b4f]">
                        👤 You (Active Session)
                      </span>
                    ) : (
                      <>
                        {u.role === 'City Dealer' && (
                          <button
                            type="button"
                            onClick={() => openCoverageModal(u)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition active:scale-95 cursor-pointer"
                          >
                            📮 Edit Coverage ({u.coveredPostcodes?.length || 0})
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openDeleteModal(u)}
                          className="inline-flex items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition active:scale-95 cursor-pointer shrink-0"
                        >
                          🗑️ Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ========================================================= */}
          {/* DESKTOP VIEW: Clean, Proportional Table (hidden on mobile) */}
          {/* ========================================================= */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200/80">
            <table className="w-full text-left text-xs table-fixed">
              <colgroup>
                <col className="w-4/12" />
                <col className="w-5/12" />
                <col className="w-3/12" />
              </colgroup>
              <thead className="border-b border-gray-200 bg-gray-50/80 font-extrabold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-3.5 py-3">Account / User</th>
                  <th className="px-3.5 py-3">Role / Postcode Coverage</th>
                  <th className="px-3.5 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-4 py-8 text-center text-gray-400">
                      {users.length === 0
                        ? 'No registered accounts found.'
                        : 'No accounts match your search query.'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition align-top">
                      <td className="px-3.5 py-3.5">
                        <div className="font-extrabold text-slate-900">{u.name || 'Unnamed Account'}</div>
                        <div className="text-[11px] font-mono text-gray-500 truncate" title={u.email}>
                          {u.email}
                        </div>
                        {u.isActive === false && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.2 text-[9px] font-extrabold text-red-700 mt-1">
                            🔒 Deactivated
                          </span>
                        )}
                      </td>

                      <td className="px-3.5 py-3.5">
                        <div className="flex flex-col items-start gap-1">
                          {u.role === 'City Dealer' ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 border border-blue-300 px-2 py-0.5 text-[10px] font-black text-blue-900 uppercase">
                              🏷️ Dealer Account
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-black text-emerald-900 uppercase">
                              🛡️ Super Admin
                            </span>
                          )}

                          {renderPostcodeCoverage(u, false)}
                        </div>
                      </td>

                      <td className="px-3.5 py-3.5 text-right whitespace-nowrap">
                        {String(u.id) === String(currentUser?.id) ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[10px] font-bold text-[#0f7b4f]">
                            👤 You (Active Session)
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {u.role === 'City Dealer' && (
                              <button
                                type="button"
                                onClick={() => openCoverageModal(u)}
                                className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-extrabold text-blue-700 hover:bg-blue-100 transition cursor-pointer active:scale-95"
                                title="Edit Outward District Postcode Coverage"
                              >
                                📮 Coverage ({u.coveredPostcodes?.length || 0})
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => openDeleteModal(u)}
                              className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-extrabold text-red-700 hover:bg-red-100 transition cursor-pointer active:scale-95"
                            >
                              🗑️ Remove
                            </button>
                          </div>
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

      {/* Edit Coverage Modal */}
      {coverageModalOpen && userToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl sm:rounded-3xl border border-gray-200 bg-white p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900 font-['Manrope']">
                    📮 Edit Postcode Coverage
                  </h3>
                  <span className="rounded-md bg-blue-100 border border-blue-300 px-2 py-0.5 text-[10px] font-black text-blue-900">
                    {editPostcodes.length} Districts
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  Manage outward districts for{' '}
                  <span className="font-bold text-slate-800">
                    {userToEdit.name || userToEdit.email}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCoverageModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-black text-xl cursor-pointer p-1"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 overflow-y-auto pr-1 flex-1">
              {/* Add New Outward Districts Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold text-slate-700">
                    Add Outward Districts
                  </label>
                  <span className="text-[10px] text-gray-400 font-semibold">
                    Paste comma or space separated (e.g. PE1, PE2, CB1)
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editPostcodeInput}
                    onChange={(e) => setEditPostcodeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddEditPostcode();
                      }
                    }}
                    placeholder="Type or paste districts (e.g. PE2, SW1A, CB23)"
                    className="flex-1 rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2 text-xs font-medium uppercase outline-none focus:border-[#0f7b4f] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddEditPostcode}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition cursor-pointer shrink-0"
                  >
                    ➕ Add
                  </button>
                </div>
              </div>

              {/* Assigned Districts Container */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-600">
                  <span>Assigned Districts ({editPostcodes.length}):</span>
                  {editPostcodes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setEditPostcodes([])}
                      className="text-red-600 hover:underline font-bold text-[10px] cursor-pointer"
                    >
                      Clear All Districts
                    </button>
                  )}
                </div>

                {/* Filter within assigned postcodes if > 6 */}
                {editPostcodes.length > 6 && (
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                      🔍
                    </span>
                    <input
                      type="text"
                      value={modalFilter}
                      onChange={(e) => setModalFilter(e.target.value)}
                      placeholder={`Filter ${editPostcodes.length} assigned districts...`}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-7 pr-7 py-1.5 text-xs font-medium outline-none focus:border-[#0f7b4f] focus:bg-white uppercase"
                    />
                    {modalFilter && (
                      <button
                        type="button"
                        onClick={() => setModalFilter('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold text-xs cursor-pointer"
                      >
                        ×
                      </button>
                    )}
                  </div>
                )}

                {editPostcodes.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl max-h-52 overflow-y-auto">
                    {modalFilteredPostcodes.length === 0 ? (
                      <div className="w-full py-4 text-center text-xs text-gray-400 font-medium">
                        No districts match &quot;{modalFilter}&quot;.
                      </div>
                    ) : (
                      modalFilteredPostcodes.map((dist) => (
                        <span
                          key={dist}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-100 border border-blue-300 px-2 py-1 text-xs font-black text-blue-900 shadow-2xs"
                        >
                          <span>📮 {dist}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveEditPostcode(dist)}
                            className="text-blue-700 hover:text-red-600 font-black cursor-pointer text-sm leading-none"
                            title={`Remove ${dist}`}
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center text-xs text-gray-400 font-medium">
                    No districts assigned. Dealer will not receive standard scrap leads unless unrestricted.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setCoverageModalOpen(false)}
                className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCoverage}
                disabled={savingCoverage}
                className="rounded-xl bg-[#0f7b4f] px-5 py-2 text-xs font-black text-white hover:bg-[#075b3a] transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {savingCoverage ? 'Saving Coverage...' : `Save Coverage (${editPostcodes.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={`Delete Account?`}
        subtitle="Account Revocation Confirmation"
        warningText={
          userToDelete
            ? `The account for ${userToDelete.name} (${userToDelete.email} - ${userToDelete.role}${
                userToDelete.coveredPostcodes?.length > 0
                  ? ` / ${userToDelete.coveredPostcodes.length} Districts: ${userToDelete.coveredPostcodes.join(', ')}`
                  : ''
              }) will be permanently deleted from the database.`
            : 'This account will be permanently deleted.'
        }
        onConfirm={handleConfirmDeleteUser}
      />
    </div>
  );
}
