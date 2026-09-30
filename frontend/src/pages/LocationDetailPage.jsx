import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router';
import { formatCityLocation, CITY_CONTENT_OVERRIDES, getDefaultCityFaqs } from '../data/siteData';
import { fetchSupportedCities } from '../services/adminStore';
import SEO from '../components/Seo';
import { getLocalBusinessSchema, getBreadcrumbSchema, getFaqPageSchema } from '../config/seo.config';
import QuoteFlow from '../components/QuoteFlow';

const containerClass = 'mx-auto w-[calc(100%-36px)] max-w-[1180px]';
const primaryButtonClass =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-[#0f7b4f] px-[22px] py-3.5 font-extrabold text-white shadow-[0_10px_25px_rgba(15,123,79,0.23)] transition hover:-translate-y-0.5 hover:bg-[#075b3a]';
const secondaryButtonClass =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-[22px] py-3.5 font-extrabold text-slate-950 transition hover:-translate-y-0.5';

export default function LocationDetailPage() {
  const { slug } = useParams();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCityDetail() {
      setLoading(true);
      try {
        const cities = await fetchSupportedCities({ active: 'true' });
        const matched = (cities || []).find(
          (c) => (c.slug || c.name.toLowerCase()).toLowerCase() === slug?.toLowerCase(),
        );
        if (matched) {
          setLocation(formatCityLocation(matched));
        } else {
          setLocation(null);
        }
      } catch (err) {
        console.error('Error finding city detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCityDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-sm font-bold text-gray-500">
        Loading coverage details...
      </div>
    );
  }

  if (!location) {
    return <Navigate to="/areas-we-cover" replace />;
  }

  const override = CITY_CONTENT_OVERRIDES[location.slug];

  // 1. Dynamic SEO Titles & Meta Descriptions
  const pageTitle = override?.title || `Scrap My Car ${location.city} | Free Collection | MyAutoScrap`;
  const pageDescription = override?.description || `Scrap your car in ${location.city} with MyAutoScrap. Get a fast online valuation and free collection across supported areas in and around ${location.city}.`;

  // 2. Dynamic Copy Elements
  const heroCopy = override?.heroCopy || `Looking to scrap your car in ${location.city}? Get a fast online scrap car valuation using your registration and postcode, with free collection across supported areas in and around ${location.city}.`;

  const collectionHeading = override?.collectionHeading || `Free Scrap Car Collection in ${location.city}`;
  const collectionCopy = override?.collectionCopy || [
    `MyAutoScrap arranges free scrap car collection across supported areas in and around ${location.city}. Enter your postcode in the quote tool to confirm availability for your exact location.`,
    `If you're looking to scrap a car in ${location.city}, MyAutoScrap provides a simple online quote and collection process across supported areas.`
  ];

  const conditionHeading = override?.conditionHeading || `Scrapping Non-Running or MOT-Failed Cars in ${location.city}`;
  const conditionCopy = override?.conditionCopy || [
    `If your vehicle is non-running or has failed its MOT, you do not need to drive it to a scrap yard. Collection can be arranged directly from your location where supported in and around ${location.city}.`,
    `An active MOT is not required for scrap car collection where supported by our collection network.`
  ];

  const hasCoverageItems = Boolean(
    override ||
    location.hasNamedAreas ||
    (location.postcodes && location.postcodes.length > 0)
  );

  // 3. Dynamic Local Coverage & Suburbs
  const coverageHeading = override?.coverageHeading || (
    location.hasNamedAreas
      ? `Areas & Districts Covered Around ${location.city}`
      : (location.postcodes && location.postcodes.length > 0
          ? `Postcode Coverage in and Around ${location.city}`
          : `Collection Coverage in and Around ${location.city}`)
  );

  const coverageIntro = override?.coverageIntro || (
    location.hasNamedAreas
      ? `We arrange vehicle collection across ${location.city} and supported surrounding areas. Enter your postcode in the quote tool to confirm availability for your exact address.`
      : (location.postcodes && location.postcodes.length > 0
          ? `Supported postcode districts currently include: ${location.postcodes.join(', ')}. The registration and postcode quote tool remains the authoritative way to confirm collection availability for your exact address.`
          : `MyAutoScrap arranges free vehicle collection across supported areas in and around ${location.city}. Enter your postcode in the quote tool to confirm availability for your exact location.`)
  );

  // 4. Dynamic FAQs & Schemas
  const faqItems = override?.faqs || getDefaultCityFaqs(location.city);
  const faqHeading = override?.faqsHeading || `${location.city} Scrap Car FAQs`;

  const serviceSchema = getLocalBusinessSchema(location);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Areas We Cover', url: '/areas-we-cover' },
    { name: location.city, url: `/areas-we-cover/${location.slug}` }
  ]);
  const faqSchema = getFaqPageSchema(faqItems);

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        canonical={`/areas-we-cover/${location.slug}`}
        schema={[serviceSchema, breadcrumbSchema, faqSchema]}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-115 from-[#0c3d2a] via-[#0f6b47] to-[#1b8a5d] text-white py-14 lg:py-20">
        <div className={`${containerClass} grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]`}>
          <div>
            <nav aria-label="Breadcrumb" className="mb-4 text-xs font-semibold text-[#dff46b] uppercase tracking-widest">
              <Link to="/" className="hover:underline">Home</Link> / <Link to="/areas-we-cover" className="hover:underline">Areas</Link> / <span className="text-white">{location.city}</span>
            </nav>

            <h1 className="mb-4 text-3xl sm:text-5xl font-black leading-tight tracking-tight">
              {override?.h1 || (
                <>Scrap My Car in <span className="text-[#dff46b]">{location.city}</span></>
              )}
            </h1>

            <p className="mb-6 text-lg leading-relaxed text-[#dcece5]">
              {heroCopy}
            </p>

            <div className="flex flex-wrap gap-4 font-bold text-sm">
              <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">✓ Free {location.city} Pickup</span>
              <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">✓ Direct Bank Payment</span>
              <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">✓ DVLA Paperwork Assistance</span>
            </div>
          </div>

          <div className="w-full">
            <QuoteFlow compact />
          </div>
        </div>
      </section>

      {/* Local Collection Section */}
      <section className="py-14 bg-white border-b border-slate-100">
        <div className={containerClass}>
          <div className="max-w-3xl">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#0f7b4f]">Direct Collection</span>
            <h2 className="text-3xl font-extrabold mt-1 text-slate-900">
              {collectionHeading}
            </h2>
            <div className="mt-3 space-y-3 text-slate-600 leading-relaxed">
              {collectionCopy.map((para, i) => (
                <p key={i} className="m-0">{para}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Specific Covered Districts / Areas */}
      <section className="py-16 bg-slate-50">
        <div className={containerClass}>
          <div className="max-w-3xl mb-10">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#0f7b4f]">Local Coverage</span>
            <h2 className="text-3xl font-extrabold mt-1 text-slate-900">
              {coverageHeading}
            </h2>
            <p className="text-slate-600 mt-2">
              {coverageIntro}
            </p>
          </div>

          {/* Area cards: prioritizes verified named areas when present, or clear postcode districts */}
          {hasCoverageItems ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {override ? (
                location.areas.map((area) => (
                  <div key={area} className="p-4 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 flex items-center gap-2">
                    <span className="text-[#0f7b4f]">📮</span>
                    <span>{area}</span>
                  </div>
                ))
              ) : location.hasNamedAreas ? (
                location.namedAreas.map((area) => (
                  <div key={area} className="p-4 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 flex items-center gap-2">
                    <span className="text-[#0f7b4f]">📍</span>
                    <span>{area}</span>
                  </div>
                ))
              ) : (
                location.postcodes.map((pc) => (
                  <div key={pc} className="p-4 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 flex items-center gap-2">
                    <span className="text-[#0f7b4f]">📮</span>
                    <span>{pc} District</span>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-700">
              <p className="m-0 text-base leading-relaxed">
                MyAutoScrap arranges free scrap car collection across supported areas in and around {location.city}. Enter your postcode in the quote tool to confirm availability for your exact location.
              </p>
            </div>
          )}

          {/* If named areas are shown, also display verified outward postcodes context */}
          {!override && location.hasNamedAreas && location.postcodes && location.postcodes.length > 0 && (
            <p className="text-xs text-slate-500 mt-4">
              Supported outward postcode districts currently include: {location.postcodes.join(', ')}. The registration and postcode quote tool remains the authoritative way to confirm availability for your address.
            </p>
          )}

          <div className="mt-6">
            <Link to="/areas-we-cover" className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0f7b4f] hover:underline">
              <span>View all scrap car collection areas →</span>
            </Link>
          </div>

          <div className="mt-12 bg-white p-8 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Live in or near {location.city}?</h3>
              <p className="text-slate-600 mt-1 mb-0">Get an estimated valuation for your vehicle in seconds. Learn <Link to="/how-it-works" className="text-[#0f7b4f] font-bold hover:underline">how scrap car collection works</Link> in our step-by-step guide.</p>
            </div>
            <Link to="/scrap-my-car" className={primaryButtonClass}>
              Get a Scrap Car Quote
            </Link>
          </div>
        </div>
      </section>

      {/* Vehicle Conditions Section */}
      <section className="py-14 bg-white border-t border-slate-100">
        <div className={containerClass}>
          <div className="max-w-3xl">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#0f7b4f]">Vehicle Condition</span>
            <h2 className="text-3xl font-extrabold mt-1 text-slate-900">
              {conditionHeading}
            </h2>
            <div className="mt-3 space-y-3 text-slate-600 leading-relaxed">
              {conditionCopy.map((para, i) => (
                <p key={i} className="m-0">{para}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Local FAQs */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className={containerClass}>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#0f7b4f]">Questions & Answers</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
              {faqHeading}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqItems.map(([q, a]) => (
              <div key={q} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
                <h3 className="font-bold text-lg text-slate-900 mb-2">{q}</h3>
                <p className="text-slate-600 text-sm leading-relaxed m-0">{a}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link to="/faqs" className={secondaryButtonClass}>
              View All Frequently Asked Questions
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
