import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { changeUserPassword, updateUserProfile } from '../../services/adminStore';
import { showToast } from './ToastContainer';

export default function AccountSettingsSection() {
  const { user, updateUser } = useAuth();

  // Profile name state
  const [name, setName] = useState(user?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Keep name in sync with user state
  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

  const hasNameChanged = name.trim() !== (user?.name || '').trim();

  // Handle name update independently
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileError('');

    const trimmed = name.trim();
    if (!trimmed) {
      setProfileError('Display name cannot be empty.');
      showToast('Display name cannot be empty.', 'error');
      return;
    }

    if (trimmed.length > 100) {
      setProfileError('Display name cannot exceed 100 characters.');
      showToast('Display name cannot exceed 100 characters.', 'error');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await updateUserProfile(trimmed);
      if (res.user) {
        updateUser(res.user);
      }
      showToast('Display name updated successfully!', 'success');
    } catch (err) {
      const msg = err.message || 'Failed to update display name.';
      setProfileError(msg);
      showToast(msg, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle password change (and updates name simultaneously if changed)
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      showToast('Please enter your current password.', 'error');
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      setPasswordError('New password must be at least 4 characters long.');
      showToast('New password must be at least 4 characters long.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      showToast('New password and confirm password do not match.', 'error');
      return;
    }

    setSubmittingPassword(true);
    try {
      const res = await changeUserPassword(currentPassword, newPassword, name.trim());
      if (res.user) {
        updateUser(res.user);
      }
      showToast('Your account details and password have been successfully updated!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err.message || 'Failed to update password.';
      setPasswordError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmittingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Info Banner */}
      <div className="rounded-2xl sm:rounded-3xl border border-gray-200 bg-white p-5 shadow-xs flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-3xl shrink-0">
            {user?.avatar || '🔒'}
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 font-['Manrope']">
              {user?.name || 'Account Settings'}
            </h2>
            <p className="text-xs font-mono text-gray-500">{user?.email}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="inline-block rounded-md bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-[#0f7b4f] uppercase tracking-wider">
                {user?.role}
              </span>
              {user?.assignedCity && (
                <span className="inline-block rounded-md bg-amber-100 px-2.5 py-0.5 text-[10px] font-black text-amber-900 uppercase tracking-wider">
                  📍 {user.assignedCity} Territory
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Status</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Active Account
          </span>
        </div>
      </div>

      {/* Profile Details Card */}
      <div className="rounded-2xl sm:rounded-3xl border border-gray-200 bg-white p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 font-['Manrope'] flex items-center gap-2">
              <span>👤</span> Personal Profile Details
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Update your display name as shown across the admin dashboard and notifications.
            </p>
          </div>
          {hasNameChanged && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-bold text-amber-800">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span> Unsaved name changes
            </span>
          )}
        </div>

        {profileError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
            {profileError}
          </div>
        )}

        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Full Name / Display Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-xs font-medium outline-none transition focus:border-[#0f7b4f] focus:bg-white focus:shadow-[0_0_0_3px_rgba(15,123,79,0.1)]"
                />
              </div>
              <p className="mt-1 text-[11px] text-gray-400">
                Visible in the dashboard header, bids, and dealer logs.
              </p>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-xs font-medium text-gray-500 cursor-not-allowed outline-none select-none"
                />
              </div>
              <p className="mt-1 text-[11px] text-gray-400">
                Primary login credential (managed by administrator).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={savingProfile || !name.trim() || !hasNameChanged}
              className="cursor-pointer rounded-xl bg-[#0f7b4f] px-6 py-2.5 text-xs font-black text-white shadow-md transition hover:bg-[#075b3a] active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {savingProfile ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving Name...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Update Display Name</span>
                </>
              )}
            </button>

            {hasNameChanged && (
              <button
                type="button"
                onClick={() => setName(user?.name || '')}
                className="cursor-pointer rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 active:scale-98 transition"
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="rounded-2xl sm:rounded-3xl border border-gray-200 bg-white p-5 sm:p-7 shadow-xs space-y-5">
        <div className="border-b border-gray-100 pb-4">
          <h3 className="text-base font-black text-slate-900 font-['Manrope'] flex items-center gap-2">
            <span>🔐</span> Change Password
          </h3>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            To change your password, enter your current actual password for security verification.
          </p>
        </div>

        {passwordError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
            {passwordError}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1">
              Current Password (Required) *
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current actual password"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 pr-11 text-xs font-medium outline-none transition focus:border-[#0f7b4f] focus:bg-white focus:shadow-[0_0_0_3px_rgba(15,123,79,0.1)]"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                tabIndex={-1}
                aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-slate-700 transition cursor-pointer"
              >
                {showCurrentPassword ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  minLength={4}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 pr-11 text-xs font-medium outline-none transition focus:border-[#0f7b4f] focus:bg-white focus:shadow-[0_0_0_3px_rgba(15,123,79,0.1)]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  tabIndex={-1}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-slate-700 transition cursor-pointer"
                >
                  {showNewPassword ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={4}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 pr-11 text-xs font-medium outline-none transition focus:border-[#0f7b4f] focus:bg-white focus:shadow-[0_0_0_3px_rgba(15,123,79,0.1)]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-slate-700 transition cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submittingPassword}
            className="cursor-pointer rounded-xl bg-[#0f7b4f] px-6 py-3 text-xs font-black text-white shadow-md transition hover:bg-[#075b3a] active:scale-98 disabled:opacity-50 flex items-center gap-2"
          >
            {submittingPassword ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <span>🔒</span>
                <span>Update Account Password</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
