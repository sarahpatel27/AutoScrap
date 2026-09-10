import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import QuoteFlow from '../components/QuoteFlow';
import { reviews, formatCityLocation } from '../data/siteData';
import { fetchSupportedCities, fetchPublicReviews } from '../services/adminStore';
import SEO from '../components/Seo';
import { getOrganizationSchema, getWebSiteSchema } from '../config/seo.config';

const benefits = [
  ['£', 'Competitive estimates', 'Transparent pricing based on vehicle details, weight and condition.'],
  ['🚚', 'Convenient collection', 'Arrange collection from your home, workplace or another suitable location.'],
  ['♻', 'Responsible recycling', 'Vehicles are handled through responsible recycling and disposal processes.'],
  ['☎', 'Helpful support', 'Speak to a real team member by phone or WhatsApp when you need help.'],
];

const steps = [
  ['1', 'Enter your registration', 'We retrieve or mock the vehicle details.'],
  ['2', 'View instant quote', 'Get an instant scrap estimate based on live UK market rates.'],
  ['3', 'Receive an estimate', 'Review the price breakdown and validity.'],
  ['4', 'Arrange collection', 'Submit the enquiry and our team contacts you.'],
];

const containerClass = 'mx-auto w-[calc(100%-32px)] max-w-[1180px]';
const sectionClass = 'py-[68px] sm:py-[92px]';
const eyebrowClass =
  'mb-4 inline-block text-xs font-extrabold uppercase tracking-[0.16em] text-[#0f7b4f]';
