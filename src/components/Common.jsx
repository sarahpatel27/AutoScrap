import { Link } from 'react-router';

export function SectionTitle({ eyebrow, title, text, center = true }) {
  return <div className={center ? 'section-title center' : 'section-title'}>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2>{text && <p>{text}</p>}</div>;
}

export function CTA() {
  return <section className="cta"><div className="container cta-inner"><div><span className="eyebrow light">Ready when you are</span><h2>Get your scrap-car estimate today</h2><p>Enter your registration and answer a few simple questions.</p></div><div className="cta-actions"><Link className="btn btn-light" to="/quote">Get My Quote</Link><a className="btn btn-ghost" href="tel:08001234567">Call Us</a></div></div></section>;
}

export function PageHero({ eyebrow, title, text }) {
  return <section className="page-hero"><div className="container"><span className="eyebrow light">{eyebrow}</span><h1>{title}</h1><p>{text}</p></div></section>;
}
