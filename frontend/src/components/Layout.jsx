import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { DotLottiePlayer } from '@dotlottie/react-player';

const links = [
  ['/', 'Home'],
  ['/scrap-my-car', 'Scrap My Car'],
  ['/how-it-works', 'How It Works'],
  ['/faqs', 'FAQs'],
  ['/areas-we-cover', 'Areas We Cover'],
  ['/about-us', 'About Us'],
  ['/contact-us', 'Contact Us'],
];

const containerClass = 'mx-auto w-[calc(100%-36px)] max-w-[1180px]';
const logoClass =
  'flex items-center gap-2 font-["Manrope"] text-xl font-extrabold';
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
          <Link className={`${logoClass} text-[#13231d] group`} onClick={() => setOpen(false)} to="/">
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
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_18px_rgba(37,211,102,0.42)] transition-all duration-200 hover:scale-105 hover:bg-[#22bf5b] hover:shadow-[0_6px_24px_rgba(37,211,102,0.55)] active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#25D366]/30"
        href="https://wa.me/447714423293"
        rel="noopener noreferrer"
        target="_blank"
      >
        <svg
          aria-hidden="true"
          className="h-8 w-8 fill-current"
          viewBox="0 0 24 24"
        >
          <path d="M12.004 2C6.478 2 1.996 6.478 1.996 12c0 1.928.547 3.73 1.498 5.267L2 22l4.877-1.46c1.478.878 3.208 1.385 5.05 1.385 5.526 0 10.008-4.478 10.008-10S17.53 2 12.004 2zm0 18.25c-1.636 0-3.176-.474-4.48-1.29l-.322-.202-2.89.865.88-2.808-.216-.339A8.17 8.17 0 013.754 12c0-4.55 3.7-8.25 8.25-8.25 4.55 0 8.25 3.7 8.25 8.25 0 4.55-3.7 8.25-8.25 8.25zm3.385-5.915c-.144.405-.837.774-1.17.825-.333.05-.733.075-2.207-.534-1.884-.777-3.08-2.695-3.174-2.82-.094-.125-.765-1.017-.765-1.94 0-.922.483-1.376.655-1.564.172-.188.375-.235.5-.235.125 0 .25 0 .36.006.115.006.27-.044.423.324.156.375.532 1.298.578 1.392.047.094.078.204.016.329-.063.125-.094.204-.188.313-.094.11-.197.245-.282.329-.094.094-.192.196-.082.384.11.188.487.804 1.045 1.301.718.64 1.324.838 1.512.932.188.094.297.078.407-.047.11-.125.469-.547.594-.735.125-.188.25-.156.422-.094.172.063 1.094.516 1.282.61.188.094.313.141.359.219.047.078.047.453-.097.858z" />
        </svg>
      </a>

      <footer className="bg-[#0b241b] pt-16 text-white">
        <div className={`${containerClass} grid gap-[50px] max-[720px]:grid-cols-1 min-[721px]:max-[1000px]:grid-cols-2 min-[1001px]:grid-cols-[2fr_1fr_1fr_1.4fr]`}>
          <div className={footerColumnClass}>
            <div className={`${logoClass} mb-3 text-white`}>
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
            <Link className={footerLinkClass} to="/scrap-my-car">
              Scrap My Car
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