const lightEyebrowClass = `${eyebrowClass} text-[#dff46b]`;
const sectionTitleClass = 'mx-auto mb-11 max-w-[700px] text-center';
const sectionHeadingClass = 'mb-3.5 text-[clamp(2rem,4vw,3.15rem)] leading-tight';
const primaryButtonClass =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-[#0f7b4f] px-[22px] py-3.5 font-extrabold text-white shadow-[0_10px_25px_rgba(15,123,79,0.23)] transition hover:-translate-y-0.5 hover:bg-[#075b3a]';
const secondaryButtonClass =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-[22px] py-3.5 font-extrabold text-slate-950 transition hover:-translate-y-0.5';
const lightButtonClass =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-[#dff46b] px-[22px] py-3.5 font-extrabold text-[#13231d] transition hover:-translate-y-0.5';
const ghostButtonClass =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/35 px-[22px] py-3.5 font-extrabold text-white transition hover:-translate-y-0.5';

function GoogleIcon({ className = 'h-4 w-4 shrink-0' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.43 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27A7.18 7.18 0 0 1 4.9 12c0-.79.14-1.57.38-2.27V6.58H1.25A11.97 11.97 0 0 0 0 12c0 1.94.46 3.77 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.57 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

function TrustpilotIcon({ className = 'h-5 w-5 shrink-0' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect width="24" height="24" rx="5" fill="#00B67A" />
      <path
        d="M12 4.2l2.36 4.79 5.28.77-3.82 3.73.9 5.26L12 16.27l-4.72 2.48.9-5.26-3.82-3.73 5.28-.77L12 4.2z"
        fill="#FFFFFF"
      />
      <path
        d="M14.36 8.99l-2.36-4.79v12.07l4.72 2.48-.9-5.26 3.82-3.73-5.28-.77z"
        fill="#005128"
        opacity="0.25"
      />
    </svg>
  );
}

function HomeSectionTitle({ eyebrow, title, text, light = false }) {
  return (
    <div className={sectionTitleClass}>
      <span className={light ? lightEyebrowClass : eyebrowClass}>{eyebrow}</span>
      <h2 className={`${sectionHeadingClass} ${light ? 'text-white' : ''}`}>
        {title}
      </h2>
      {text && (
        <p className={`m-0 text-[1.06rem] leading-[1.7] ${light ? 'text-white/75' : 'text-slate-500'}`}>
          {text}
        </p>
      )}
    </div>
  );
}

export default function HomePage() {
  const organizationSchema = getOrganizationSchema();
  const websiteSchema = getWebSiteSchema();
  const [activeLocations, setActiveLocations] = useState([]);
  const [customerReviews, setCustomerReviews] = useState(reviews);
  const [ratingData, setRatingData] = useState({
    rating: '4.8',
    stars: '★★★★★',
    heading: 'Excellent overall customer rating',
  });
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);

  useEffect(() => {
    async function loadActiveCities() {
      try {
        const data = await fetchSupportedCities({ active: 'true' });
        if (data && data.length > 0) {
          setActiveLocations(data.map(formatCityLocation));
        }
      } catch (err) {
        console.error('Error fetching active cities for homepage:', err);
      }
    }

    async function loadReviews() {
      try {
        const res = await fetchPublicReviews();
        if (res && Array.isArray(res.reviews) && res.reviews.length > 0) {
          setCustomerReviews(res.reviews);
        }
        if (res && (res.rating || res.stats?.rating)) {
          setRatingData({
            rating: res.rating || res.stats?.rating || '4.8',
            stars: res.stars || res.stats?.stars || '★★★★★',
            heading: res.heading || res.stats?.heading || 'Excellent overall customer rating',
          });
        }
      } catch (err) {
        console.error('Error fetching customer reviews for homepage:', err);
      }
    }

    loadActiveCities();
    loadReviews();
  }, []);

  useEffect(() => {
    function updateVisibleCards() {
      if (typeof window === 'undefined') return;
      if (window.innerWidth >= 1024) {
        setVisibleCards(3);
      } else if (window.innerWidth >= 640) {
        setVisibleCards(2);
      } else {
        setVisibleCards(1);
      }
    }
    updateVisibleCards();
    window.addEventListener('resize', updateVisibleCards);
    return () => window.removeEventListener('resize', updateVisibleCards);
  }, []);

  const maxCarouselIndex = Math.max(0, customerReviews.length - visibleCards);

  useEffect(() => {
    if (carouselIndex > maxCarouselIndex) {
      setCarouselIndex(maxCarouselIndex);
    }
  }, [maxCarouselIndex, carouselIndex]);

  const handlePrevReview = () => {
    setCarouselIndex((prev) => (prev <= 0 ? maxCarouselIndex : prev - 1));
  };

  const handleNextReview = () => {
    setCarouselIndex((prev) => (prev >= maxCarouselIndex ? 0 : prev + 1));
  };

  return (
    <>
      <SEO
        title="Scrap My Car | Instant Scrap Car Quote & Free Collection | MyAutoScrap"
        description="Get a competitive instant estimate for your scrap car with MyAutoScrap. Enter your reg and postcode to arrange free vehicle collection across the UK."
        canonical="/"
        schema={[organizationSchema, websiteSchema]}
      />
      <section className="relative flex min-h-0 items-center overflow-hidden bg-[#0c3d2a] text-white lg:min-h-[710px]">
        {/* Cinematic Car Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100 mix-blend-luminosity scale-105 transition-transform duration-1000"
          style={{ backgroundImage: `url('/hero-car-bg.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#072418]/95 via-[#0c3d2a]/85 to-[#0c3d2a]/60" />
        <div className="absolute -top-[100px] -right-40 h-[520px] w-[520px] rounded-full border-[90px] border-[#dff46b]/10 blur-xs" />

        <div className={`${containerClass} relative z-10 grid items-center gap-7 py-[55px] text-center lg:grid-cols-[1.08fr_0.92fr] lg:gap-[70px] lg:py-[75px] lg:text-left`}>
          <div className="order-2 min-w-0 lg:order-1">
            <span className={lightEyebrowClass}>Fast · Simple · No obligation</span>

            <h1 className="mb-[18px] text-[3.1rem] leading-[1.05] tracking-[-0.055em] sm:text-[clamp(2.5rem,6vw,5.2rem)]">
              Scrap Your Car <em className="not-italic text-[#dff46b]">Today</em>
            </h1>

            <p className="mx-auto max-w-[610px] text-[1.16rem] leading-[1.7] text-[#dcece5] lg:mx-0">
              Get an instant estimated scrap value for your car. Free collection available across our service areas.
            </p>

            <div className="my-6 flex flex-wrap justify-center gap-2.5 text-sm font-bold sm:gap-[22px] sm:text-base lg:justify-start">
              <span>✓ Free estimate</span>
              <span>✓ Fast response</span>
              <span>✓ UK coverage</span>
            </div>

            <div className="my-6 flex flex-wrap items-center justify-center gap-3.5 lg:justify-start">
              <a
                className="group inline-flex items-center gap-2.5 rounded-lg border border-white/40 bg-white px-2 py-2 text-[0.95rem] font-black text-[#13231d] shadow-[0_6px_20px_rgba(0,0,0,0.18)] transition-all duration-200 hover:-translate-y-1 hover:scale-[1.03] hover:bg-[#dff46b] hover:border-[#dff46b] hover:text-[#0b241b] hover:shadow-[0_10px_28px_rgba(223,244,107,0.45)] active:scale-95 active:translate-y-0"
                href="https://www.trustpilot.com/review/myautoscrap.co.uk"
                target="_blank"
                rel="noreferrer"
                title="View MyAutoScrap on Trustpilot"
              >
                <TrustpilotIcon className="h-12 w-12 shrink-0" />
                {/* <span className="tracking-tight">Trustpilot</span>
                <span className="text-xs text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#0b241b]">↗</span> */}
              </a>

              <a
                className="group inline-flex items-center gap-2.5 rounded-lg border border-white/40 bg-white px-2 py-2 text-[0.95rem] font-black text-[#13231d] shadow-[0_6px_20px_rgba(0,0,0,0.18)] transition-all duration-200 hover:-translate-y-1 hover:scale-[1.03] hover:bg-[#dff46b] hover:border-[#dff46b] hover:text-[#0b241b] hover:shadow-[0_10px_28px_rgba(223,244,107,0.45)] active:scale-95 active:translate-y-0"
                href="https://share.google/lppdUTbhDohi0FX8O"
                target="_blank"
                rel="noreferrer"
                title="View MyAutoScrap Google Business Profile"
              >
                <GoogleIcon className="h-12 w-12 shrink-0" />
                {/* <span className="tracking-tight">Google</span>
                <span className="text-xs text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#0b241b]">↗</span> */}
              </a>
            </div>
          </div>

          <div className="order-1 w-full min-w-0 lg:order-2">
            <QuoteFlow compact={true} />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-[#f5f8f5]">
        <div className={`${containerClass} grid gap-5 py-[19px] text-center text-sm font-extrabold text-[#355146] sm:grid-cols-2 lg:grid-cols-4`}>
          <span>✓ Instant Estimate</span>
          <span>✓ Competitive scrap prices</span>
          <span>✓ Free collection</span>
          <span>✓ Fast Payment</span>
        </div>
      </section>

      <section className={`${sectionClass} bg-slate-50`}>
        <div className={containerClass}>
          <HomeSectionTitle
            eyebrow="Simple 4-Step Process"
            title="How scrap car collection works"
            text="From instant estimate to collection from your driveway."
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([num, title, description]) => (
              <article
                className="h-full min-w-0 rounded-[18px] border border-slate-200 bg-white p-[26px] shadow-[0_8px_30px_rgba(30,70,50,0.05)]"
                key={num}
              >
                <div className="mb-[22px] grid h-12 w-12 place-items-center rounded-[13px] bg-emerald-50 text-xl font-black text-[#0f7b4f]">
                  {num}
                </div>
                <h3 className="mb-3.5 text-[1.18rem]">{title}</h3>
                <p className="m-0 text-slate-500">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <div className={containerClass}>
          <HomeSectionTitle
            eyebrow="Why MyAutoScrap"
            title="A better way to handle your old car"
          />

          <div className="grid gap-[22px] sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map(([icon, title, description]) => (
              <article
                className="h-full min-w-0 rounded-[18px] border border-slate-200 bg-white p-[26px] shadow-[0_8px_30px_rgba(30,70,50,0.05)]"
                key={title}
              >
                <div className="mb-[22px] grid h-12 w-12 place-items-center rounded-[13px] bg-emerald-50 text-xl font-black text-[#0f7b4f]">
                  {icon}
                </div>
                <h3 className="mb-3.5 text-[1.18rem]">{title}</h3>
                <p className="m-0 text-slate-500">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <div className={containerClass}>
          <HomeSectionTitle
            eyebrow="Nationwide network"
            title="Popular areas we cover"
            text="Search your postcode or explore our active service areas across the UK."
          />

          {activeLocations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
              <p className="font-semibold m-0">Our active coverage areas are updated live based on verified local dealer availability.</p>
              <Link className="mt-3 inline-block font-extrabold text-[#0f7b4f] hover:underline" to="/scrap-my-car">
                Enter your postcode to check collection in your area →
              </Link>
            </div>
          ) : (
            <div className="grid gap-[22px] md:grid-cols-3">
              {activeLocations.slice(0, 6).map((city) => (
                <article
                  className="relative overflow-hidden rounded-[18px] border border-slate-200 bg-white p-[26px] shadow-[0_8px_30px_rgba(30,70,50,0.04)] transition hover:-translate-y-1 hover:border-[#0f7b4f]/40"
                  key={city.name}
                >
                  <div className="absolute top-1 right-4 font-['Manrope'] text-[3.4rem] font-black text-slate-100 select-none">
                    {city.postcodes && city.postcodes.length > 0 ? city.postcodes[0] : city.code}
                  </div>
                  <h3 className="relative mb-2 text-[1.18rem] font-black text-slate-900">{city.name}</h3>

                  {city.postcodes && city.postcodes.length > 0 && (
                    <div className="relative mb-3 flex flex-wrap gap-1.5">
                      {city.postcodes.map((pc) => (
                        <span
                          key={pc}
                          className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-black text-[#0f7b4f] border border-emerald-200/80"
                        >
                          📮 {pc}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="relative text-sm text-slate-500 mb-4 leading-relaxed">
                    {city.description || (Array.isArray(city.areas) ? city.areas.slice(0, 4).join(', ') : city.areas)}
                  </p>
                  <Link className="relative font-extrabold text-sm text-[#0f7b4f] hover:underline" to={`/areas-we-cover/${city.slug}`}>
                    Get a local quote in {city.name} →
                  </Link>
                </article>
              ))}
            </div>
          )}

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link className={`${primaryButtonClass} w-full text-center sm:w-auto`} to="/areas-we-cover">
              View All Areas ({activeLocations.length}) →
            </Link>
            <Link className={`${secondaryButtonClass} w-full text-center sm:w-auto`} to="/scrap-my-car">
              Check Your Postcode
            </Link>
          </div>
        </div>
      </section>

      <section className={`${sectionClass} bg-[#102f24]`}>
        <div className={containerClass}>
          <HomeSectionTitle
            eyebrow="Customer experiences"
            title="What Customers say"
            light
          />

          {customerReviews.length <= 3 ? (
            <div className="grid gap-[22px] md:grid-cols-3">
              {customerReviews.map((review, idx) => (
                <article
                  className="flex flex-col justify-between rounded-[18px] border border-slate-200 bg-white p-[26px]"
                  key={review.id || review.name || idx}
                >
                  <div>
                    <div className="tracking-[2px] text-yellow-300">
                      {'★'.repeat(review.rating || 5)}
                      {'☆'.repeat(Math.max(0, 5 - (review.rating || 5)))}
                    </div>
                    <p className="mt-3 text-base text-slate-600 leading-relaxed">“{review.text}”</p>
                  </div>
                  <div className="mt-4 flex flex-col border-t border-slate-100 pt-3">
                    <b className="text-slate-900">{review.name}</b>
                    <span className="text-sm text-slate-500">
                      {review.vehicle ? `${review.vehicle} · ` : ''}{review.date}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="relative px-0 sm:px-12">
              {/* Left Arrow Button */}
              <button
                type="button"
                onClick={handlePrevReview}
                aria-label="Previous customer reviews"
                className="absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 z-20 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-[#0c261d]/90 text-white shadow-xl backdrop-blur-md transition-all hover:bg-[#dff46b] hover:text-[#0b241b] hover:border-[#dff46b] hover:scale-110 active:scale-95 cursor-pointer"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Carousel Track */}
              <div className="overflow-hidden rounded-2xl py-1">
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{
                    transform: `translateX(-${carouselIndex * (100 / visibleCards)}%)`,
                  }}
                >
                  {customerReviews.map((review, idx) => (
                    <div
                      key={review.id || review.name || idx}
                      className="w-full shrink-0 px-2.5 sm:w-1/2 lg:w-1/3"
                    >
                      <article className="flex h-full flex-col justify-between rounded-[18px] border border-slate-200 bg-white p-[26px] shadow-xs">
                        <div>
                          <div className="tracking-[2px] text-yellow-300">
                            {'★'.repeat(review.rating || 5)}
                            {'☆'.repeat(Math.max(0, 5 - (review.rating || 5)))}
                          </div>
                          <p className="mt-3 text-base text-slate-600 leading-relaxed">“{review.text}”</p>
                        </div>
                        <div className="mt-4 flex flex-col border-t border-slate-100 pt-3">
                          <b className="text-slate-900">{review.name}</b>
                          <span className="text-sm text-slate-500">
                            {review.vehicle ? `${review.vehicle} · ` : ''}{review.date}
                          </span>
                        </div>
                      </article>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Arrow Button */}
              <button
                type="button"
                onClick={handleNextReview}
                aria-label="Next customer reviews"
                className="absolute -right-2 sm:right-0 top-1/2 -translate-y-1/2 z-20 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-[#0c261d]/90 text-white shadow-xl backdrop-blur-md transition-all hover:bg-[#dff46b] hover:text-[#0b241b] hover:border-[#dff46b] hover:scale-110 active:scale-95 cursor-pointer"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Pagination Dots */}
              <div className="mt-6 flex items-center justify-center gap-2">
                {Array.from({ length: maxCarouselIndex + 1 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCarouselIndex(i)}
                    aria-label={`Jump to review slide ${i + 1}`}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      carouselIndex === i
                        ? 'w-6 bg-[#dff46b]'
                        : 'w-2 bg-white/30 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-9 flex items-center justify-center gap-[18px] text-white">
            <strong className="text-5xl">{ratingData.rating}</strong>
            <div>
              <span className="tracking-[2px] text-yellow-300">{ratingData.stars}</span>
              <p className="m-0 text-[#c8d8d1]">
                {ratingData.heading}
              </p>
            </div>
          </div>

          <div className="mt-7 text-center">
            <a
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-white hover:text-slate-900"
              href="https://g.page/r/CeBvG2VVFGN0EAI/review"
              target="_blank"
              rel="noreferrer"
            >
              <span>Give us a review</span>
              <span>↗</span>
            </a>
          </div>
        </div>
      </section>


      <section className="bg-[#0f7b4f] py-[62px] text-white">
        <div className={`${containerClass} flex flex-col items-center justify-between gap-10 text-center lg:flex-row lg:text-left`}>
          <div>
            <span className={lightEyebrowClass}>Ready when you are</span>
            <h2 className="mb-3.5 text-[clamp(2rem,4vw,3.2rem)] leading-tight">
              Get your scrap-car estimate today
            </h2>
            <p className="m-0 text-[#d8ebe2]">
              Enter your vehicle registration to calculate your instant scrap estimate.
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
