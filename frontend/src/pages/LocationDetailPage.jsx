import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router';
import { faqs, formatCityLocation } from '../data/siteData';
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

  const pageTitle = `Scrap My Car in ${location.city} | Instant Scrap Car Quote | MyAutoScrap`;
  const pageDescription = `Looking to scrap your car in ${location.city}? Get an instant valuation and arrange free vehicle collection across ${location.areas.slice(0, 4).join(', ')} and surrounding areas.`;

  const localBusinessSchema = getLocalBusinessSchema(location);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Areas We Cover', url: '/areas-we-cover' },
    { name: location.city, url: `/areas-we-cover/${location.slug}` }
  ]);
  const faqSchema = getFaqPageSchema(faqs.slice(0, 4));

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        canonical={`/areas-we-cover/${location.slug}`}
        schema={[localBusinessSchema, breadcrumbSchema, faqSchema]}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-115 from-[#0c3d2a] via-[#0f6b47] to-[#1b8a5d] text-white py-14 lg:py-20">
        <div className={`${containerClass} grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]`}>
          <div>
            <nav aria-label="Breadcrumb" className="mb-4 text-xs font-semibold text-[#dff46b] uppercase tracking-widest">
              <Link to="/" className="hover:underline">Home</Link> / <Link to="/areas-we-cover" className="hover:underline">Areas</Link> / <span className="text-white">{location.city}</span>
            </nav>

            <h1 className="mb-4 text-3xl sm:text-5xl font-black leading-tight tracking-tight">
              Scrap Car Collection in <span className="text-[#dff46b]">{location.city}</span>
            </h1>

            <p className="mb-6 text-lg leading-relaxed text-[#dcece5]">
              {location.description} We buy non-runners, MOT failures, damaged cars, and salvage vehicles across {location.city} with free home or workplace collection.
            </p>

            <div className="flex flex-wrap gap-4 font-bold text-sm">
              <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">✓ Free {location.city} Pickup</span>
              <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">✓ Instant Bank Payment</span>
              <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">✓ DVLA Paperwork Assistance</span>
            </div>
          </div>

          <div className="w-full">
            <QuoteFlow compact />
          </div>
        </div>
      </section>

      {/* Specific Covered Districts */}
      <section className="py-16 bg-white">
        <div className={containerClass}>
          <div className="max-w-3xl mb-10">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#0f7b4f]">Local Coverage</span>
            <h2 className="text-3xl font-extrabold mt-1 text-slate-900">
              Areas & Districts Covered Around {location.city}
            </h2>
            <p className="text-slate-600 mt-2">
              Our scrap vehicle recovery transporters operate daily throughout {location.city} and neighboring postcodes:
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {location.areas.map((area) => (
              <div key={area} className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 flex items-center gap-2">
                <span className="text-[#0f7b4f]">📍</span>
                <span>{area}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-slate-100 p-8 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Live in or near {location.city}?</h3>
              <p className="text-slate-600">Get an instant guaranteed valuation for your vehicle in under 60 seconds.</p>
            </div>
            <Link to="/scrap-my-car" className={primaryButtonClass}>
              Get Scrap Quote Now
            </Link>
          </div>
        </div>
      </section>

      {/* Local FAQs */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className={containerClass}>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#0f7b4f]">Questions & Answers</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Scrapping a Car in {location.city} FAQs</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.slice(0, 4).map(([q, a]) => (
              <div key={q} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
                <h3 className="font-bold text-lg text-slate-900 mb-2">{q}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{a}</p>
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
