import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router';

const links = [
  ['/', 'Home'], ['/quote', 'Get a Quote'], ['/how-it-works', 'How It Works'],
  ['/areas-we-cover', 'Areas We Cover'], ['/about-us', 'About Us'], ['/contact-us', 'Contact Us'],
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  return <>
    <div className="topbar"><span>Licensed & responsible vehicle recycling</span><span>Mon–Sat: 8:00–18:00</span></div>
    <header className="header">
      <div className="container nav-wrap">
        <Link to="/" className="logo" onClick={() => setOpen(false)}><span className="logo-mark">M</span><span>MyAuto<span>Scrap</span></span></Link>
        <button className="menu-btn" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>☰</button>
        <nav className={open ? 'nav open' : 'nav'}>
          {links.map(([to, label]) => <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({isActive}) => isActive ? 'active' : ''}>{label}</NavLink>)}
          <a className="btn btn-outline btn-small" href="tel:08001234567">☎ 0800 123 4567</a>
          <a className="btn btn-whatsapp btn-small" href="https://wa.me/447700900000">WhatsApp</a>
        </nav>
      </div>
    </header>
    <main><Outlet /></main>
    <a className="floating-whatsapp" href="https://wa.me/447700900000" aria-label="WhatsApp">WA</a>
    <footer className="footer">
      <div className="container footer-grid">
        <div><div className="logo footer-logo"><span className="logo-mark">M</span><span>MyAuto<span>Scrap</span></span></div><p>Fast, transparent scrap-car estimates with convenient collection across supported UK areas.</p></div>
        <div><h4>Useful links</h4><Link to="/quote">Get a Quote</Link><Link to="/how-it-works">How It Works</Link><Link to="/faqs">FAQs</Link></div>
        <div><h4>Company</h4><Link to="/about-us">About Us</Link><Link to="/contact-us">Contact Us</Link><Link to="/areas-we-cover">Areas We Cover</Link></div>
        <div><h4>Contact</h4><a href="tel:08001234567">0800 123 4567</a><a href="mailto:hello@myautoscrap.co.uk">hello@myautoscrap.co.uk</a><span>Mon–Sat, 8:00–18:00</span></div>
      </div>
      <div className="container footer-bottom"><span>© 2026 MyAutoScrap. All rights reserved.</span><span><Link to="/privacy-policy">Privacy Policy</Link> · <Link to="/terms-and-conditions">Terms</Link></span></div>
    </footer>
  </>;
}
