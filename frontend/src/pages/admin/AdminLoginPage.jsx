import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';

export default function AdminLoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const defaultDestination = '/admin/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(defaultDestination, { replace: true });
      return;
    }

    const searchParams = new URLSearchParams(location.search);
    const emailParam = searchParams.get('email');
    const passwordParam = searchParams.get('password');

    if (emailParam) {
      setEmail(emailParam);
    }
    if (passwordParam) {
      setPassword(passwordParam);
    }
  }, [isAuthenticated, location.search, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, selectedCity || null);
      navigate(defaultDestination, { replace: true });
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
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 pr-10 sm:px-4 sm:py-3 sm:pr-11 text-sm font-medium text-slate-900 outline-none transition focus:border-[#0f7b4f] focus:bg-white focus:shadow-[0_0_0_3px_rgba(15,123,79,0.15)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-slate-700 transition cursor-pointer"
              >
                {showPassword ? (
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
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
