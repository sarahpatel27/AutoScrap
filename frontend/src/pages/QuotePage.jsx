import { useState } from 'react';
import { Link } from 'react-router';
import QuoteFlow from '../components/QuoteFlow';
import SEO from '../components/Seo';

const containerClass = 'mx-auto w-[calc(100%-36px)] max-w-[1180px]';
const eyebrowClass =
  'mb-3 inline-block text-xs font-extrabold uppercase tracking-[0.16em] text-[#0f7b4f]';
const lightEyebrowClass = `${eyebrowClass} text-[#dff46b]`;
const sectionHeadingClass =
  'mb-3 font-["Manrope"] text-[clamp(1.85rem,3.5vw,2.75rem)] font-extrabold leading-tight text-slate-900';
const sectionSubtextClass =
  'm-0 max-w-[760px] text-base sm:text-lg text-slate-600 leading-relaxed';

const confirmedCities = [
  { name: 'Shrewsbury', slug: 'shrewsbury', region: 'Shropshire' },
  { name: 'Warrington', slug: 'warrington', region: 'Cheshire' },
  { name: 'Milton Keynes', slug: 'milton-keynes', region: 'Buckinghamshire' },
  { name: 'Peterborough', slug: 'peterborough', region: 'Cambridgeshire' },
  { name: 'Liverpool', slug: 'liverpool', region: 'Merseyside' },
  { name: 'Llandudno', slug: 'llandudno', region: 'North Wales' },
  { name: 'Crewe', slug: 'crewe', region: 'Cheshire' },
  { name: 'Ipswich', slug: 'ipswich', region: 'Suffolk' },
  { name: 'Cambridge', slug: 'cambridge', region: 'Cambridgeshire' },
  { name: 'Chester', slug: 'chester', region: 'Cheshire' },
];

const quoteFaqs = [
  {
    question: 'How long is my online scrap car quotation valid?',
    answer:
      'The online quotation provided is an estimated valuation based on your vehicle details and prevailing market rates. The final payment amount depends on the vehicle’s actual condition and confirmation of collection details when speaking with our team.',
  },
  {
    question: 'Are there any hidden fees or vehicle collection charges?',
    answer:
      'No. The valuation you receive from MyAutoScrap is 100% free with no obligation, and free vehicle collection is included across all our supported regional locations. Provided the vehicle matches the confirmed condition, the agreed amount is transferred directly to your bank account upon vehicle handover.',
  },
  {
    question: 'How do missing parts or vehicle damage affect my scrap valuation?',
    answer:
      'The standard online quotation assumes your vehicle is complete with its essential components. If your vehicle is missing major parts such as the engine, catalytic converter, battery or wheels, please inform the collection team when discussing your collection details so your final price can be accurately confirmed.',
  },
  {
    question: 'Can I accept a scrap quote if I have lost the V5C logbook?',
    answer:
      'Yes. While having your V5C registration certificate (logbook) makes the collection and handover quicker, it is not legally mandatory to scrap your vehicle. You can proceed by providing valid photo identification (such as a UK driving licence or passport) and proof of address/ownership so our licensed recovery team can verify ownership.',
  },
  {
    question: 'When and how will I receive payment for my scrap car?',
    answer:
      'Under the Scrap Metal Dealers Act 2013, cash payments for scrap cars are illegal across England and Wales. Payment is processed securely via electronic bank transfer upon vehicle collection and inspection, ensuring instant, traceable funds directly into your account before the recovery driver departs.',
  },
];

