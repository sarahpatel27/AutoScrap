import { useState } from 'react';
import { Link } from 'react-router';
import FAQList from '../components/FAQList';
import { faqs } from '../data/siteData';
import SEO from '../components/Seo';
import { getFaqPageSchema, getBreadcrumbSchema } from '../config/seo.config';

const containerClass = 'mx-auto w-[calc(100%-36px)] max-w-[1180px]';
const lightButtonClass =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-[#dff46b] px-[22px] py-3.5 font-extrabold text-[#13231d] transition hover:-translate-y-0.5';
const ghostButtonClass =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/35 px-[22px] py-3.5 font-extrabold text-white transition hover:-translate-y-0.5';

export default function FAQPage() {
  const [search, setSearch] = useState('');
  const filtered = faqs.filter(([question, answer]) =>
    `${question} ${answer}`.toLowerCase().includes(search.toLowerCase()),
  );

  const faqSchema = getFaqPageSchema(faqs);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'FAQs', url: '/faqs' }
  ]);

  return (
    <>
      <SEO
        title="Scrap Car FAQs | Common Scrapping Questions | MyAutoScrap"
        description="Find clear answers to frequent questions about scrap car valuations, free vehicle collection, required documents, MOT requirements, and direct payment."
        canonical="/faqs"
        schema={[faqSchema, breadcrumbSchema]}
      />
      <section className="bg-linear-to-br from-[#0a3626] to-[#0f704a] py-[82px] text-white">
        <div className={containerClass}>
          <span className="mb-4 inline-block text-xs font-extrabold uppercase tracking-[0.16em] text-[#dff46b]">
            Help & Guidance
          </span>
          <h1 className="mb-3.5 text-[clamp(2.5rem,6vw,5.2rem)] leading-tight">
            Frequently Asked Questions About Scrapping Your Car
          </h1>
          <p className="m-0 max-w-[760px] text-[1.08rem] text-[#d7e9e1]">
            Find clear answers to common questions about scrap vehicle estimates, collection scheduling, required documentation, payment methods, and vehicle condition.
          </p>
        </div>
      </section>

      <section className="py-[68px] sm:py-[92px]">
        <div className={`${containerClass} max-w-[820px]`}>
          <input
            className="mb-[22px] w-full rounded-[10px] border border-slate-200 bg-white px-3.5 py-[13px] outline-none transition focus:border-[#0f7b4f] focus:shadow-[0_0_0_3px_rgba(15,123,79,0.1)]"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search questions..."
            value={search}
          />

          <FAQList items={filtered} />

          {!filtered.length && (
            <div className="mt-6 rounded-[18px] border border-slate-200 bg-white p-8 text-center font-bold text-slate-500">
              No matching questions found.
            </div>
          )}

          {/* Unanswered Questions Prompt */}
          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center sm:p-8">
            <h3 className="mb-2 text-lg font-bold text-slate-900">
              Have a question that isn't answered here?
            </h3>
            <p className="mb-4 text-sm text-slate-600 max-w-[600px] mx-auto">
              Our customer support team is available Monday to Saturday, 9:00 AM to 6:00 PM, to assist with specific vehicle enquiries and collection arrangements.
            </p>
            <Link
              to="/contact-us"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-extrabold text-slate-900 shadow-xs transition hover:bg-slate-100 hover:border-[#0f7b4f]"
            >
              <span>Contact Our Support Team</span>
              <span className="text-xs">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#0f7b4f] py-[62px] text-white">
        <div className={`${containerClass} flex flex-col items-center justify-between gap-10 text-center lg:flex-row lg:text-left`}>
          <div>
            <span className="mb-4 inline-block text-xs font-extrabold uppercase tracking-[0.16em] text-[#dff46b]">
              Ready when you are
            </span>
            <h2 className="mb-3.5 text-[clamp(2rem,4vw,3.2rem)] leading-tight">
              Get your scrap-car estimate today
            </h2>
            <p className="m-0 text-[#d8ebe2]">
              Enter your registration and answer a few simple questions.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Link className={lightButtonClass} to="/scrap-my-car">
              Get My Quote
            </Link>
            <a className={ghostButtonClass} href="tel:+447714423293">
              Call Us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
