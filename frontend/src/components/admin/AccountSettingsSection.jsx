import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { changeUserPassword } from '../../services/adminStore';
import { showToast } from './ToastContainer';

export default function AccountSettingsSection() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentPassword) {
      setError('Please enter your current password.');
      showToast('Please enter your current password.', 'error');
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      setError('New password must be at least 4 characters long.');
      showToast('New password must be at least 4 characters long.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      showToast('New password and confirm password do not match.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await changeUserPassword(currentPassword, newPassword);
      showToast('Your password has been successfully updated!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err.message || 'Failed to update password.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Info Banner */}
      <div className="rounded-2xl sm:rounded-3xl border border-gray-200 bg-white p-5 shadow-xs flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-2xl shrink-0">
          {user?.avatar || '🔒'}
        </div>
        <div>
          <h2 className="text-base font-black text-slate-900 font-['Manrope']">
            {user?.name || 'Account Settings'}
          </h2>
          <p className="text-xs font-mono text-gray-500">{user?.email}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-[#0f7b4f] uppercase">
              {user?.role}
            </span>
            {user?.assignedCity && (
              <span className="inline-block rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-900 uppercase">
                📍 {user.assignedCity} Territory
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="rounded-2xl sm:rounded-3xl border border-gray-200 bg-white p-5 sm:p-7 shadow-xs space-y-5">
        <div>
          <h3 className="text-base font-black text-slate-900 font-['Manrope']">
            🔐 Change Password
          </h3>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            To change your password, first enter your current actual password for security verification.
          </p>
        </div>


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
            disabled={submitting}
            className="cursor-pointer rounded-xl bg-[#0f7b4f] px-6 py-3 text-xs font-black text-white shadow-md transition hover:bg-[#075b3a] active:scale-98 disabled:opacity-50"
          >
            {submitting ? 'Updating Password...' : '🔒 Update Account Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
