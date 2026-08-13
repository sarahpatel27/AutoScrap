import { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout({ activeTab, setActiveTab, children }) {
  const { user, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: '📊' },
    { id: 'enquiries', label: 'Vehicle Enquiries', icon: '🚗' },
    { id: 'pricing', label: 'Scrap Rate Rules', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 text-slate-900 font-['DM_Sans',sans-serif]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 h-16 border-b border-white/10 bg-[#0b2e21] text-white shadow-md">
        <div className="mx-auto flex h-full items-center justify-between px-3 sm:px-6">
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Mobile Nav Toggle */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white lg:hidden cursor-pointer hover:bg-white/20 active:scale-95 transition"
              type="button"
              aria-label="Toggle navigation menu"
            >
              ☰
            </button>

            {/* Brand & City Badge */}
            <Link to="/admin/dashboard" className="flex items-center gap-2 font-['Manrope'] text-base sm:text-lg font-black text-white">
              <span className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-lg bg-[#0f7b4f] font-black text-[#dff46b] text-xs sm:text-base shrink-0">
                M
              </span>
              <span className="flex items-center gap-1.5 sm:gap-2">
                <span className="truncate max-w-[100px] xs:max-w-none">MyAuto<span className="text-[#0f7b4f]">Scrap</span></span>
                {user?.assignedCity ? (
                  <span className="rounded-md bg-amber-400 px-1.5 py-0.5 text-[10px] sm:text-[11px] font-black text-slate-950 uppercase shadow-xs shrink-0">
                    📍 {user.assignedCity}
                  </span>
                ) : (
                  <span className="rounded-md bg-[#dff46b] px-1.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase text-[#082d1c] shrink-0">
                    Super Admin
                  </span>
                )}
              </span>
            </Link>
          </div>

          {/* User Controls & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              target="_blank"
              className="hidden items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-[#c8ded4] transition hover:bg-white/10 sm:flex"
            >
              <span>🌐</span> Public Site
            </Link>

            <div className="flex items-center gap-1.5 sm:gap-2.5 rounded-xl border border-white/10 bg-white/5 py-1 px-2 sm:px-3">
              <span className="text-base sm:text-xl">{user?.avatar || '🛡️'}</span>
              <div className="hidden text-left sm:block">
                <div className="text-xs font-extrabold text-white">{user?.name || 'Admin'}</div>
                <div className="text-[10px] text-[#c8ded4]">{user?.email}</div>
              </div>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-600/80 px-2.5 sm:px-3.5 py-1.5 text-xs font-extrabold text-white transition hover:bg-red-700 cursor-pointer active:scale-95"
              type="button"
            >
              <span>🚪</span> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto flex max-w-[1440px] px-3 py-4 sm:px-6 sm:py-6">
        {/* Left Sidebar (Desktop & Mobile Drawer) */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-64 bg-[#0b241b] p-5 text-white transition-transform duration-300 lg:static lg:z-auto lg:block lg:translate-x-0 lg:bg-transparent lg:p-0 ${
            mobileNavOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-black uppercase tracking-wider text-[#dff46b] lg:text-[#0f7b4f]">
                {user?.assignedCity ? `${user.assignedCity} Dealer Menu` : 'Super Admin Menu'}
              </div>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="lg:hidden text-gray-400 hover:text-white p-1 text-base font-bold"
              >
                ✕
              </button>
            </div>

            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileNavOpen(false);
                }}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold transition text-left cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-[#0f7b4f] text-white shadow-md'
                    : 'text-[#c8ded4] hover:bg-white/10 lg:text-slate-700 lg:hover:bg-gray-200'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}

            <hr className="my-3 border-white/10 lg:border-gray-200" />

            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold text-[#c8ded4] hover:bg-white/10 lg:text-slate-700 lg:hover:bg-gray-200"
            >
              <span className="text-lg">🌐</span>
              <span>View Live Website</span>
            </Link>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {mobileNavOpen && (
          <div
            onClick={() => setMobileNavOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
          ></div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 lg:pl-8">{children}</main>
      </div>
    </div>
  );
}
