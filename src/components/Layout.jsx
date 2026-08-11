import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';

const links = [
  ['/', 'Home'],
  ['/quote', 'Get a Quote'],
  ['/how-it-works', 'How It Works'],
  ['/faqs', 'FAQs'],
  ['/areas-we-cover', 'Areas We Cover'],
  ['/about-us', 'About Us'],
  ['/contact-us', 'Contact Us'],
];

const containerClass = 'mx-auto w-[calc(100%-36px)] max-w-[1180px]';
const logoClass =
  'flex items-center gap-2.5 font-["Manrope"] text-xl font-extrabold';
const logoMarkClass =
  'grid h-[38px] w-[38px] place-items-center rounded-[11px] bg-[#0f7b4f] font-black text-[#dff46b]';
const navLinkClass = 'text-sm font-bold transition hover:text-[#0f7b4f]';
const actionButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-[9px] px-3.5 py-2.5 text-sm font-extrabold transition hover:-translate-y-0.5';
const footerColumnClass = 'flex flex-col gap-[9px]';
const footerLinkClass = 'text-[#d8e4df] transition hover:text-[#dff46b]';

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const navClass = [
    'items-center gap-[22px]',
    'min-[1001px]:flex',
    'max-[1000px]:absolute max-[1000px]:left-[18px] max-[1000px]:right-[18px] max-[1000px]:top-[82px] max-[1000px]:z-50 max-[1000px]:flex-col max-[1000px]:items-stretch max-[1000px]:rounded-2xl max-[1000px]:border max-[1000px]:border-slate-200 max-[1000px]:bg-white max-[1000px]:p-5 max-[1000px]:shadow-[0_18px_50px_rgba(13,52,37,0.11)]',
    'max-[720px]:top-[72px]',
    open ? 'max-[1000px]:flex' : 'max-[1000px]:hidden',
  ].join(' ');

  return (
    <>
      <div className="flex justify-between bg-[#0b2e21] px-[4%] py-[7px] text-[0.78rem] text-[#c8ded4] max-[720px]:justify-center">
        <span>Licensed & responsible vehicle recycling</span>
        <span className="max-[720px]:hidden">Mon–Sat: 9:00 AM to 6:00 PM</span>
      </div>

      <header className="sticky top-0 z-50 h-[78px] border-b border-slate-200 bg-white max-[720px]:h-[68px]">
        <div className={`${containerClass} flex h-full items-center justify-between`}>
          <Link className={`${logoClass} text-[#13231d]`} onClick={() => setOpen(false)} to="/">
            <span className={logoMarkClass}>M</span>
            <span>
              MyAuto<span className="text-[#0f7b4f]">Scrap</span>
            </span>
          </Link>

          <button
            aria-label="Toggle navigation"
            className="hidden border-0 bg-transparent text-2xl text-[#13231d] max-[1000px]:block"
            onClick={() => setOpen(!open)}
            type="button"
          >
            ☰
          </button>

          <nav className={navClass}>
            {links.map(([to, label]) => (
              <NavLink
                className={({ isActive }) =>
                  `${navLinkClass} ${isActive ? 'text-[#0f7b4f]' : 'text-[#13231d]'}`
                }
                key={to}
                onClick={() => setOpen(false)}
                to={to}
              >
                {label}
              </NavLink>
            ))}
            <a
              className={`${actionButtonClass} border border-[#0f7b4f] bg-white text-[#0f7b4f]`}
              href="tel:+447714423293"
            >
              ☎ +44 7714423293
            </a>
            <a
              className={`${actionButtonClass} bg-[#25d366] text-[#082d1c]`}
              href="https://wa.me/447714423293"
            >
              WhatsApp
            </a>
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <a
        aria-label="WhatsApp"
        className="fixed bottom-5 right-5 z-30 grid h-[54px] w-[54px] place-items-center rounded-full bg-[#25d366] font-black text-[#083d24] shadow-[0_18px_50px_rgba(13,52,37,0.11)]"
        href="https://wa.me/447714423293"
      >
        WA
      </a>

      <footer className="bg-[#0b241b] pt-16 text-white">
        <div className={`${containerClass} grid gap-[50px] max-[720px]:grid-cols-1 min-[721px]:max-[1000px]:grid-cols-2 min-[1001px]:grid-cols-[2fr_1fr_1fr_1.4fr]`}>
          <div className={footerColumnClass}>
            <div className={`${logoClass} mb-3 text-white`}>
              <span className={logoMarkClass}>M</span>
              <span>
                MyAuto<span className="text-[#0f7b4f]">Scrap</span>
              </span>
            </div>
            <p className="m-0 text-[#a9beb5]">
              Fast, transparent scrap-car estimates with convenient collection
              across supported UK areas.
            </p>
          </div>

          <div className={footerColumnClass}>
            <h4 className="mb-3.5 text-[#dff46b]">Useful links</h4>
            <Link className={footerLinkClass} to="/quote">
              Get a Quote
            </Link>
            <Link className={footerLinkClass} to="/how-it-works">
              How It Works
            </Link>
            <Link className={footerLinkClass} to="/faqs">
              FAQs
            </Link>
          </div>

          <div className={footerColumnClass}>
            <h4 className="mb-3.5 text-[#dff46b]">Company</h4>
            <Link className={footerLinkClass} to="/about-us">
              About Us
            </Link>
            <Link className={footerLinkClass} to="/contact-us">
              Contact Us
            </Link>
            <Link className={footerLinkClass} to="/areas-we-cover">
              Areas We Cover
            </Link>
            <a
              className={footerLinkClass}
              href="https://share.google/lppdUTbhDohi0FX8O"
              target="_blank"
              rel="noreferrer"
            >
              Google Business Profile
            </a>
          </div>

          <div className={footerColumnClass}>
            <h4 className="mb-3.5 text-[#dff46b]">Contact</h4>
            <a className={footerLinkClass} href="tel:+447714423293">
              +44 7714423293
            </a>
            <a className={footerLinkClass} href="mailto:info@myautoscrap.co.uk">
              info@myautoscrap.co.uk
            </a>
            <span className="text-[#a9beb5]">Mon–Sat, 9:00 AM to 6:00 PM</span>
          </div>
        </div>

        <div className={`${containerClass} mt-12 flex justify-between border-t border-white/10 py-5 text-[0.82rem] max-[720px]:flex-col max-[720px]:gap-2`}>
          <span className="text-[#a9beb5]">
            © 2026 MyAutoScrap. All rights reserved.
          </span>
          <span className="text-[#a9beb5]">
            <Link className={footerLinkClass} to="/privacy-policy">
              Privacy Policy
            </Link>{' '}
            ·{' '}
            <Link className={footerLinkClass} to="/terms-and-conditions">
              Terms
            </Link>
          </span>
        </div>
      </footer>
    </>
  );
}
