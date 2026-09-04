import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout({ activeTab, children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isSuperAdmin = user?.role === 'Super Admin';

  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: '📊', path: '/admin/dashboard' },
    { id: 'high-value', label: 'High Value Bidding', icon: '⭐', path: '/admin/high-value-bidding' },
    { id: 'enquiries', label: 'Vehicle Enquiries', icon: '🚗', path: '/admin/enquiries' },
    { id: 'past', label: 'Past Enquiries', icon: '📁', path: '/admin/past-enquiries' },
    { id: 'pricing', label: 'Scrap Rate Rules', icon: '⚙️', path: '/admin/scrap-rates' },
    ...(isSuperAdmin
      ? [
          { id: 'promotions', label: 'Promotional Emails', icon: '📣', path: '/admin/promotional-emails' },
          // { id: 'cities', label: 'Cities & Coverage', icon: '🏙️', path: '/admin/cities' },
          { id: 'contacts', label: 'Contact Messages', icon: '📬', path: '/admin/contact-messages' },
          { id: 'users', label: 'Dealer Accounts', icon: '👤', path: '/admin/dealer-accounts' },
        ]
      : []),
    { id: 'settings', label: 'Account Settings', icon: '🔒', path: '/admin/account-settings' },
  ];

  const currentTab = activeTab || navItems.find((item) => item.path === location.pathname)?.id || 'overview';

  return (
    <div className="min-h-screen bg-gray-100 text-slate-900 font-['DM_Sans',sans-serif]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 h-16 border-b border-white/10 bg-[#0b2e21] text-white shadow-md">
        <div className="mx-auto flex h-full items-center justify-between px-3 sm:px-6">
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Mobile Nav Toggle */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white lg:hidden cursor-pointer hover:bg-white/20 active:scale-95 transition shrink-0"
              type="button"
              aria-label="Toggle navigation menu"
            >
              ☰
            </button>

            {/* Brand Logo & Role Badge */}
            <Link to="/admin/dashboard" className="flex items-center gap-2 font-['Manrope'] text-base sm:text-lg font-black text-white shrink-0">
              <span className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-xl bg-[#0f7b4f] font-black text-[#dff46b] text-base sm:text-lg shadow-sm shrink-0">
                M
              </span>
              <span className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white whitespace-nowrap">
                  MyAuto<span className="text-[#0f7b4f]">Scrap</span>
                </span>
                {user?.role === 'City Dealer' ? (
                  <span className="rounded-md bg-amber-400 px-2 py-0.5 text-[10px] sm:text-[11px] font-black text-slate-950 uppercase shadow-xs shrink-0 whitespace-nowrap">
                    📮 {user.coveredPostcodes && user.coveredPostcodes.length > 0 ? user.coveredPostcodes.join(', ') : 'Dealer'}
                  </span>
                ) : (
                  <span className="rounded-md bg-[#dff46b] px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase text-[#082d1c] shrink-0 whitespace-nowrap">
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
              className="hidden items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-[#c8ded4] transition hover:bg-white/10 md:flex shrink-0"
            >
              <span>🌐</span> Public Site
            </Link>

            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 py-1 px-2 sm:px-3 shrink-0">
              <span className="text-base sm:text-lg">{user?.avatar || '🛡️'}</span>
              <div className="hidden text-left sm:block">
                <div className="text-xs font-extrabold text-white leading-tight">{user?.name || 'Admin'}</div>
                <div className="text-[10px] text-[#c8ded4] leading-tight">{user?.email}</div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              aria-label="Logout of Admin Panel"
              className="grid h-9 w-9 place-items-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 transition-all hover:border-red-500/40 hover:bg-red-600 hover:text-white shadow-xs cursor-pointer active:scale-95 shrink-0"
              type="button"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className=" flex  px-3 py-4 sm:px-6 sm:py-6">
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

            {navItems.map((item) => {
              const isActive = currentTab === item.id || location.pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold transition text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#0f7b4f] text-white shadow-md'
                      : 'text-[#c8ded4] hover:bg-white/10 lg:text-slate-700 lg:hover:bg-gray-200'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}

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
