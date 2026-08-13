import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';

export default function AdminLoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/admin/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, selectedCity || null);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-between bg-linear-to-br from-[#0b241b] via-[#0b2e21] to-[#0a3827] px-3 py-6 sm:px-4 sm:py-8 text-white font-['DM_Sans',sans-serif]">
      {/* Header logo link */}
      <div className="mx-auto w-full max-w-md pt-2 sm:pt-4">
        <Link to="/" className="flex items-center justify-center gap-2.5 font-['Manrope'] text-xl sm:text-2xl font-black text-white">
          <span className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl bg-[#0f7b4f] font-black text-[#dff46b] text-lg sm:text-xl shadow-lg shrink-0">
            M
          </span>
          <span>
            MyAuto<span className="text-[#0f7b4f]">Scrap</span>
          </span>
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="mx-auto my-6 w-full max-w-md rounded-2xl sm:rounded-3xl border border-white/10 bg-white p-4 sm:p-8 text-slate-900 shadow-2xl backdrop-blur-md">
        <div className="mb-4 sm:mb-6 text-center">
          <span className="inline-block rounded-full bg-[#edf7f2] px-3 py-1 text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#0f7b4f]">
            🛡️ Admin & City Dealer Portal
          </span>
          <h1 className="mt-2 sm:mt-3 text-xl sm:text-2xl font-black text-slate-900 font-['Manrope']">
            Sign in to Dashboard
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Enter your account credentials to access your administration portal.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl sm:rounded-2xl border border-red-200 bg-red-50 p-3 sm:p-4 text-xs font-bold text-red-800 break-words">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
          <div>
            <label className="mb-1 block text-xs font-extrabold text-gray-700" htmlFor="admin-email">
              Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dealer@myautoscrap.co.uk"
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-[#0f7b4f] focus:bg-white focus:shadow-[0_0_0_3px_rgba(15,123,79,0.15)]"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-extrabold text-gray-700" htmlFor="admin-password">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-[#0f7b4f] focus:bg-white focus:shadow-[0_0_0_3px_rgba(15,123,79,0.15)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-xl border-0 bg-[#0f7b4f] py-3 text-sm sm:py-3.5 font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#075b3a] disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>
      </div>

      {/* Footer link */}
      <div className="mx-auto text-center text-xs text-[#c8ded4]">
        <Link to="/" className="hover:underline">← Return to MyAutoScrap Public Site</Link>
      </div>
    </div>
  );
}
