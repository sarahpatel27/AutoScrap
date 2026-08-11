import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';

export default function AdminLoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/admin/dashboard';

  // Auto-redirect if already logged in
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
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@myautoscrap.co.uk');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="flex min-h-screen flex-col justify-between bg-linear-to-br from-[#0b241b] via-[#0b2e21] to-[#0a3827] px-4 py-8 text-white font-['DM_Sans',sans-serif]">
      {/* Header logo link */}
      <div className="mx-auto w-full max-w-md pt-4">
        <Link to="/" className="flex items-center justify-center gap-2.5 font-['Manrope'] text-2xl font-black text-white">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#0f7b4f] font-black text-[#dff46b] text-xl shadow-lg">
            M
          </span>
          <span>
            MyAuto<span className="text-[#0f7b4f]">Scrap</span>
          </span>
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white p-8 text-slate-900 shadow-2xl backdrop-blur-md">
        <div className="mb-6 text-center">
          <span className="inline-block rounded-full bg-[#edf7f2] px-3.5 py-1 text-xs font-black uppercase tracking-wider text-[#0f7b4f]">
            🛡️ Admin Portal
          </span>
          <h1 className="mt-3 text-2xl font-black text-slate-900 font-['Manrope']">
            Sign in to Dashboard
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Manage scrap car enquiries, vehicle collection scheduling, and valuation rules.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-800">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-extrabold text-gray-700" htmlFor="admin-email">
              Admin Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@myautoscrap.co.uk"
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-[#0f7b4f] focus:bg-white focus:shadow-[0_0_0_3px_rgba(15,123,79,0.15)]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-extrabold text-gray-700" htmlFor="admin-password">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-[#0f7b4f] focus:bg-white focus:shadow-[0_0_0_3px_rgba(15,123,79,0.15)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-xl border-0 bg-[#0f7b4f] py-3.5 font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#075b3a] disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        {/* Demo credentials helper */}
        <div className="mt-6 border-t border-gray-200 pt-5 text-center">
          <p className="text-xs text-gray-500">Testing mock admin access?</p>
          <button
            type="button"
            onClick={handleFillDemo}
            className="mt-2 text-xs font-extrabold text-[#0f7b4f] hover:underline"
          >
            ✨ Click here to Auto-Fill Demo Credentials
          </button>
        </div>
      </div>

      {/* Footer link */}
      <div className="mx-auto text-center text-xs text-[#c8ded4]">
        <Link to="/" className="hover:underline">← Return to MyAutoScrap Public Site</Link>
      </div>
    </div>
  );
}
