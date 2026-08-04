import { Link } from 'react-router';
import QuoteFlow from '../components/QuoteFlow';
import FAQList from '../components/FAQList';
import { CTA, SectionTitle } from '../components/Common';
import { cities, faqs, reviews } from '../data/siteData';

const benefits = [
  ['£', 'Competitive estimates', 'Transparent pricing based on vehicle details, weight and condition.'],
  ['🚚', 'Convenient collection', 'Arrange collection from your home, workplace or another suitable location.'],
  ['♻', 'Responsible recycling', 'Vehicles are handled through responsible recycling and disposal processes.'],
  ['☎', 'Helpful support', 'Speak to a real team member by phone or WhatsApp when you need help.'],
];

export default function HomePage() {
  return <>
    <section className="hero"><div className="container hero-grid"><div className="hero-copy"><span className="eyebrow light">Fast · Simple · No obligation</span><h1>Scrap Your Car <em>Today</em></h1><p>Get an estimated value in minutes. Enter your registration, confirm your car and arrange convenient collection.</p><div className="hero-points"><span>✓ Free estimate</span><span>✓ Fast response</span><span>✓ UK coverage</span></div><div className="rating-strip"><b>4.8/5</b><span className="stars">★★★★★</span><span>Based on verified customer feedback</span></div></div><QuoteFlow compact /></div></section>

    <section className="trust-bar"><div className="container trust-grid"><span>✓ No hidden enquiry fee</span><span>✓ Non-running cars accepted</span><span>✓ Secure customer details</span><span>✓ Friendly UK support</span></div></section>

    <section className="section"><div className="container"><SectionTitle eyebrow="Simple from start to finish" title="How it works" text="Turn an unwanted vehicle into a completed enquiry in a few clear steps."/><div className="steps-grid">{[['1','Enter your registration','We retrieve or mock the vehicle details.'],['2','Confirm the condition','Answer five straightforward questions.'],['3','Receive an estimate','Review the price breakdown and validity.'],['4','Arrange collection','Submit the enquiry and our team contacts you.']].map(([n,t,d])=><div className="step-card" key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></div>)}</div><div className="center-button"><Link className="btn btn-secondary" to="/how-it-works">See the full process</Link></div></div></section>

    <section className="section alt"><div className="container"><SectionTitle eyebrow="Why MyAutoScrap" title="A better way to handle your old car"/><div className="benefit-grid">{benefits.map(([i,t,d])=><article className="benefit-card" key={t}><div className="icon-box">{i}</div><h3>{t}</h3><p>{d}</p></article>)}</div></div></section>

    <section className="section"><div className="container"><SectionTitle eyebrow="Nationwide network" title="Popular areas we cover" text="Search your postcode or explore example service areas."/><div className="city-grid">{cities.map(c=><article className="city-card" key={c.name}><div className="city-code">{c.code}</div><h3>{c.name}</h3><p>{c.areas}</p><Link to="/quote">Get a local quote →</Link></article>)}</div><div className="center-button"><Link className="btn btn-secondary" to="/areas-we-cover">Explore all coverage</Link></div></div></section>

    <section className="section reviews-section"><div className="container"><SectionTitle eyebrow="Customer experiences" title="What drivers say"/><div className="reviews-grid">{reviews.map(r=><article className="review-card" key={r.name}><div className="stars">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div><p>“{r.text}”</p><div><b>{r.name}</b><span>{r.vehicle} · {r.date}</span></div></article>)}</div><div className="overall-rating"><strong>4.8</strong><div><span className="stars">★★★★★</span><p>Excellent overall customer rating</p></div></div></div></section>

    <section className="section alt"><div className="container narrow"><SectionTitle eyebrow="Questions answered" title="Frequently asked questions"/><FAQList items={faqs.slice(0,5)} /><div className="center-button"><Link className="btn btn-secondary" to="/faqs">View all FAQs</Link></div></div></section>
    <CTA />
  </>;
}