export default function QuotePage() {
  const [openFaq, setOpenFaq] = useState(0);

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <SEO
        title="Instant Scrap Car Quote Online | Free Valuation | MyAutoScrap"
        description="Get an instant scrap car quote online. Enter your vehicle registration and collection postcode for an accurate estimated valuation and free collection."
        canonical="/scrap-my-car"
      />
      <div className="flex flex-col">
        {/* Hero header section: order-2 on mobile screens, order-1 on lg screens */}
        <section className="order-2 lg:order-1 bg-linear-to-br from-[#0a3626] to-[#0f704a] py-[50px] lg:py-[82px] text-white">
          <div className={containerClass}>
            <span className="mb-4 inline-block text-xs font-extrabold uppercase tracking-[0.16em] text-[#dff46b]">
              Instant quote
            </span>
            <h1 className="mb-3.5 max-w-[900px] text-[clamp(2.2rem,5vw,4.5rem)] leading-tight">
              Get an Instant Scrap Car Quote Online
            </h1>
            <p className="m-0 max-w-[760px] text-[1.08rem] text-[#d7e9e1]">
              Enter your vehicle registration and collection postcode below to calculate your estimated scrap car value with free vehicle collection included.
            </p>
          </div>
        </section>

        {/* QuoteFlow form section: order-1 on mobile screens, order-2 on lg screens */}
        <section className="order-1 lg:order-2 bg-[#f7f8f3] py-6 lg:py-[92px]">
          <div className={containerClass}>
            <QuoteFlow />
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SEO Content Sections (order-3 on all viewports)                          */}
        {/* ========================================================================= */}
        <div className="order-3">
          {/* Section 1: How Scrap Car Valuations Are Estimated */}
          <section className="bg-white py-16 sm:py-24 border-t border-slate-200">
            <div className={containerClass}>
              <div className="mb-12">
                <span className={eyebrowClass}>Transparent Valuation Model</span>
                <h2 className={sectionHeadingClass}>
                  How Scrap Car Valuations Are Estimated
                </h2>
                <p className={sectionSubtextClass}>
                  Unlike second-hand car retail values that depend on cosmetic appearance, scrap car valuations in the UK are calculated using real-time raw material economics, vehicle weight specifications, and component salvage potential.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <article className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 sm:p-7 transition hover:bg-white hover:border-[#0f7b4f]/40 hover:shadow-md flex flex-col justify-between">
                  <div>
                    <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-emerald-100/70 text-2xl">
                      ⚖️
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-slate-900">
                      Vehicle Curb Weight
                    </h3>
                    <p className="m-0 text-sm text-slate-600 leading-relaxed">
                      Your vehicle registration retrieves its official manufacturer curb weight. Heavier vehicles—such as large estates, SUVs, 4x4s, and vans—yield more ferrous and non-ferrous recyclable metals, which directly increases baseline scrap value.
                    </p>
                  </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 sm:p-7 transition hover:bg-white hover:border-[#0f7b4f]/40 hover:shadow-md flex flex-col justify-between">
                  <div>
                    <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-emerald-100/70 text-2xl">
                      📈
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-slate-900">
                      Competitive UK Scrap Metal Rates
                    </h3>
                    <p className="m-0 text-sm text-slate-600 leading-relaxed">
                      Scrap car estimates are calculated using applicable price-per-tonne rates configured for supported collection areas. These rates may change with market conditions.
                    </p>
                  </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 sm:p-7 transition hover:bg-white hover:border-[#0f7b4f]/40 hover:shadow-md flex flex-col justify-between">
                  <div>
                    <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-emerald-100/70 text-2xl">
                      🔩
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-slate-900">
                      Component Completeness
                    </h3>
                    <p className="m-0 text-sm text-slate-600 leading-relaxed">
                      The standard online quotation assumes the vehicle is complete with its essential parts. Customers should inform the collection team if major components such as the engine, catalytic converter, battery or wheels are missing so the valuation can be accurately confirmed.
                    </p>
                  </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 sm:p-7 transition hover:bg-white hover:border-[#0f7b4f]/40 hover:shadow-md flex flex-col justify-between">
                  <div>
                    <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-emerald-100/70 text-2xl">
                      🔄
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-slate-900">
                      Salvage vs Scrap Assessment
                    </h3>
                    <p className="m-0 text-sm text-slate-600 leading-relaxed">
                      If your vehicle has mechanical failure or accident damage but still retains valuable salvageable parts or repair potential, our network evaluates whether it qualifies for an elevated salvage valuation rather than standard scrap weight.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/80">
                    <Link
                      to="/how-it-works"
                      className="text-xs font-bold text-[#0f7b4f] hover:underline inline-flex items-center gap-1"
                    >
                      <span>How valuation works</span>
                      <span>→</span>
                    </Link>
                  </div>
                </article>
              </div>
            </div>
          </section>

          {/* Section 2: What Happens After Accepting a Quote */}
          <section className="bg-slate-50 py-16 sm:py-24 border-t border-slate-200">
            <div className={containerClass}>
              <div className="mb-12">
                <span className={eyebrowClass}>Step-by-Step Handover</span>
                <h2 className={sectionHeadingClass}>
                  What Happens After Accepting Your Quote?
                </h2>
                <p className={sectionSubtextClass}>
                  Accepting your online estimate is straightforward and quick. Once you confirm your details, our team assists with collection logistics, paperwork guidance, and payment processing.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="relative rounded-2xl border border-slate-200 bg-white p-7 shadow-xs">
                  <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f7b4f] text-sm font-black text-white">
                    1
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-slate-900">
                    Confirm Vehicle & Location
                  </h3>
                  <p className="m-0 text-sm text-slate-600 leading-relaxed">
                    Review your instant valuation and confirm your collection address and contact telephone number. You receive an instant reference number with no booking deposit required.
                  </p>
                </div>

                <div className="relative rounded-2xl border border-slate-200 bg-white p-7 shadow-xs">
                  <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f7b4f] text-sm font-black text-white">
                    2
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-slate-900">
                    Agree on Collection Slot
                  </h3>
                  <p className="m-0 text-sm text-slate-600 leading-relaxed">
                    Our team or verified local collection driver contacts you directly by phone to agree upon a collection date and arrival time window that suits your schedule.
                  </p>
                </div>

                <div className="relative rounded-2xl border border-slate-200 bg-white p-7 shadow-xs">
                  <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f7b4f] text-sm font-black text-white">
                    3
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-slate-900">
                    Free Vehicle Collection
                  </h3>
                  <p className="m-0 text-sm text-slate-600 leading-relaxed">
                    Our licensed recovery vehicle arrives at your location—whether your vehicle is on your driveway, at your workplace, or in a garage. We collect runners, non-runners, and MOT failures at zero cost.
                  </p>
                </div>

                <div className="relative rounded-2xl border border-slate-200 bg-white p-7 shadow-xs">
                  <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f7b4f] text-sm font-black text-white">
                    4
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-slate-900">
                    Bank Transfer & DVLA Handover
                  </h3>
                  <p className="m-0 text-sm text-slate-600 leading-relaxed">
                    Payment is transferred directly to your bank account upon vehicle handover. The driver assists with the logbook handover details, and the registered keeper must notify the DVLA of the transfer using the appropriate online or postal process.
                  </p>
                </div>
              </div>

              <div className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-sm text-emerald-950 font-medium">
                  <strong>Need detailed preparation guidance for collection day?</strong> Learn which documents and keys to have ready when our recovery driver arrives.
                </div>
                <Link
                  to="/how-it-works"
                  className="shrink-0 rounded-xl bg-[#0f7b4f] px-5 py-2.5 text-xs font-black text-white hover:bg-[#075b3a] transition shadow-xs"
                >
                  Read How It Works →
                </Link>
              </div>
            </div>
          </section>

          {/* Section 3: Secure Payment & Required Vehicle Documentation */}
          <section className="bg-white py-16 sm:py-24 border-t border-slate-200">
            <div className={containerClass}>
              <div className="mb-12">
                <span className={eyebrowClass}>Compliance & Peace of Mind</span>
                <h2 className={sectionHeadingClass}>
                  Secure Bank Transfer & Vehicle Documentation
                </h2>
                <p className={sectionSubtextClass}>
                  Scrapping an end-of-life vehicle requires adherence to UK environmental laws and vehicle licensing regulations. Our processes are designed for legal compliance and peace of mind.
                </p>
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-7 sm:p-9 shadow-xs">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-emerald-100 px-3 py-1 text-xs font-black text-[#0f7b4f]">
                    <span>⚖️</span>
                    <span>Scrap Metal Dealers Act 2013</span>
                  </div>
                  <h3 className="mb-3 text-xl font-black text-slate-900">
                    Why Cash for Scrap Cars Is Illegal in the UK
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    Under the <strong>Scrap Metal Dealers Act 2013</strong>, it is a criminal offence for any scrap car operator or dealer in England and Wales to pay cash for scrap vehicles. This legislation was enacted to prevent vehicle theft and metal crime.
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    At MyAutoScrap, every transaction is conducted strictly through electronic bank transfer, creating a clear, auditable paper trail. You receive payment straight into your designated bank account at the time of vehicle collection and handover.
                  </p>
                  <ul className="m-0 space-y-2 text-sm text-slate-700 font-semibold list-none p-0">
                    <li className="flex items-center gap-2">
                      <span className="text-[#0f7b4f] font-black">✓</span> Compliant electronic bank transfer
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#0f7b4f] font-black">✓</span> Fully traceable transaction confirmation
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#0f7b4f] font-black">✓</span> No hidden cheque cashing or admin deduction fees
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-7 sm:p-9 shadow-xs">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-emerald-100 px-3 py-1 text-xs font-black text-[#0f7b4f]">
                    <span>📋</span>
                    <span>DVLA Paperwork & Proof of Ownership</span>
                  </div>
                  <h3 className="mb-3 text-xl font-black text-slate-900">
                    Required Documents & DVLA Transfer
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    Having your vehicle documentation ready ensures that legal ownership is transferred cleanly and your vehicle tax liability ceases with the DVLA.
                  </p>
                  <div className="space-y-3.5 mb-5 text-sm text-slate-600">
                    <div>
                      <strong className="text-slate-900 block font-bold mb-0.5">V5C Registration Document (Logbook):</strong>
                      Provide your V5C logbook on collection day if available. The collection driver completes the relevant transfer details, and the registered keeper must notify the DVLA online or by post using the appropriate transfer slip.
                    </div>
                    <div>
                      <strong className="text-slate-900 block font-bold mb-0.5">Scrapping Without a Logbook:</strong>
                      If your V5C has been lost or misplaced, you can still scrap your vehicle by providing valid photo ID (driving licence or passport) and proof of address or ownership.
                    </div>
                    <div>
                      <strong className="text-slate-900 block font-bold mb-0.5">Road Tax Refund:</strong>
                      Once the DVLA is notified that the vehicle has been sold or transferred, any full remaining months of vehicle tax are automatically refunded to you by the DVLA.
                    </div>
                  </div>
                  <Link
                    to="/how-it-works"
                    className="text-xs font-black text-[#0f7b4f] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Read our complete documentation checklist</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Free Vehicle Collection Across Supported UK Locations */}
          <section className="bg-slate-50 py-16 sm:py-24 border-t border-slate-200">
            <div className={containerClass}>
              <div className="mb-12">
                <span className={eyebrowClass}>Verified Regional Coverage</span>
                <h2 className={sectionHeadingClass}>
                  Free Scrap Car Collection Across Supported UK Areas
                </h2>
                <p className={sectionSubtextClass}>
                  We arrange free vehicle collection across all our active regional service areas. Whether your car is parked at home, at work, or at a local repair garage, our recovery vehicles collect cars across varied conditions—including runners, non-runners, and MOT failures—with no collection fees.
                </p>
              </div>

              {/* 10 Confirmed Supported Locations Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 mb-10">
                {confirmedCities.map((city) => (
                  <Link
                    key={city.slug}
                    to={`/areas-we-cover/${city.slug}`}
                    className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition hover:-translate-y-1 hover:border-[#0f7b4f] hover:shadow-md"
                  >
                    <div>
                      <span className="text-xs font-semibold text-slate-400 block mb-1">
                        {city.region}
                      </span>
                      <h3 className="m-0 text-base font-black text-slate-900 group-hover:text-[#0f7b4f] transition">
                        {city.name}
                      </h3>
                    </div>
                    <span className="mt-3 text-xs font-extrabold text-[#0f7b4f] inline-flex items-center gap-1">
                      <span>View area</span>
                      <span>→</span>
                    </span>
                  </Link>
                ))}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 m-0 mb-1">
                    Checking collection for a specific postcode?
                  </h3>
                  <p className="text-sm text-slate-600 m-0">
                    Explore our comprehensive outward district list or enter your postcode in the instant quote calculator above.
                  </p>
                </div>
                <Link
                  to="/areas-we-cover"
                  className="shrink-0 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-xs font-black text-white hover:bg-slate-800 transition"
                >
                  Browse All Areas We Cover →
                </Link>
              </div>
            </div>
          </section>

          {/* Section 5: Quote & Acceptance FAQs */}
          <section className="bg-white py-16 sm:py-24 border-t border-slate-200">
            <div className={`${containerClass} max-w-[860px]`}>
              <div className="text-center mb-12">
                <span className={eyebrowClass}>Quote & Valuation Support</span>
                <h2 className={sectionHeadingClass}>
                  Frequently Asked Questions About Your Scrap Car Quote
                </h2>
                <p className="m-0 text-slate-600 text-base sm:text-lg max-w-[650px] mx-auto">
                  Helpful answers regarding how your quotation is calculated, price validity, missing paperwork, and the collection process.
                </p>
              </div>

              <div className="flex flex-col gap-3.5 mb-10">
                {quoteFaqs.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div
                      key={faq.question}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-[#0f7b4f]/40 shadow-2xs"
                    >
                      <h3 className="m-0 text-base font-extrabold text-slate-900">
                        <button
                          className="flex w-full cursor-pointer items-center justify-between gap-4 border-0 bg-white px-5 py-4 sm:px-6 sm:py-5 text-left text-sm sm:text-base font-bold text-slate-900 transition hover:text-[#0f7b4f]"
                          onClick={() => setOpenFaq(isOpen ? -1 : index)}
                          type="button"
                          aria-expanded={isOpen}
                        >
                          <span>{faq.question}</span>
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600 font-black text-sm">
                            {isOpen ? '−' : '+'}
                          </span>
                        </button>
                      </h3>
                      {isOpen && (
                        <div className="border-t border-slate-100 px-5 pb-5 pt-3 sm:px-6 sm:pb-6 text-sm text-slate-600 leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center sm:p-8">
                <h3 className="mb-2 text-base sm:text-lg font-bold text-slate-900">
                  Have broader questions about vehicle scrapping?
                </h3>
                <p className="mb-4 text-xs sm:text-sm text-slate-600 max-w-[560px] mx-auto leading-relaxed">
                  Browse our full question directory covering MOT failure regulations, insurance write-offs, and environmental recycling standards.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link
                    to="/faqs"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-900 shadow-xs transition hover:bg-slate-100 hover:border-[#0f7b4f]"
                  >
                    <span>View All Scrap Car FAQs</span>
                    <span>→</span>
                  </Link>
                  <Link
                    to="/contact-us"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-900 shadow-xs transition hover:bg-slate-100"
                  >
                    <span>Contact Support</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: Final Call to Action */}
          <section className="bg-[#0f7b4f] py-16 text-white border-t border-emerald-800">
            <div className={`${containerClass} flex flex-col items-center justify-between gap-8 text-center lg:flex-row lg:text-left`}>
              <div className="max-w-[700px]">
                <span className={lightEyebrowClass}>Ready to Calculate Your Valuation?</span>
                <h2 className="mb-3 text-[clamp(1.9rem,3.5vw,2.8rem)] font-black leading-tight text-white">
                  Get Your Free Scrap Car Quote in Seconds
                </h2>
                <p className="m-0 text-base sm:text-lg text-emerald-100 leading-relaxed">
                  Enter your vehicle registration and collection postcode above to calculate an estimated scrap valuation with free vehicle collection included.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={scrollToTop}
                  className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl border-0 bg-[#dff46b] px-6 py-3.5 text-sm font-black text-[#13231d] transition hover:-translate-y-0.5 hover:bg-[#d4ea5f] shadow-md"
                >
                  <span>Calculate My Quote Now</span>
                  <span>↑</span>
                </button>
                <a
                  href="tel:+447714423293"
                  className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 px-6 py-3.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white hover:text-slate-900"
                >
                  <span>Call 07714 423293</span>
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
